// Importa scripts do Firebase (necessário)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Cole aqui sua configuração do Firebase (igual ao lib/firebase.ts)
const firebaseConfig = {
  apiKey: 'AIzaSyA0W2KehZ4IVXm9cxTO-Q4btEgF7bs53uk',
  authDomain: 'closet-da-roh.firebaseapp.com',
  projectId: 'closet-da-roh',
  storageBucket: 'closet-da-roh.firebasestorage.app',
  messagingSenderId: '6502806455',
  appId: 'G-7ELWZD2ZQS',
};

// Log para depuração (opcional, pode remover depois)
console.log('[SW] Firebase Config:', firebaseConfig);

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Obtém a instância do Messaging
const messaging = firebase.messaging();

// (Opcional) Manipulador para notificações em SEGUNDO PLANO
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png', // Ícone do seu PWA
  };

  // Mostra a notificação usando a API de Service Worker
  self.registration.showNotification(notificationTitle, notificationOptions);
});
