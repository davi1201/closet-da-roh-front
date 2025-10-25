// worker/index.ts
/// <reference lib="webworker" />

import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

declare const self: ServiceWorkerGlobalScope;

// ==========================================
// CONFIGURAÇÃO DO FIREBASE
// ==========================================
// ⚠️ IMPORTANTE: Substitua pelos seus valores reais do Firebase Console
// Use as MESMAS credenciais do seu lib/firebase/firebase.ts
const firebaseConfig = {
  apiKey: 'AIzaSyA0W2KehZ4IVXm9cxTO-Q4btEgF7bs53uk',
  authDomain: 'closet-da-roh.firebaseapp.com',
  projectId: 'closet-da-roh',
  storageBucket: 'closet-da-roh.firebasestorage.app',
  messagingSenderId: '6502806455',
  appId: '1:6502806455:web:7d8ed24f5ca038e3056e32',
};

// Inicializa Firebase no Service Worker
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ==========================================
// FIREBASE CLOUD MESSAGING - BACKGROUND
// ==========================================
onBackgroundMessage(messaging, (payload) => {
  console.log('[Service Worker] Mensagem em background recebida:', payload);

  // Extrai informações da notificação
  const notificationTitle = payload.notification?.title || 'Closet da Roh';
  const notificationBody = payload.notification?.body || 'Nova notificação';

  // Define ícone e badge baseado no tipo
  let icon = '/icon-192x192.png';
  let badge = '/icon-96x96.png';

  // Personaliza baseado no tipo de notificação
  switch (payload.data?.type) {
    case 'NEW_APPOINTMENT':
      icon = '/icons/calendar.png'; // Opcional: crie ícones específicos
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
    tag: payload.data?.type || 'default', // Agrupa notificações do mesmo tipo
    data: {
      ...payload.data,
      url: payload.data?.url || '/', // URL para abrir ao clicar
    },
    requireInteraction: false, // Auto-fecha após alguns segundos
    //@ts-ignore
    actions: [
      {
        action: 'open',
        title: 'Abrir',
      },
      {
        action: 'close',
        title: 'Fechar',
      },
    ],
  };

  // Exibe a notificação
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ==========================================
// PWA - EVENT LISTENERS
// ==========================================

// 1. INSTALAÇÃO DO SERVICE WORKER
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  // Força o SW a ativar imediatamente
  self.skipWaiting();
});

// 2. ATIVAÇÃO DO SERVICE WORKER
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  // Toma controle de todas as abas imediatamente
  event.waitUntil(self.clients.claim());
});

// 3. CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificação clicada:', event);

  const notification = event.notification;
  const action = event.action;

  // Fecha a notificação
  notification.close();

  // Se o usuário clicou em "fechar", não faz nada
  if (action === 'close') {
    return;
  }

  // Obtém a URL da notificação ou usa a home
  const urlToOpen = notification.data?.url || '/';

  // Tenta focar em uma aba existente ou abre nova
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Procura por uma aba já aberta com a URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não encontrou, abre nova aba
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 4. FECHAR NOTIFICAÇÃO
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notificação fechada:', event.notification);
  // Opcional: enviar analytics sobre notificação fechada
});

// 5. PUSH EVENT (alternativa ao onBackgroundMessage)
// Isso captura pushes mesmo que o Firebase não processe
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recebido:', event);

  // Se o Firebase já processou, não faz nada
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[Service Worker] Push payload:', payload);

      // O onBackgroundMessage do Firebase já cuida disso
      // Mas você pode adicionar lógica customizada aqui se necessário
    } catch (error) {
      console.error('[Service Worker] Erro ao processar push:', error);
    }
  }
});

// 6. MESSAGE (comunicação com a aplicação)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensagem recebida da app:', event.data);

  // Permite que a app envie comandos para o SW
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Exemplo: forçar atualização do cache
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      })
    );
  }
});

// ==========================================
// PWA - ESTRATÉGIAS DE CACHE (OPCIONAL)
// ==========================================

const CACHE_NAME = 'closet-da-roh-v1';
const urlsToCache = ['/', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png'];

// Cache inicial na instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cache aberto');
      return cache.addAll(urlsToCache);
    })
  );
});

// Estratégia de fetch: Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET ou de outros domínios
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta é válida, clona e armazena no cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se a network falhar, tenta o cache
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('Network error', { status: 408 });
        });
      })
  );
});

// Limpa caches antigos na ativação
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

console.log('[Service Worker] Carregado e pronto! 🚀');
