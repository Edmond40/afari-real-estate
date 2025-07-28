// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVaIYw15wjVR6u6V0WIYG2chBftny93co",
  authDomain: "afari-user-and-admin-auth.firebaseapp.com",
  projectId: "afari-user-and-admin-auth",
  storageBucket: "afari-user-and-admin-auth.appspot.com",
  messagingSenderId: "3267473262",
  appId: "1:3267473262:web:5439661e727f3c02899b7f",
  measurementId: "G-5V9J5SD08Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, analytics };