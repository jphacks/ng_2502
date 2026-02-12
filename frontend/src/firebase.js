// --- Firebase SDK ---
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  connectFirestoreEmulator 
} from "firebase/firestore";
import { 
  getAuth, 
  connectAuthEmulator,
  setPersistence,
  inMemoryPersistence
} from "firebase/auth";
import { 
  getStorage, 
  connectStorageEmulator 
} from "firebase/storage";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- Initialize App ---
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// --- Services ---
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// --- ローカル開発時だけエミュレーターに接続 ---
if (import.meta.env.MODE === "development") {
  console.log("🔥 Firebase Emulator に接続中...");

  // Firestore Emulator
  connectFirestoreEmulator(db, "localhost", 8080);

  // Auth Emulator
  connectAuthEmulator(auth, "http://localhost:9099");

  // Storage Emulator
  connectStorageEmulator(storage, "localhost", 9199);

  // ★ ローカルでは永続化を無効化（戻るボタンで本番アカウントに戻る問題の決定的対策）
  setPersistence(auth, inMemoryPersistence);
}

// --- Export ---
export { app, db, auth, storage };