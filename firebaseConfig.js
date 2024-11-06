// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDlFC0bWG2aCgntVWyXnqJ42hgyuqyLgM",
  projectId: "magiadental-50e1a",
  storageBucket: "magiadental-50e1a.firebasestorage.app",
  messagingSenderId: "433783145303",
  appId: "1:433783145303:ios:37493a7ab4c001acd1f412"
};

// Инициализация Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Инициализация аутентификации с поддержкой AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Инициализация Firestore
const db = getFirestore(app);

export { auth, db };
