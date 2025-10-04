// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAujRl1ma3iqw4HLnrgV6yaJcBEqeuEdqo",
  authDomain: "ai-bridge-21.firebaseapp.com",
  projectId: "ai-bridge-21",
  storageBucket: "ai-bridge-21.firebasestorage.app",
  messagingSenderId: "18670168227",
  appId: "1:18670168227:web:fa29e2740e1a252599f716",
  measurementId: "G-CJ3V2KJ6DS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Export Firebase instances
export { app, auth, analytics }; 