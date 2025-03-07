import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA7YGNhhERvOk6V3F8JHSI7Wn-u03U9SbE",
  authDomain: "musicplayer-c487a.firebaseapp.com",
  projectId: "musicplayer-c487a",
  storageBucket: "musicplayer-c487a.firebasestorage.app",
  messagingSenderId: "389527061012",
  appId: "1:389527061012:web:273f7063d655a1883a5d01"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
