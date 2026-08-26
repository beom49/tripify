import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱(SDK 설정 및 구성)에서 복사해 채워주세요.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY || '여기에_API_KEY',
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN || '여기에_프로젝트.firebaseapp.com',
  projectId: import.meta.env.VITE_FB_PROJECT_ID || '여기에_프로젝트_ID',
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || '여기에_프로젝트.appspot.com',
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID || '여기에_SENDER_ID',
  appId: import.meta.env.VITE_FB_APP_ID || '여기에_APP_ID'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
