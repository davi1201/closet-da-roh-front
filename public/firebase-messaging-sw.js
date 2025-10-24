// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// --- CORREÇÃO OBRIGATÓRIA ---
// Cole os valores REAIS do seu Firebase config aqui
const firebaseConfig = {
  apiKey: 'AIzaSyA0W2KehZ4IVXm9cxTO-Q4btEgF7bs53uk', // Seu valor real
  authDomain: 'closet-da-roh.firebaseapp.com', // Seu valor real
  projectId: 'closet-da-roh', // Seu valor real
  storageBucket: 'closet-da-roh.firebasestorage.app', // Seu valor real
  messagingSenderId: '6502806455', // Seu valor real
  appId: '1:6502806455:web:7d8ed24f5ca038e3056e32', // <-- Use o Web App ID CORRETO
  // O measurementId (G-...) não é necessário aqui
};
// --- FIM DA CORREÇÃO ---

console.log('[SW] Firebase Config:', firebaseConfig);

try {
  firebase.initializeApp(firebaseConfig);
  console.log('[SW] Firebase App inicializado.');

  const messaging = firebase.messaging();
  console.log('[SW] Firebase Messaging inicializado.');

  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message ', payload);
    const notificationTitle = payload?.notification?.title || 'Nova Notificação';
    const notificationOptions = {
      body: payload?.notification?.body || 'Teste de notificação em segundo plano.',
      icon: payload?.notification?.image || '',
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
  console.log('[SW] Listener onBackgroundMessage configurado.');
} catch (error) {
  console.error('[SW] Erro ao inicializar Firebase:', error);
}

// Opcional: Logs de ciclo de vida para debug
self.addEventListener('install', () => console.log('[SW] Instalando...'));
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativado!');
  event.waitUntil(clients.claim());
});
