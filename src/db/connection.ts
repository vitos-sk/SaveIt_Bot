import * as admin from "firebase-admin";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

// Инициализация Firebase Admin
if (!admin.apps.length) {
  console.log("🔧 Инициализация Firebase...");
  // Если JSON указан через переменную окружения (для Railway)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL:
          process.env.FIREBASE_DATABASE_URL ||
          "https://save-it-93b43-default-rtdb.europe-west1.firebasedatabase.app/",
      });
    } catch (error) {
      console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error);
      throw error;
    }
  } else {
    // Локальная разработка - используем файл
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.join(process.cwd(), "firebase-service-account.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        "https://save-it-93b43-default-rtdb.europe-west1.firebasedatabase.app/",
    });
    console.log("✅ Firebase инициализирован из файла");
  }
} else {
  console.log("✅ Firebase уже инициализирован");
}

export const db = admin.database();
console.log("✅ Firebase Realtime Database подключена");
export default db;
