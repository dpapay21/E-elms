
// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQIuzFysmgDA0aMiEN3MKL6XKYCMKuv6I",
  authDomain: "e-lmis-b416e.firebaseapp.com",
  projectId: "e-lmis-b416e",
  storageBucket: "e-lmis-b416e.firebasestorage.app",
  messagingSenderId: "580137171956",
  appId: "1:580137171956:web:75d2a91d2d1dca9fed57a1",
  measurementId: "G-Y6HH6D9J7R"
};

// Initialize Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
