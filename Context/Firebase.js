// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "sbstore-681a3.firebaseapp.com",
  projectId: "sbstore-681a3",
  storageBucket: "sbstore-681a3.firebasestorage.app",
  messagingSenderId: "728502925043",
  appId: "1:728502925043:web:334f4301af11d41ad46986",
  measurementId: "G-QVXTKF0945",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
