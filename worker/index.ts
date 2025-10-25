// worker/index.ts
/// <reference lib="webworker" />

import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

declare const self: ServiceWorkerGlobalScope;

// ==========================================
// CONFIGURAÇÃO DO FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: 'AIzaSyA0W2KehZ4IVXm9cxTO-Q4btEgF7bs53uk',
  authDomain: 'closet-da-roh.firebaseapp.com',
  projectId: 'closet-da-roh',
  storageBucket: 'closet-da-roh.firebasestorage.app',
  messagingSenderId: '6502806455',
  appId: '1:6502806455:web:7d8ed24f5ca038e3056e32',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ==========================================
// FIREBASE CLOUD MESSAGING - BACKGROUND
// ==========================================
onBackgroundMessage(messaging, (payload) => {
  console.log('[Service Worker] Mensagem em background recebida:', payload);

  const notificationTitle = payload.notification?.title || 'Closet da Roh';
  const notificationBody = payload.notification?.body || 'Nova notificação';

  let icon = '/icon-192x192.png';
  let badge = '/icon-96x96.png';

  switch (payload.data?.type) {
    case 'NEW_APPOINTMENT':
      icon = '/icons/calendar.png';
      break;
    case 'PRODUCT_LIKED':
      icon = '/icons/heart.png';
      break;
    case 'LOW_STOCK':
      icon = '/icons/alert.png';
      break;
  }

  const notificationOptions: NotificationOptions = {
    body: notificationBody,
    icon: icon,
    badge: badge,
    tag: payload.data?.type || 'default',
    data: {
      ...payload.data,
      url: payload.data?.url || '/',
    },
    requireInteraction: false,
    //@ts-ignore
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ==========================================
// PWA - EVENT LISTENERS (Apenas os de Notificação)
// ==========================================

// 1. CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificação clicada:', event);

  const notification = event.notification;
  const action = event.action;
  notification.close();

  if (action === 'close') {
    return;
  }

  const urlToOpen = notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 2. FECHAR NOTIFICAÇÃO
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notificação fechada:', event.notification);
});

// 3. PUSH EVENT (Backup para o onBackgroundMessage)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recebido:', event);
  // O onBackgroundMessage do Firebase já deve cuidar disso,
  // mas é bom manter para garantir.
});

// 4. MESSAGE (comunicação com a aplicação)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensagem recebida da app:', event.data);

  // O next-pwa já cuida do 'SKIP_WAITING' se você ativou 'skipWaiting: true'
  // no next.config.js (o que você fez 👍)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 5. INSTALAÇÃO E ATIVAÇÃO (Apenas para o skipWaiting e claim)
// O next-pwa/workbox vai injetar o código de cache DEPOIS disso.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando (Firebase)...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando (Firebase)...');
  event.waitUntil(self.clients.claim());
});

console.log('[Service Worker] Lógica customizada (Firebase) carregada! 🚀');
