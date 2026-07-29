// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCzyo6MZ7chId7ZsNgxOUyYyFsNSc-sno0",
  authDomain: "taddla-bb062.firebaseapp.com",
  projectId: "taddla-bb062",
  storageBucket: "taddla-bb062.firebasestorage.app",
  messagingSenderId: "43114239608",
  appId: "1:43114239608:web:1f87c47cf85b696dc2ff8d",
  measurementId: "G-GB6TSDVG77"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const db = getFirestore(app);

