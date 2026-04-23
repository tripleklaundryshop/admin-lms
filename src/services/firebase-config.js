// src/services/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 1. Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyCjNlxF7tmC2TWdkNUv2oQheeKYQMi-PxY",
  authDomain: "lms-database-d21f6.firebaseapp.com",
  projectId: "lms-database-d21f6",
  storageBucket: "lms-database-d21f6.firebasestorage.app",
  messagingSenderId: "219532292912",
  appId: "1:219532292912:web:102aca94640d5abf6d4ef5",
  measurementId: "G-5KYP8WJ824"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// 2. Initialize Firebase Authentication
export const auth = getAuth(app);

// 3. Initialize Firestore Database and export it as 'db'
export const db = getFirestore(app);