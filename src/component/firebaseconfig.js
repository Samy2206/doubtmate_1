// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore import
import { getStorage } from "firebase/storage"; // Firebase Storage import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2N441Qk3Ojeb7_GPBFdRb-s0q6tXUlGg",
  authDomain: "canteen-management-1188c.firebaseapp.com",
  projectId: "canteen-management-1188c",
  storageBucket: "canteen-management-1188c.appspot.com",
  messagingSenderId: "1083838316376",
  appId: "1:1083838316376:web:114f0daeb461a4bca06f2d",
  measurementId: "G-TX2F13C5EW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);  // Authentication
const db = getFirestore(app);  // Firestore Database
const storage = getStorage(app);  // Firebase Storage

// Export the services for use in other parts of the app
export { auth, db, storage };
