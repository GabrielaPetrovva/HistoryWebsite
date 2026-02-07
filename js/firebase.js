// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnJNaSOgsqG21j4-F1q3KSV4ZsVUJZ4eM",
  authDomain: "history-web-v1.firebaseapp.com",
  projectId: "history-web-v1",
  storageBucket: "history-web-v1.firebasestorage.app",
  messagingSenderId: "805816658477",
  appId: "1:805816658477:web:df2421758eb2c8864be6a4",
  measurementId: "G-J07F6J05Q9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);