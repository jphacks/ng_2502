import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  connectAuthEmulator,
  getReactNativePersistence,
} from "firebase/auth";

import { getStorage, connectStorageEmulator } from "firebase/storage";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);

// SecureStore のキー名エラー（コロンなど不可）を回避するための変換関数
const sanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9_.-]/g, "_");

// SecureStore を Firebase Persistence 形式に適合させるアダプター
const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(sanitizeKey(key)),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(sanitizeKey(key), value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(sanitizeKey(key)),
};

const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : (() => {
        try {
          return initializeAuth(app, {
            persistence: getReactNativePersistence(secureStoreAdapter),
          });
        } catch {
          return getAuth(app);
        }
      })();

const useFirebaseEmulator =
  __DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR !== "false";

if (useFirebaseEmulator) {
  console.log("🔥 Firebase Emulator に接続中...");

  const PC_IP = "192.168.68.101";

  try {
    connectFirestoreEmulator(db, PC_IP, 8080);
    connectAuthEmulator(auth, `http://${PC_IP}:9099`, {
      disableWarnings: true,
    });
    connectStorageEmulator(storage, PC_IP, 9199);

    console.log("✅ エミュレータ接続設定が完了しました");
  } catch (error) {
    console.error("エミュレータ接続エラー:", error);
  }
}

export { app, db, auth, storage };
