const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const config = {};
envContent.split("\n").forEach((line) => {
  const eqIdx = line.indexOf("=");
  if (eqIdx !== -1) {
    const rawKey = line.slice(0, eqIdx).trim();
    let rawVal = line.slice(eqIdx + 1).trim();
    if (
      (rawVal.startsWith("'") && rawVal.endsWith("'")) ||
      (rawVal.startsWith('"') && rawVal.endsWith('"'))
    ) {
      rawVal = rawVal.slice(1, -1);
    }
    config[rawKey] = rawVal;
  }
});

// camelCase client config fallback
const clientConfig = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^NEXT_PUBLIC_FIREBASE_([A-Z_]+)=(.*)$/);
  if (match) {
    const key = match[1].toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    clientConfig[key] = match[2].trim();
  }
});

let db;
let useAdmin = false;

if (config.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const admin = require("firebase-admin");
    const serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    useAdmin = true;
    console.log("Initialized Firebase Admin SDK using Service Account Key.");
  } catch (err) {
    console.error("Failed to initialize Firebase Admin SDK:", err);
  }
}

if (!useAdmin) {
  const { initializeApp } = require("firebase/app");
  const { getFirestore } = require("firebase/firestore");
  const app = initializeApp(clientConfig);
  db = getFirestore(app);
  console.log("Fallback: Initialized Firebase Client SDK.");
}

async function deleteCollection(collectionName) {
  console.log(`Fetching documents from collection: ${collectionName}...`);
  if (useAdmin) {
    const colRef = db.collection(collectionName);
    const snapshot = await colRef.get();
    if (snapshot.empty) {
      console.log(`Collection ${collectionName} is already empty.`);
      return;
    }
    console.log(`Deleting ${snapshot.size} documents from ${collectionName}...`);
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } else {
    const { getDocs, collection, writeBatch } = require("firebase/firestore");
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log(`Collection ${collectionName} is already empty.`);
      return;
    }
    console.log(`Deleting ${snapshot.size} documents from ${collectionName}...`);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
  console.log(`Successfully cleared ${collectionName}.`);
}

async function main() {
  try {
    await deleteCollection("events");
    await deleteCollection("links");
    await deleteCollection("submissions");
    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

main();
