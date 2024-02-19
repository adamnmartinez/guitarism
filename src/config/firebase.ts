import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjb78VhIOLVjRLw8f1lz2t_JbygQ9qodM",
  authDomain: "guitarism-5f78c.firebaseapp.com",
  projectId: "guitarism-5f78c",
  storageBucket: "guitarism-5f78c.appspot.com",
  messagingSenderId: "190683055716",
  appId: "1:190683055716:web:055dce7a202d770ad4c171",
  measurementId: "G-RN1KDZL2PJ",
};

const app = initializeApp(firebaseConfig);
export const googleprovider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const auth = getAuth(app);
