import { initializeApp } from 'firebase/app';

import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCST4MUYgPznCQRbgoSPWRcCCFFfkaia5k',
  authDomain: 'chat-app-720c9.firebaseapp.com',
  projectId: 'chat-app-720c9',
  storageBucket: 'chat-app-720c9.appspot.com',
  messagingSenderId: '208245062974',
  appId: '1:208245062974:web:5d65bdfa711f4af7b1006f',
  measurementId: 'G-VQQYNXMW30',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
