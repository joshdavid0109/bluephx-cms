// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // If you'll manage images

// Your web app's Firebase configuration
// Replace with your actual Firebase config from your project settings
const firebaseConfig = {
  apiKey: "AIzaSyDj43KF6B5sBHedPeaixUBAKWvbsymHRW4",
  authDomain: "bluephx-3ee80.firebaseapp.com",
  databaseURL: "https://bluephx-3ee80-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bluephx-3ee80",
  storageBucket: "bluephx-3ee80.firebasestorage.app",
  messagingSenderId: "855429425240",
  appId: "1:855429425240:web:32da593d1350cc6964022d",
  measurementId: "G-9EJ1MNG4GG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage (optional, for image/file uploads)
const storage = getStorage(app);

export { db, storage }; 
