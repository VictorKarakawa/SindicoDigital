import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import Constants from 'expo-constants';

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUÇÕES DE CONFIGURAÇÃO:
// 1. Acesse https://console.firebase.google.com
// 2. Crie um projeto chamado "sindico-digital"
// 3. Adicione um app Web e copie as credenciais
// 4. Ative "Authentication" → Email/Password
// 5. Ative "Realtime Database" e configure as regras
// 6. Substitua os valores abaixo pelas suas credenciais
//    ou configure em app.json → extra → firebase*
// ─────────────────────────────────────────────────────────────────────────────

const extra = Constants.expoConfig?.extra ?? {};

export const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY            ?? extra.firebaseApiKey            ?? '',
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? extra.firebaseAuthDomain        ?? '',
  databaseURL:       process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL       ?? extra.firebaseDatabaseURL       ?? '',
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID         ?? extra.firebaseProjectId         ?? '',
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? extra.firebaseStorageBucket     ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? extra.firebaseMessagingSenderId ?? '',
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID             ?? extra.firebaseAppId             ?? '',
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const database: Database = getDatabase(app);
export default app;
