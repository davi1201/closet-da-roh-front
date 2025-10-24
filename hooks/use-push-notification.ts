import React, { useCallback, useEffect, useState } from 'react';
// --- AJUSTE 1: Importe os ícones necessários ---
import { IconAlertCircle, IconBell, IconCalendarEvent, IconHeart } from '@tabler/icons-react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { notifications } from '@mantine/notifications';
import api from '@/lib/api';
import { app } from '@/lib/firebase/firebase'; // Verifique este caminho
import { useAuthStore } from '@/store';

const VAPID_KEY =
  'BNI_MjLnBVTetqu5mDnqliEdMZ05KbQqVzZwWknxeLPA6A19DZ0kvn0yUJ3AUO-V4ljfRBb_mZYj3HxWdPR93ME';

export function usePushNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const userInfo = useAuthStore((state) => state.userInfo);

  const setupToken = useCallback(async () => {
    if (!VAPID_KEY) {
      console.error('Chave VAPID do Firebase não configurada!');
      return;
    }
    if (typeof window === 'undefined' || !navigator.serviceWorker) {
      console.warn('Service Worker não suportado ou ambiente de servidor.');
      return;
    }

    console.log('[SetupToken] Iniciando...');

    try {
      const registration = await navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((r) => {
          console.log('[SetupToken] SW registrado com sucesso');
          return r;
        })
        .catch((error) => {
          console.error('[SetupToken] Falha ao registrar o Service Worker:', error);
          throw error;
        });

      if (!registration) return;

      console.log('[SetupToken] Aguardando serviceWorker.ready...');
      await navigator.serviceWorker.ready;
      console.log('[SetupToken] ServiceWorker pronto.');

      const messaging = getMessaging(app);
      console.log('[SetupToken] Chamando getToken...');

      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        console.log('[SetupToken] Token FCM obtido:', currentToken);
        setFcmToken(currentToken);

        if (userInfo?._id) {
          const storedToken = localStorage.getItem('fcmToken');
          if (currentToken !== storedToken) {
            try {
              console.log('[SetupToken] Enviando token para o backend...');
              await api.post('/users/save-fcm-token', { token: currentToken });
              localStorage.setItem('fcmToken', currentToken);
              console.log('[SetupToken] Token FCM enviado para o backend.');
            } catch (apiError) {
              console.error('[SetupToken] Erro ao enviar token FCM:', apiError);
            }
          } else {
            console.log('[SetupToken] Token FCM já salvo localmente.');
          }
        } else {
          console.log('[SetupToken] Usuário não logado, token não enviado.');
        }
      } else {
        console.warn(
          '[SetupToken] Não foi possível obter o token FCM. Permissão pode ter sido revogada ou SW não está ativo?'
        );
      }
    } catch (error) {
      console.error('[SetupToken] Erro durante setupToken:', error);
    }
  }, [userInfo]);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.error('Este navegador não suporta notificações.');
      return;
    }

    try {
      console.log('[RequestPermission] Solicitando permissão...');
      const status = await Notification.requestPermission();
      console.log('[RequestPermission] Resultado:', status);
      setPermissionStatus(status);
    } catch (error) {
      console.error('[RequestPermission] Erro ao solicitar permissão:', error);
    }
  }, []);

  useEffect(() => {
    console.log('[Effect] Verificando permissão:', permissionStatus);
    if (permissionStatus === 'granted') {
      console.log('[Effect] Permissão concedida, chamando setupToken...');
      setupToken();
    }

    let unsubscribe: (() => void) | undefined;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && app) {
      try {
        const messagingInstance = getMessaging(app);
        unsubscribe = onMessage(messagingInstance, (payload) => {
          console.log('[OnMessage] Mensagem recebida em foreground: ', payload);

          // --- AJUSTE 2: Lógica condicional para ícone e cor ---
          let notificationIcon: React.ReactNode = React.createElement(IconBell, { size: 18 }); // Ícone padrão
          let notificationColor = 'blue'; // Cor padrão

          // Verifica o 'type' dentro do 'data' payload
          switch (payload.data?.type) {
            case 'NEW_APPOINTMENT':
              notificationIcon = React.createElement(IconCalendarEvent, { size: 18 });
              notificationColor = 'cyan';
              break;
            case 'PRODUCT_LIKED':
              notificationIcon = React.createElement(IconHeart, { size: 18 });
              notificationColor = 'pink';
              break;
            case 'LOW_STOCK':
              notificationIcon = React.createElement(IconAlertCircle, { size: 18 });
              notificationColor = 'red';
              break;
            // Adicione mais casos conforme necessário
            default:
              // Mantém os padrões se o tipo não for reconhecido
              break;
          }

          notifications.show({
            title: payload.notification?.title || 'Nova Notificação',
            message: payload.notification?.body || '',
            color: notificationColor, // Usa a cor definida
            icon: notificationIcon, // Usa o ícone definido
            autoClose: false,
            withCloseButton: true,
            // (Opcional) Adicionar onClick para levar à página relevante
            // onClick: () => {
            //   if (payload.data?.url) {
            //      window.location.href = payload.data.url;
            //   }
            // }
          });
          // --- FIM DO AJUSTE 2 ---
        });
      } catch (error) {
        console.error('[OnMessage] Erro ao configurar listener:', error);
      }
    }

    return () => {
      if (unsubscribe) {
        console.log('[Effect] Limpando listener onMessage.');
        unsubscribe();
      }
    };
  }, [permissionStatus, setupToken]);

  return { requestPermission, permissionStatus, fcmToken };
}
