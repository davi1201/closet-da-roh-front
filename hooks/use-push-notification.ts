import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { notifications } from '@mantine/notifications'; // Para mostrar notificação em foreground

import api from '@/lib/api'; // Sua instância axios

import { app } from '@/lib/firebase/firebase';
import { useAuthStore } from '@/store';

const VAPID_KEY =
  'BNI_MjLnBVTetqu5mDnqliEdMZ05KbQqVzZwWknxeLPA6A19DZ0kvn0yUJ3AUO-V4ljfRBb_mZYj3HxWdPR93ME';

export function usePushNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const userInfo = useAuthStore((state) => state.userInfo); // Pega o usuário logado

  // Função para solicitar permissão
  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.error('Este navegador não suporta notificações.');
      return;
    }

    try {
      const status = await Notification.requestPermission();
      setPermissionStatus(status);
      if (status === 'granted') {
        console.log('Permissão para notificações concedida.');
        await setupToken(); // Pega o token se a permissão foi dada
      } else {
        console.log('Permissão para notificações negada.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    }
  };

  // Função para obter e salvar o token FCM
  const setupToken = async () => {
    if (!VAPID_KEY) {
      console.error('Chave VAPID do Firebase não configurada!');
      return;
    }
    if (typeof window === 'undefined' || !navigator.serviceWorker) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const messaging = getMessaging(app);

      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration, // Passa o registro
      });

      if (currentToken) {
        console.log('Token FCM obtido:', currentToken);
        setFcmToken(currentToken);

        // Envia o token para o backend APENAS se estiver logado
        if (userInfo?._id) {
          const storedToken = localStorage.getItem('fcmToken');
          // Envia apenas se for um token novo ou diferente
          if (currentToken !== storedToken) {
            try {
              await api.post('/users/save-fcm-token', { token: currentToken });
              localStorage.setItem('fcmToken', currentToken); // Salva localmente
              console.log('Token FCM enviado para o backend.');
            } catch (apiError) {
              console.error('Erro ao enviar token FCM para o backend:', apiError);
            }
          }
        }
      } else {
        console.log('Não foi possível obter o token FCM. Permissão necessária?');
        // (Opcional) Tentar solicitar permissão novamente?
        // requestPermission();
      }
    } catch (error) {
      console.error('Erro ao obter token FCM:', error);
    }
  };

  useEffect(() => {
    // Tenta pegar o token se a permissão já foi concedida
    if (permissionStatus === 'granted') {
      setupToken();
    }

    // Configura o listener para mensagens em PRIMEIRO PLANO
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messagingInstance = getMessaging(app);
      const unsubscribe = onMessage(messagingInstance, (payload) => {
        console.log('Mensagem recebida em foreground: ', payload);
        // Mostra a notificação usando Mantine Notifications
        notifications.show({
          title: payload.notification?.title || 'Nova Notificação',
          message: payload.notification?.body || '',
          color: 'blue',
        });
      });

      // Limpa o listener ao desmontar
      return () => unsubscribe();
    }
  }, [permissionStatus, userInfo]); // Re-executa se o status de permissão ou usuário mudar

  return { requestPermission, permissionStatus, fcmToken };
}
