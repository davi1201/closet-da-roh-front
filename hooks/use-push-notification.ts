'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { IconAlertCircle, IconBell, IconCalendarEvent, IconHeart } from '@tabler/icons-react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { notifications } from '@mantine/notifications';
import api from '@/lib/api';
import { app } from '@/lib/firebase/firebase';
import { useAuthStore } from '@/store';

const VAPID_KEY =
  'BNI_MjLnBVTetqu5mDnqliEdMZ05KbQqVzZwWknxeLPA6A19DZ0kvn0yUJ3AUO-V4ljfRBb_mZYj3HxWdPR93ME';

export function usePushNotifications() {
  const [isClient, setIsClient] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const userInfo = useAuthStore((state) => state.userInfo);

  // Garante que está no cliente antes de fazer qualquer coisa
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const setupToken = useCallback(async () => {
    // Proteção: só executa no cliente
    if (!isClient || typeof window === 'undefined') {
      console.log('[SetupToken] Aguardando ambiente cliente...');
      return;
    }

    if (!VAPID_KEY) {
      console.error('[SetupToken] Chave VAPID do Firebase não configurada!');
      return;
    }

    if (!navigator.serviceWorker) {
      console.warn('[SetupToken] Service Worker não suportado.');
      return;
    }

    console.log('[SetupToken] Iniciando...');

    try {
      // ✅ MUDANÇA CRÍTICA: Agora usa /sw.js (gerado pelo PWA + Firebase)
      const registration = await navigator.serviceWorker
        .register('/sw.js')
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
          '[SetupToken] Não foi possível obter o token FCM. Permissão pode ter sido revogada.'
        );
      }
    } catch (error) {
      console.error('[SetupToken] Erro durante setupToken:', error);
    }
  }, [userInfo, isClient]);

  const requestPermission = useCallback(async () => {
    if (!isClient || typeof window === 'undefined' || !('Notification' in window)) {
      console.error('[RequestPermission] Este navegador não suporta notificações.');
      return;
    }

    try {
      console.log('[RequestPermission] Solicitando permissão...');
      const status = await Notification.requestPermission();
      console.log('[RequestPermission] Resultado:', status);
      setPermissionStatus(status);

      // Se concedeu, mostra notificação de confirmação
      if (status === 'granted') {
        notifications.show({
          title: '✅ Notificações Ativadas!',
          message: 'Você receberá atualizações sobre agendamentos e produtos.',
          color: 'green',
          icon: React.createElement(IconBell, { size: 18 }),
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('[RequestPermission] Erro ao solicitar permissão:', error);
    }
  }, [isClient]);

  useEffect(() => {
    // Só executa se estiver no cliente
    if (!isClient) return;

    console.log('[Effect] Verificando permissão:', permissionStatus);
    if (permissionStatus === 'granted') {
      console.log('[Effect] Permissão concedida, chamando setupToken...');
      setupToken();
    }

    let unsubscribe: (() => void) | undefined;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && app) {
      try {
        const messagingInstance = getMessaging(app);

        // FOREGROUND: Mensagens quando o app está aberto
        unsubscribe = onMessage(messagingInstance, (payload) => {
          console.log('[OnMessage] Mensagem recebida em FOREGROUND:', payload);

          let notificationIcon: React.ReactNode = React.createElement(IconBell, { size: 18 });
          let notificationColor = 'blue';

          // Personaliza baseado no tipo
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
            default:
              break;
          }

          // Exibe notificação in-app (Mantine)
          notifications.show({
            title: payload.notification?.title || 'Nova Notificação',
            message: payload.notification?.body || '',
            color: notificationColor,
            icon: notificationIcon,
            autoClose: 8000,
            withCloseButton: true,
            onClick: () => {
              // Navega para URL se houver
              if (payload.data?.url) {
                window.location.href = payload.data.url;
              }
            },
          });

          // OPCIONAL: Também exibe notificação nativa do navegador
          // (mesmo com app aberto, se quiser redundância)
          // Descomente as linhas abaixo se quiser notificação dupla:
          /*
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.notification?.title || 'Closet da Roh', {
              body: payload.notification?.body || '',
              icon: '/icon-192x192.png',
              badge: '/icon-96x96.png',
              tag: payload.data?.type || 'default',
              data: payload.data,
            });
          }
          */
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
  }, [permissionStatus, setupToken, isClient]);

  // Função helper para testar notificação (útil para debug)
  const testNotification = useCallback(() => {
    if (!isClient || typeof window === 'undefined' || Notification.permission !== 'granted') {
      console.warn('[TestNotification] Permissão não concedida');
      notifications.show({
        title: '❌ Permissão Negada',
        message: 'Ative as notificações primeiro!',
        color: 'red',
        autoClose: 3000,
      });
      return;
    }

    // Notificação in-app
    notifications.show({
      title: '🧪 Notificação de Teste',
      message: 'Se você vê isso, as notificações in-app estão funcionando!',
      color: 'violet',
      icon: React.createElement(IconBell, { size: 18 }),
      autoClose: 5000,
    });

    // Notificação nativa
    new Notification('🧪 Teste do PWA', {
      body: 'Notificação nativa funcionando!',
      icon: '/icon-192x192.png',
      badge: '/icon-96x96.png',
      tag: 'test',
      data: { url: '/' },
    });
  }, [isClient]);

  return {
    requestPermission,
    permissionStatus,
    fcmToken,
    isClient,
    testNotification, // Exporta função de teste
  };
}
