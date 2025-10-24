import { getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyA0W2KehZ4IVXm9cxTO-Q4btEgF7bs53uk',
  authDomain: 'closet-da-roh.firebaseapp.com',
  projectId: 'closet-da-roh',
  storageBucket: 'closet-da-roh.firebasestorage.app',
  messagingSenderId: '6502806455',
  appId: '1:6502806455:web:7d8ed24f5ca038e3056e32',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Adiciona verificação extra para messaging
let messaging = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
    // console.log('[Firebase Client] Messaging inicializado');
  } catch (error) {
    console.error('[Firebase Client] Erro ao inicializar Messaging:', error);
  }
}

export { app, messaging }; // Exporte a variável messaging (pode ser null)
