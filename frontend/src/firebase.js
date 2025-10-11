// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_IuIjcwlfH24BYRMoh-xiYt58Zir_LPw",
  authDomain: "jphacks-ng-2502.firebaseapp.com",
  projectId: "jphacks-ng-2502",
  storageBucket: "jphacks-ng-2502.firebasestorage.app",
  messagingSenderId: "406884758333",
  appId: "1:406884758333:web:525f4fa294326715770b54",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 各サービスをエクスポートして、他のファイルで使えるようにする
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
