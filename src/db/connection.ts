import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

function getDatabaseUrl(): string {
  return (
    process.env.FIREBASE_DATABASE_URL ||
    "https://save-it-93b43-default-rtdb.europe-west1.firebasedatabase.app/"
  );
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function parseServiceAccountJson(raw: string): admin.ServiceAccount {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is empty");
  }
  return JSON.parse(trimmed) as admin.ServiceAccount;
}

// Инициализация Firebase Admin
if (!admin.apps.length) {
  console.log("🔧 Инициализация Firebase...");
  const databaseURL = getDatabaseUrl();
  let initialized = false;

  // 1) Railway/Prod recommended: JSON string in env
  if (!initialized && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = parseServiceAccountJson(
        process.env.FIREBASE_SERVICE_ACCOUNT
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL,
      });
      console.log("✅ Firebase инициализирован из FIREBASE_SERVICE_ACCOUNT");
      initialized = true;
    } catch (error) {
      console.error("❌ Error parsing FIREBASE_SERVICE_ACCOUNT:", error);
      throw error;
    }
  }

  // 2) Optional: base64 encoded JSON (handy for some CI/CD systems)
  if (!initialized && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64"
      ).toString("utf8");
      const serviceAccount = parseServiceAccountJson(decoded);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL,
      });
      console.log("✅ Firebase инициализирован из FIREBASE_SERVICE_ACCOUNT_BASE64");
      initialized = true;
    } catch (error) {
      console.error("❌ Error parsing FIREBASE_SERVICE_ACCOUNT_BASE64:", error);
      throw error;
    }
  }

  // 3) Explicit file path (local dev or custom hosting)
  const explicitPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!initialized && explicitPath) {
    if (!fs.existsSync(explicitPath)) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_PATH points to missing file: ${explicitPath}`
      );
    }
    admin.initializeApp({
      credential: admin.credential.cert(explicitPath),
      databaseURL,
    });
    console.log("✅ Firebase инициализирован из FIREBASE_SERVICE_ACCOUNT_PATH");
    initialized = true;
  }

  // 4) Default local dev file, but ONLY in non-production
  const defaultLocalPath = path.join(process.cwd(), "firebase-service-account.json");
  if (!initialized && isProduction()) {
    throw new Error(
      "Firebase credentials are not configured. On Railway set FIREBASE_SERVICE_ACCOUNT (JSON string) or FIREBASE_SERVICE_ACCOUNT_BASE64. Do NOT rely on firebase-service-account.json file in production."
    );
  }

  if (!initialized && !fs.existsSync(defaultLocalPath)) {
    throw new Error(
      `Local firebase service account file not found: ${defaultLocalPath}. Either create it for local dev or set FIREBASE_SERVICE_ACCOUNT.`
    );
  }

  if (!initialized) {
    admin.initializeApp({
      credential: admin.credential.cert(defaultLocalPath),
      databaseURL,
    });
    console.log("✅ Firebase инициализирован из локального файла");
  }
} else {
  console.log("✅ Firebase уже инициализирован");
}

export const db = admin.database();
console.log("✅ Firebase Realtime Database подключена");
export default db;
