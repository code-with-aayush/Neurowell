
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdqVYzDxb0dIXpp65Iz4iL_-V4hEtWxbA",
  authDomain: "neurowell-98550.firebaseapp.com",
  projectId: "neurowell-98550",
  storageBucket: "neurowell-98550.firebasestorage.app",
  messagingSenderId: "1085334579434",
  appId: "1:1085334579434:web:5763c160dde510bc300f93"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
