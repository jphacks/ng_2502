// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "fake-api-key", // Emulator用なのでダミーでOK
  authDomain: "localhost",
  projectId: "myfirstfirebase-440d6", // ← あなたのプロジェクトID
};

const app = initializeApp(firebaseConfig);

// Authインスタンスを取得
export const auth = getAuth(app);

// --- Emulatorに接続 ---
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  console.log("🔥 Firebase Auth Emulatorに接続中");
}
