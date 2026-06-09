const { initializeApp } = require("firebase/app");
const { getFirestore, writeBatch, doc, collection } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// 1. Read .env.local to load credentials
const envPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found. Run firebase setup first.");
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

console.log(
  "Loaded Firebase configuration for Project:",
  clientConfig.projectId || config.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

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

function getDocRef(collectionName, docId) {
  if (useAdmin) {
    return db.collection(collectionName).doc(docId);
  } else {
    const { doc } = require("firebase/firestore");
    return doc(db, collectionName, docId);
  }
}

function createBatch() {
  if (useAdmin) {
    return db.batch();
  } else {
    const { writeBatch } = require("firebase/firestore");
    return writeBatch(db);
  }
}

// Mock Data Definitions
const ORGANIZERS = [
  {
    id: "org-improv-school",
    name: "Improv Israel School",
    type: "School",
    description:
      "The leading improvisation training program in Israel, offering courses from beginner to advanced performance levels.",
    region: "Tel-Aviv",
    languages: ["he", "en"],
    publishStatus: "published",
    hidden: false,
    createdAt: Date.now(),
  },
  {
    id: "org-jlm-troupe",
    name: "Jerusalem Improv Troupe",
    type: "Group",
    description:
      "A community-focused ensemble performing weekly short-form and long-form shows in the heart of Jerusalem.",
    region: "Jerusalem",
    languages: ["he"],
    publishStatus: "published",
    hidden: false,
    createdAt: Date.now(),
  },
  {
    id: "org-haifa-theater",
    name: "Haifa Improv Theater",
    type: "Theater",
    description:
      "A dedicated venue for alternative performing arts and improv matches on Mount Carmel.",
    region: "Haifa",
    languages: ["he", "en"],
    publishStatus: "published",
    hidden: false,
    createdAt: Date.now(),
  },
];

const EVENTS = [
  {
    id: "evt-grand-show",
    name: "Grand Improv Night - Summer Edition",
    organizerId: "org-improv-school",
    organizerName: "Improv Israel School",
    description:
      "An evening of high-energy comedic theater made up on the spot based on your suggestions! Featuring top teachers and graduates.",
    time: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days in future
    endTime: Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000, // +2 hours
    recurrence: "one-time",
    location: "Zoa House, Tel Aviv",
    mapLink: "https://maps.google.com/?q=Zoa+House+Tel+Aviv",
    region: "Tel-Aviv",
    language: "en",
    cost: "Paid",
    access: "Open",
    hidden: false,
    featured: true,
    createdAt: Date.now(),
  },
  {
    id: "evt-weekly-jam",
    name: "Open Community Stage & Jam",
    organizerId: "org-improv-school",
    organizerName: "Improv Israel School",
    description:
      "Our weekly open stage! Come play, watch, and learn. All levels welcome, zero pressure.",
    time: Date.now() + 4 * 24 * 60 * 60 * 1000, // 4 days in future
    endTime: Date.now() + 4 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000,
    recurrence: "weekly",
    location: "Improv Studio, 12 Lilienblum St, Tel Aviv",
    mapLink: "https://maps.google.com/?q=12+Lilienblum+Tel+Aviv",
    region: "Tel-Aviv",
    language: "he",
    cost: "Free",
    access: "Open",
    hidden: false,
    featured: false,
    createdAt: Date.now(),
  },
  {
    id: "evt-jlm-workshop",
    name: "Long-form Formats Masterclass",
    organizerId: "org-jlm-troupe",
    organizerName: "Jerusalem Improv Troupe",
    description:
      "Dive deep into the Harold and scenic relationships. Prior basic experience is required.",
    time: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days in future
    endTime: Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
    recurrence: "one-time",
    location: "Gerard Behar Center, Jerusalem",
    mapLink: "https://maps.google.com/?q=Gerard+Behar+Center+Jerusalem",
    region: "Jerusalem",
    language: "he",
    cost: "Paid",
    access: "Private",
    hidden: false,
    featured: false,
    createdAt: Date.now(),
  },
  {
    id: "evt-haifa-festival",
    name: "Carmel Improv Festival 2026",
    organizerId: "org-haifa-theater",
    organizerName: "Haifa Improv Theater",
    description:
      "Three days of shows, jams, and international guest workshops on the bay. Re-rendered static index test.",
    time: Date.now() + 8 * 24 * 60 * 60 * 1000, // 8 days in future
    endTime: Date.now() + 11 * 24 * 60 * 60 * 1000, // 3 day festival
    recurrence: "one-time",
    location: "Beit Hecht, Haifa",
    mapLink: "https://maps.google.com/?q=Beit+Hecht+Haifa",
    region: "Haifa",
    language: "en",
    cost: "Paid",
    access: "Open",
    hidden: false,
    featured: true,
    createdAt: Date.now(),
  },
  {
    id: "evt-hidden-show",
    name: "Draft Secret Performance",
    organizerName: "Living Room Troupe",
    description: "Private invite-only test. Should not appear on public calendar.",
    time: Date.now() + 1 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
    recurrence: "one-time",
    location: "Private Residence, Ra'anana",
    region: "Hasharon",
    language: "he",
    cost: "Free",
    access: "Private",
    hidden: true,
    featured: false,
    createdAt: Date.now(),
  },
];

const LINKS = [
  {
    id: "lnk-1",
    parentId: "org-improv-school",
    parentType: "organizer",
    url: "https://improv-israel.co.il",
    type: "Website",
    sortOrder: 0,
  },
  {
    id: "lnk-2",
    parentId: "org-improv-school",
    parentType: "organizer",
    url: "https://facebook.com/improvschoolisrael",
    type: "Facebook",
    sortOrder: 1,
  },
  {
    id: "lnk-3",
    parentId: "org-jlm-troupe",
    parentType: "organizer",
    url: "https://whatsapp.com/channel/jlm-improv",
    type: "WhatsApp group",
    sortOrder: 0,
  },
  {
    id: "lnk-4",
    parentId: "evt-grand-show",
    parentType: "event",
    url: "https://eventer.co.il/grandshow2026",
    type: "Website",
    label: "Buy Tickets",
    sortOrder: 0,
  },
  {
    id: "lnk-5",
    parentId: "evt-grand-show",
    parentType: "event",
    url: "https://facebook.com/events/123456",
    type: "Facebook event",
    sortOrder: 1,
  },
  {
    id: "lnk-6",
    parentId: "evt-weekly-jam",
    parentType: "event",
    url: "https://chat.whatsapp.com/weekly-jam-israel",
    type: "WhatsApp group",
    sortOrder: 0,
  },
  {
    id: "lnk-7",
    parentId: "evt-haifa-festival",
    parentType: "event",
    url: "https://instagram.com/carmelimprovfest",
    type: "Instagram",
    sortOrder: 0,
  },
];

const SUBMISSIONS = [
  {
    id: "sub-1",
    type: "event",
    status: "pending",
    source: "telegram",
    createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    submitterContact: { email: "telegram-bot@soundguy.ai" },
    data: {
      name: "Late Night Scenegames Jam",
      organizerName: "Late Night Crew",
      description: "Fast paced improv games, short form and laughs till midnight.",
      time: Date.now() + 3 * 24 * 60 * 60 * 1000,
      endTime: Date.now() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000,
      recurrence: "one-time",
      location: "Basement Bar, Tel Aviv",
      region: "Tel-Aviv",
      language: "he",
      cost: "Free",
      access: "Open",
      hidden: false,
      featured: false,
    },
    links: [{ url: "https://chat.whatsapp.com/latenightscenegames", type: "WhatsApp group" }],
  },
  {
    id: "sub-2",
    type: "organizer",
    status: "pending",
    source: "web_form",
    createdAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
    submitterContact: { email: "ronit@improv.net", phone: "054-1234567" },
    data: {
      name: "Hasharon Improv Community",
      type: "Group",
      description:
        "A community theater platform hosting regular jams and workshops for residents of Kfar Saba and Ra'anana.",
      region: "Hasharon",
      languages: ["he"],
    },
    links: [{ url: "https://facebook.com/groups/sharonimprov", type: "Facebook" }],
  },
];

async function seed() {
  console.log("Seeding started...");
  const batch = createBatch();

  // 1. Seed Organizers
  for (const org of ORGANIZERS) {
    const ref = getDocRef("organizers", org.id);
    batch.set(ref, org);
  }
  console.log(`Added ${ORGANIZERS.length} mock organizers to batch.`);

  // 2. Seed Events
  for (const evt of EVENTS) {
    const ref = getDocRef("events", evt.id);
    batch.set(ref, evt);
  }
  console.log(`Added ${EVENTS.length} mock events to batch.`);

  // 3. Seed Links
  for (const lnk of LINKS) {
    const ref = getDocRef("links", lnk.id);
    batch.set(ref, lnk);
  }
  console.log(`Added ${LINKS.length} mock links to batch.`);

  // 4. Seed Submissions
  for (const sub of SUBMISSIONS) {
    const ref = getDocRef("submissions", sub.id);
    batch.set(ref, sub);
  }
  console.log(`Added ${SUBMISSIONS.length} mock submissions to batch.`);

  await batch.commit();
  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
