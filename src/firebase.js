import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8TU9_9uaTqxG74elq2HgXChe4r2Ea07U",
  authDomain: "luckybox-6250b.firebaseapp.com",
  projectId: "luckybox-6250b",
  storageBucket: "luckybox-6250b.firebasestorage.app",
  messagingSenderId: "89369649100",
  appId: "1:89369649100:web:b155fdb28dd46e588a4769",
  measurementId: "G-B0MKPFFRY0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);