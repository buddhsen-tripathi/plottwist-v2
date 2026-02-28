import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";
import type { Room } from "@/types/game";

let app: App;
let db: Database;

function getAdmin() {
  if (!app) {
    console.log("[firebase-admin] Initializing Firebase Admin SDK...");
    const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    console.log("[firebase-admin] Database URL:", dbUrl);

    if (getApps().length) {
      app = getApps()[0];
      console.log("[firebase-admin] Reusing existing app");
    } else {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (raw) {
        try {
          const cleaned = raw.replace(/\n/g, "\\n").replace(/\\\\n/g, "\\n");
          const serviceAccount = JSON.parse(cleaned);
          console.log("[firebase-admin] Parsed service account for project:", serviceAccount.project_id);
          app = initializeApp({
            credential: cert(serviceAccount),
            databaseURL: dbUrl,
          });
          console.log("[firebase-admin] App initialized with service account");
        } catch (e) {
          console.error("[firebase-admin] JSON parse failed, using individual env vars:", e);
          app = initializeApp({
            credential: cert({
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
              privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
            }),
            databaseURL: dbUrl,
          });
        }
      } else {
        console.log("[firebase-admin] No service account key, using default credentials");
        app = initializeApp({ databaseURL: dbUrl });
      }
    }
    db = getDatabase(app);
    console.log("[firebase-admin] Database instance created");
  }
  return { app, db };
}

export async function getRoom(code: string): Promise<Room | null> {
  const start = Date.now();
  console.log(`[firebase-admin] getRoom(${code}) started`);
  const { db } = getAdmin();
  const snapshot = await withTimeout(db.ref(`rooms/${code}`).get(), 10000, `getRoom(${code})`);
  console.log(`[firebase-admin] getRoom(${code}) completed in ${Date.now() - start}ms`);
  return snapshot.val() as Room | null;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`[firebase-admin] TIMEOUT: ${label} took longer than ${ms}ms — your RTDB URL is likely wrong or the database does not exist.`)), ms)
    ),
  ]);
}

export async function setRoom(code: string, room: Room): Promise<void> {
  const start = Date.now();
  console.log(`[firebase-admin] setRoom(${code}) started`);
  const { db } = getAdmin();
  await withTimeout(db.ref(`rooms/${code}`).set(room), 10000, `setRoom(${code})`);
  console.log(`[firebase-admin] setRoom(${code}) completed in ${Date.now() - start}ms`);
}

export async function updateRoom(
  code: string,
  updates: Partial<Room>
): Promise<void> {
  const { db } = getAdmin();
  await db.ref(`rooms/${code}`).update(updates);
}

export async function deleteRoom(code: string): Promise<void> {
  const { db } = getAdmin();
  await db.ref(`rooms/${code}`).remove();
}

export async function roomExists(code: string): Promise<boolean> {
  const { db } = getAdmin();
  const snapshot = await db.ref(`rooms/${code}`).get();
  return snapshot.exists();
}
