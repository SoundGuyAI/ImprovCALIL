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

// Firestore batches are limited to 500 operations. Delete in chunks.
const BATCH_CHUNK_SIZE = 499;

async function deleteDocs(docs, firestore) {
  for (let i = 0; i < docs.length; i += BATCH_CHUNK_SIZE) {
    const chunk = docs.slice(i, i + BATCH_CHUNK_SIZE);
    const batch = useAdmin ? db.batch() : firestore.writeBatch(db);
    chunk.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function clearDatabase() {
  const firestore = !useAdmin ? require("firebase/firestore") : null;
  const deletedEventIds = new Set();
  const deletedSubmissionIds = new Set();

  // 1. Clear test/mock events
  console.log("Fetching documents from collection: events...");
  const eventsSnapshot = useAdmin
    ? await db.collection("events").get()
    : await firestore.getDocs(firestore.collection(db, "events"));

  const eventsToDelete = [];
  eventsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    const name = data.name || "";
    // Only delete seeded events, test events, or E2E events
    const isMockOrTest =
      id.startsWith("evt-") ||
      id.startsWith("test-") ||
      name.includes("E2E") ||
      name.includes("Test") ||
      name.includes("Mock") ||
      data.isTest === true ||
      data.isMock === true;

    if (isMockOrTest) {
      eventsToDelete.push(doc);
      deletedEventIds.add(id);
    }
  });

  if (eventsToDelete.length > 0) {
    console.log(`Deleting ${eventsToDelete.length} test/mock documents from events...`);
    await deleteDocs(eventsToDelete, firestore);
    console.log("Successfully cleared test/mock events.");
  } else {
    console.log("No test/mock events found to delete.");
  }

  // 2. Clear test/mock submissions
  console.log("Fetching documents from collection: submissions...");
  const submissionsSnapshot = useAdmin
    ? await db.collection("submissions").get()
    : await firestore.getDocs(firestore.collection(db, "submissions"));

  const submissionsToDelete = [];
  submissionsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    const name = data.name || data.data?.name || "";
    // Only delete E2E/test submissions or seeded submissions
    const isMockOrTest =
      id.startsWith("sub-") ||
      id.startsWith("test-") ||
      name.includes("E2E") ||
      name.includes("Test") ||
      name.includes("Mock") ||
      data.isTest === true ||
      data.isMock === true ||
      (data.submitterContact?.email === "admin@json-api" && name.includes("E2E"));

    if (isMockOrTest) {
      submissionsToDelete.push(doc);
      deletedSubmissionIds.add(id);
    }
  });

  if (submissionsToDelete.length > 0) {
    console.log(`Deleting ${submissionsToDelete.length} test/mock documents from submissions...`);
    await deleteDocs(submissionsToDelete, firestore);
    console.log("Successfully cleared test/mock submissions.");
  } else {
    console.log("No test/mock submissions found to delete.");
  }

  // 3. Clear test/mock links
  console.log("Fetching documents from collection: links...");
  const linksSnapshot = useAdmin
    ? await db.collection("links").get()
    : await firestore.getDocs(firestore.collection(db, "links"));

  const linksToDelete = [];
  linksSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    const parentId = data.parentId || "";
    const isMockOrTest =
      id.startsWith("lnk-") ||
      id.startsWith("test-") ||
      parentId.startsWith("evt-") ||
      parentId.startsWith("test-") ||
      deletedEventIds.has(parentId) ||
      deletedSubmissionIds.has(parentId);

    if (isMockOrTest) {
      linksToDelete.push(doc);
    }
  });

  if (linksToDelete.length > 0) {
    console.log(`Deleting ${linksToDelete.length} test/mock documents from links...`);
    await deleteDocs(linksToDelete, firestore);
    console.log("Successfully cleared test/mock links.");
  } else {
    console.log("No test/mock links found to delete.");
  }
}

async function main() {
  try {
    const projectId = clientConfig.projectId || config.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    // Safety check: protect production project from accidental test runs.
    // An undefined projectId is not a safe default — require it to be explicit.
    if (!projectId) {
      console.error(
        "Safety Error: projectId is undefined. Cannot safely determine target project for DB cleanup."
      );
      process.exit(1);
    }
    const allowedProjects = ["improv-calendar-il"];
    const isAllowed =
      allowedProjects.includes(projectId) ||
      projectId.includes("dev") ||
      projectId.includes("staging") ||
      projectId.includes("test") ||
      projectId.includes("emulator");

    if (!isAllowed) {
      console.error(
        `Safety Error: DB cleanup blocked on project ${projectId} to prevent production data loss.`
      );
      process.exit(1);
    }
    await clearDatabase();
    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

main();
