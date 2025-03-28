// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaZIxMKCNIkGD_4zW4Y-8TlCO_1ZXbpKo",
  authDomain: "dish-display-e873f.firebaseapp.com",
  projectId: "dish-display-e873f",
  storageBucket: "dish-display-e873f.firebasestorage.app",
  messagingSenderId: "753091089574",
  appId: "1:753091089574:web:78399551aaceb370e3d067",
  measurementId: "G-2Q1JNTB5G9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

export { db };