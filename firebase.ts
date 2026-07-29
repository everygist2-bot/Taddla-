import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzyo6MZ7chId7ZsNgx0UyVyFsNSc-sno0",
  authDomain: "taddla-bb062.firebaseapp.com",
  projectId: "taddla-bb062",
  storageBucket: "taddla-bb062.firebasestorage.app",
  messagingSenderId: "43114239608",
  appId: "1:43114239608:web:1f87c47cf85b696dc2ff8d",
  measurementId: "G-GB6T5DVG77"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

