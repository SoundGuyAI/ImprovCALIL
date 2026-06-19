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

let db;
try {
  const admin = require("firebase-admin");
  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  db = admin.firestore();
} catch (err) {
  console.error("Failed to initialize Firebase Admin SDK:", err);
  process.exit(1);
}

const eventId = "Yhg71ZRexo269ahEp9SV";
const linkId = "C8CF4dT2XIy1Zoik2xIC";
const submissionId = "VbBcoarFRZsWNNBLDvFN";

const startTime = 1782234000000; // Tuesday June 23, 2026 20:00 IDT (17:00 UTC)
const endTime = 1782241200000; // Tuesday June 23, 2026 22:00 IDT (19:00 UTC)

async function seed() {
  const eventDoc = await db.collection("events").doc(eventId).get();
  if (eventDoc.exists) {
    console.log("Tuesday Night Improv event already exists. Skipping seed.");
    return;
  }

  const batch = db.batch();

  // 1. Set Event
  const eventRef = db.collection("events").doc(eventId);
  batch.set(eventRef, {
    id: eventId,
    name: "Tuesday Night Improv",
    type: "Workshop",
    organizerId: "org-tel-aviv-improv-workshop",
    organizerName: "Tel Aviv Improv Workshop",
    description:
      "Weekly Tuesday night improv workshop by the Tel Aviv Improv Workshop community. A fun, open, and friendly environment for improvisers of all levels to practice and learn.",
    time: startTime,
    endTime: endTime,
    recurrence: "weekly",
    location: "Dubnov Garden, Tel Aviv",
    region: "Tel-Aviv",
    language: "en",
    cost: "Free",
    access: "Open",
    hidden: false,
    featured: false,
    createdAt: Date.now(),
  });

  // 2. Set Link
  const linkRef = db.collection("links").doc(linkId);
  batch.set(linkRef, {
    id: linkId,
    parentId: eventId,
    parentType: "event",
    url: "https://www.facebook.com/groups/130946416922152",
    type: "Facebook",
    label: "Facebook Group",
    sortOrder: 0,
  });

  // 3. Set Submission
  const subRef = db.collection("submissions").doc(submissionId);
  batch.set(subRef, {
    id: submissionId,
    type: "event",
    status: "approved",
    source: "api_json",
    createdAt: Date.now(),
    submitterContact: {
      email: "admin@json-api",
    },
    data: {
      name: "Tuesday Night Improv",
      type: "Workshop",
      organizerId: "org-tel-aviv-improv-workshop",
      organizerName: "Tel Aviv Improv Workshop",
      description:
        "Weekly Tuesday night improv workshop by the Tel Aviv Improv Workshop community. A fun, open, and friendly environment for improvisers of all levels to practice and learn.",
      time: startTime,
      endTime: endTime,
      recurrence: "weekly",
      location: "Dubnov Garden, Tel Aviv",
      region: "Tel-Aviv",
      language: "en",
      cost: "Free",
      access: "Open",
      hidden: false,
      featured: false,
    },
    links: [
      {
        url: "https://www.facebook.com/groups/130946416922152",
        type: "Facebook",
        label: "Facebook Group",
      },
    ],
  });

  await batch.commit();
  console.log("Successfully seeded Tuesday Night Improv event!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
