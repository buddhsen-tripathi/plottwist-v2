import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { getDatabase, ref, onValue, type Database } from "firebase/database";
import type { Room } from "@/types/game";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton
let app: FirebaseApp;
let auth: Auth;
let db: Database;

function getFirebase() {
  if (!app) {
    console.log("[firebase-client] Initializing with config:", {
      projectId: firebaseConfig.projectId,
      databaseURL: firebaseConfig.databaseURL,
      authDomain: firebaseConfig.authDomain,
    });
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app);
    console.log("[firebase-client] Initialized successfully");
  }
  return { app, auth, db };
}

export function getFirebaseAuth() {
  return getFirebase().auth;
}

export function getFirebaseDb() {
  return getFirebase().db;
}

export async function signInAnon(): Promise<string> {
  const { auth } = getFirebase();
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

export function roomRef(code: string) {
  const { db } = getFirebase();
  return ref(db, `rooms/${code}`);
}

export function subscribeToRoom(
  code: string,
  callback: (room: Room | null) => void,
  onError?: (error: Error) => void
): () => void {
  console.log(`[firebase-client] Subscribing to rooms/${code}`);
  const dbRef = roomRef(code);
  const unsub = onValue(
    dbRef,
    (snapshot) => {
      console.log(`[firebase-client] Got data for rooms/${code}:`, snapshot.exists());
      callback(snapshot.val() as Room | null);
    },
    (error) => {
      console.error(`[firebase-client] Subscription error for rooms/${code}:`, error.message);
      onError?.(error);
    }
  );
  return unsub;
}
