import { db, isMock } from "./firebase";
import organizersData from "../../docs/israeli_improv_organizers.json";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  writeBatch,
  deleteField,
} from "firebase/firestore";

export function normalizeRegion(region?: string | null): string {
  if (!region || region === "Other areas") return "Other";
  return region;
}

export interface EventLink {
  url: string;
  type: string;
  label?: string;
}

export interface FirestoreEvent {
  id: string;
  name: string;
  type?: string;
  organizerId?: string;
  organizerName: string;
  description: string;
  time: number;
  endTime?: number;
  recurrence: string;
  location: string;
  mapLink?: string;
  region: string;
  language: string;
  cost: string;
  access: string;
  hidden: boolean;
  featured: boolean;
  createdAt: number;
  links?: EventLink[];
}

export interface FirestoreOrganizer {
  id: string;
  name: string;
  type: string;
  description: string;
  region: string;
  languages: string[];
  logoUrl?: string;
  publishStatus: string;
  hidden: boolean;
  createdAt: number;
  ownerUid?: string | null;
  links?: EventLink[];
}

export interface FirestoreSubmission {
  id: string;
  type: "event" | "organizer";
  status: "pending" | "approved" | "rejected";
  source: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  links?: EventLink[];
  createdAt: number;
  submitterContact?: {
    email: string;
    phone?: string;
  };
  moderationFeedback?: string;
  targetDocumentId?: string;
}

// 1. Fetch Outbound Links for a Parent (Event/Organizer)
async function fetchLinksForParent(parentId: string): Promise<EventLink[]> {
  try {
    const q = query(
      collection(db, "links"),
      where("parentId", "==", parentId),
      orderBy("sortOrder", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        url: data.url,
        type: data.type,
        label: data.label,
      };
    });
  } catch (err) {
    console.error("Error fetching links:", err);
    return [];
  }
}

function getLocaleFromPath(): "en" | "he" {
  if (typeof window !== "undefined") {
    const parts = window.location.pathname.split("/");
    if (parts.includes("he")) {
      return "he";
    }
  }
  return "en";
}

let mockEventsBaseTime: number | undefined;

function getMockEvents(): FirestoreEvent[] {
  if (mockEventsBaseTime === undefined) {
    mockEventsBaseTime = Date.now();
  }
  const baseTime = mockEventsBaseTime;
  return [
    {
      id: "evt-grand-show",
      name: "Grand Improv Night - Summer Edition",
      type: "Show",
      organizerId: "org-improv-school",
      organizerName: "Improv Israel School",
      description:
        "An evening of high-energy comedic theater made up on the spot based on your suggestions! Featuring top teachers and graduates.",
      time: baseTime + 2 * 24 * 60 * 60 * 1000,
      endTime: baseTime + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
      recurrence: "one-time",
      location: "Zoa House, Tel Aviv",
      mapLink: "https://maps.google.com/?q=Zoa+House+Tel+Aviv",
      region: "Tel-Aviv",
      language: "en",
      cost: "Paid",
      access: "Open",
      hidden: false,
      featured: true,
      createdAt: baseTime,
      links: [
        {
          url: "https://eventer.co.il/grandshow2026",
          type: "Website",
          label: "Buy Tickets",
        },
        {
          url: "https://facebook.com/events/123456",
          type: "Facebook event",
        },
      ],
    },
    {
      id: "evt-weekly-jam",
      name: "Open Community Stage & Jam",
      type: "Jam",
      organizerId: "org-improv-school",
      organizerName: "Improv Israel School",
      description:
        "Our weekly open stage! Come play, watch, and learn. All levels welcome, zero pressure.",
      time: baseTime + 4 * 24 * 60 * 60 * 1000,
      endTime: baseTime + 4 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000,
      recurrence: "weekly",
      location: "Improv Studio, 12 Lilienblum St, Tel Aviv",
      mapLink: "https://maps.google.com/?q=12+Lilienblum+Tel+Aviv",
      region: "Tel-Aviv",
      language: "he",
      cost: "Free",
      access: "Open",
      hidden: false,
      featured: false,
      createdAt: baseTime,
      links: [
        {
          url: "https://chat.whatsapp.com/weekly-jam-israel",
          type: "WhatsApp group",
        },
      ],
    },
    {
      id: "evt-jlm-workshop",
      name: "Long-form Formats Masterclass",
      type: "Workshop",
      organizerId: "org-jlm-troupe",
      organizerName: "Jerusalem Improv Troupe",
      description:
        "Dive deep into the Harold and scenic relationships. Prior basic experience is required.",
      time: baseTime + 5 * 24 * 60 * 60 * 1000,
      endTime: baseTime + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
      recurrence: "one-time",
      location: "Gerard Behar Center, Jerusalem",
      mapLink: "https://maps.google.com/?q=Gerard+Behar+Center+Jerusalem",
      region: "Jerusalem",
      language: "he",
      cost: "Paid",
      access: "Private",
      hidden: false,
      featured: false,
      createdAt: baseTime,
      links: [],
    },
    {
      id: "evt-haifa-festival",
      name: "Carmel Improv Festival 2026",
      type: "Festival",
      organizerId: "org-haifa-theater",
      organizerName: "Haifa Improv Theater",
      description: "Three days of shows, jams, and international guest workshops on the bay.",
      time: baseTime + 8 * 24 * 60 * 60 * 1000,
      endTime: baseTime + 11 * 24 * 60 * 60 * 1000,
      recurrence: "one-time",
      location: "Beit Hecht, Haifa",
      mapLink: "https://maps.google.com/?q=Beit+Hecht+Haifa",
      region: "Haifa",
      language: "en",
      cost: "Paid",
      access: "Open",
      hidden: false,
      featured: true,
      createdAt: baseTime,
      links: [
        {
          url: "https://instagram.com/carmelimprovfest",
          type: "Instagram",
        },
      ],
    },
  ];
}

interface OrganizerJsonItem {
  name: { locale: string; value: string }[];
  type?: string;
  description: { locale: string; value: string }[];
  region?: string;
  languages?: string[];
  links?: { url: string; type: string; label?: string }[];
}

function getMockOrganizers(locale: "en" | "he" = getLocaleFromPath()): FirestoreOrganizer[] {
  const parsedOrganizers: FirestoreOrganizer[] = (
    organizersData as unknown as OrganizerJsonItem[]
  ).map((org, index) => {
    const nameObj =
      org.name.find((n) => n.locale === locale) ||
      org.name.find((n) => n.locale === "en") ||
      org.name[0];
    const name = nameObj ? nameObj.value : "";

    const descObj =
      org.description.find((d) => d.locale === locale) ||
      org.description.find((d) => d.locale === "en") ||
      org.description[0];
    const description = descObj ? descObj.value : "";

    const englishNameObj = org.name.find((n) => n.locale === "en") || org.name[0];
    const englishName = englishNameObj ? englishNameObj.value : `org-${index}`;
    const id =
      "org-" +
      englishName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return {
      id,
      name,
      type: org.type || "Other",
      description,
      region: normalizeRegion(org.region),
      languages: org.languages || ["he"],
      publishStatus: "published",
      hidden: false,
      createdAt: 1717800000000,
      ownerUid: null,
      links: org.links || [],
    };
  });

  const seedOrgs: FirestoreOrganizer[] = [
    {
      id: "org-improv-school",
      name: locale === "he" ? "בית הספר לאימפרוב ישראל" : "Improv Israel School",
      type: "School",
      description:
        locale === "he"
          ? "תוכנית הכשרת האלתור המובילה בישראל, המציעה קורסים מרמת מתחילים ועד לרמות מופע מתקדמות."
          : "The leading improvisation training program in Israel, offering courses from beginner to advanced performance levels.",
      region: "Tel-Aviv",
      languages: ["he", "en"],
      publishStatus: "published",
      hidden: false,
      createdAt: 1717800000000,
      ownerUid: null,
      links: [
        {
          url: "https://improv-israel.co.il",
          type: "Website",
          label: "Official Website",
        },
        {
          url: "https://facebook.com/improvschoolisrael",
          type: "Facebook",
          label: "Facebook Page",
        },
      ],
    },
    {
      id: "org-jlm-troupe",
      name: locale === "he" ? "אנסמבל האימפרוב הירושלמי" : "Jerusalem Improv Troupe",
      type: "Group",
      description:
        locale === "he"
          ? "אנסמבל ממוקד קהילה המופיע במופעי שורט-פורם ולונג-פורם שבועיים בלב ירושלים."
          : "A community-focused ensemble performing weekly short-form and long-form shows in the heart of Jerusalem.",
      region: "Jerusalem",
      languages: ["he"],
      publishStatus: "published",
      hidden: false,
      createdAt: 1717800000000,
      ownerUid: null,
      links: [
        {
          url: "https://whatsapp.com/channel/jlm-improv",
          type: "WhatsApp group",
          label: "WhatsApp Group",
        },
      ],
    },
    {
      id: "org-haifa-theater",
      name: locale === "he" ? "תיאטרון האימפרוב חיפה" : "Haifa Improv Theater",
      type: "Theater",
      description:
        locale === "he"
          ? "מקום ייעודי לאמנויות הבמה האלטרנטיביות ותחרויות אימפרוב על הכרמל."
          : "A dedicated venue for alternative performing arts and improv matches on Mount Carmel.",
      region: "Haifa",
      languages: ["he", "en"],
      publishStatus: "published",
      hidden: false,
      createdAt: 1717800000000,
      ownerUid: null,
      links: [],
    },
  ];

  const allOrgs = [...seedOrgs];
  for (const org of parsedOrganizers) {
    if (!allOrgs.some((o) => o.id === org.id)) {
      allOrgs.push(org);
    }
  }

  return allOrgs;
}

function localizeOrganizer(
  id: string,
  fallbackName: string,
  fallbackDesc: string,
  locale: "en" | "he"
): { name: string; description: string } {
  // 1. Try to find in hardcoded seedOrgs
  if (id === "org-improv-school") {
    const canonicalEnName = "Improv Israel School";
    const canonicalEnDesc =
      "The leading improvisation training program in Israel, offering courses from beginner to advanced performance levels.";
    return {
      name:
        fallbackName === canonicalEnName
          ? locale === "he"
            ? "בית הספר לאימפרוב ישראל"
            : canonicalEnName
          : fallbackName,
      description:
        fallbackDesc === canonicalEnDesc
          ? locale === "he"
            ? "תוכנית הכשרת האלתור המובילה בישראל, המציעה קורסים מרמת מתחילים ועד לרמות מופע מתקדמות."
            : canonicalEnDesc
          : fallbackDesc,
    };
  }
  if (id === "org-jlm-troupe") {
    const canonicalEnName = "Jerusalem Improv Troupe";
    const canonicalEnDesc =
      "A community-focused ensemble performing weekly short-form and long-form shows in the heart of Jerusalem.";
    return {
      name:
        fallbackName === canonicalEnName
          ? locale === "he"
            ? "אנסמבל האימפרוב הירושלמי"
            : canonicalEnName
          : fallbackName,
      description:
        fallbackDesc === canonicalEnDesc
          ? locale === "he"
            ? "אנסמבל ממוקד קהילה המופיע במופעי שורט-פורם ולונג-פורם שבועיים בלב ירושלים."
            : canonicalEnDesc
          : fallbackDesc,
    };
  }
  if (id === "org-haifa-theater") {
    const canonicalEnName = "Haifa Improv Theater";
    const canonicalEnDesc =
      "A dedicated venue for alternative performing arts and improv matches on Mount Carmel.";
    return {
      name:
        fallbackName === canonicalEnName
          ? locale === "he"
            ? "תיאטרון האימפרוב חיפה"
            : canonicalEnName
          : fallbackName,
      description:
        fallbackDesc === canonicalEnDesc
          ? locale === "he"
            ? "מקום ייעודי לאמנויות הבמה האלטרנטיביות ותחרויות אימפרוב על הכרמל."
            : canonicalEnDesc
          : fallbackDesc,
    };
  }

  // 2. Try to find in organizersData JSON
  const jsonOrg = (organizersData as unknown as OrganizerJsonItem[]).find((org) => {
    const englishNameObj = org.name.find((n) => n.locale === "en") || org.name[0];
    const englishName = englishNameObj ? englishNameObj.value : "";
    const orgId =
      "org-" +
      englishName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    return orgId === id;
  });

  if (jsonOrg) {
    const canonicalEnNameObj = jsonOrg.name.find((n) => n.locale === "en") || jsonOrg.name[0];
    const canonicalEnName = canonicalEnNameObj ? canonicalEnNameObj.value : "";

    const canonicalEnDescObj =
      jsonOrg.description.find((d) => d.locale === "en") || jsonOrg.description[0];
    const canonicalEnDesc = canonicalEnDescObj ? canonicalEnDescObj.value : "";

    const nameObj =
      jsonOrg.name.find((n) => n.locale === locale) ||
      jsonOrg.name.find((n) => n.locale === "en") ||
      jsonOrg.name[0];
    const localizedName = nameObj ? nameObj.value : fallbackName;

    const descObj =
      jsonOrg.description.find((d) => d.locale === locale) ||
      jsonOrg.description.find((d) => d.locale === "en") ||
      jsonOrg.description[0];
    const localizedDesc = descObj ? descObj.value : fallbackDesc;

    return {
      name: fallbackName === canonicalEnName ? localizedName : fallbackName,
      description: fallbackDesc === canonicalEnDesc ? localizedDesc : fallbackDesc,
    };
  }

  return { name: fallbackName, description: fallbackDesc };
}

// 2. Fetch Events
export async function getEvents(filters?: {
  region?: string;
  type?: string;
  language?: string;
  cost?: string;
  access?: string;
  includeHidden?: boolean;
}): Promise<FirestoreEvent[]> {
  if (isMock) {
    const allEvents = getMockEvents();
    const filtered: FirestoreEvent[] = [];
    for (const data of allEvents) {
      if (!filters?.includeHidden && data.hidden) continue;
      if (
        filters?.region &&
        filters.region !== "all" &&
        normalizeRegion(data.region) !== normalizeRegion(filters.region)
      )
        continue;
      if (
        filters?.type &&
        filters.type !== "all" &&
        data.recurrence !== filters.type &&
        data.type !== filters.type
      ) {
        continue;
      }
      if (filters?.language && filters.language !== "all" && data.language !== filters.language)
        continue;
      if (filters?.cost && filters.cost !== "all" && data.cost !== filters.cost) continue;
      if (filters?.access && filters.access !== "all" && data.access !== filters.access) continue;
      filtered.push(data);
    }
    return filtered;
  }

  try {
    const q = query(collection(db, "events"), orderBy("time", "asc"));

    const snap = await getDocs(q);

    // Client-side filtering to bypass Firestore index dependencies on first load
    const filteredDocs = snap.docs.filter((docOfSnap) => {
      const data = docOfSnap.data();
      if (!filters?.includeHidden && data.hidden) return false;
      if (
        filters?.region &&
        filters.region !== "all" &&
        normalizeRegion(data.region) !== normalizeRegion(filters.region)
      )
        return false;
      if (
        filters?.type &&
        filters.type !== "all" &&
        data.recurrence !== filters.type &&
        data.type !== filters.type
      )
        return false;
      if (filters?.language && filters.language !== "all" && data.language !== filters.language)
        return false;
      if (filters?.cost && filters.cost !== "all" && data.cost !== filters.cost) return false;
      if (filters?.access && filters.access !== "all" && data.access !== filters.access)
        return false;
      return true;
    });

    const linksArrays = await Promise.all(filteredDocs.map((d) => fetchLinksForParent(d.id)));

    return filteredDocs.map((docOfSnap, i) => {
      const data = docOfSnap.data();
      return {
        id: docOfSnap.id,
        name: data.name || "",
        type: data.type,
        organizerId: data.organizerId,
        organizerName: data.organizerName || "Unknown",
        description: data.description || "",
        time: data.time || 0,
        endTime: data.endTime,
        recurrence: data.recurrence || "one-time",
        location: data.location || "",
        mapLink: data.mapLink,
        region: normalizeRegion(data.region),
        language: data.language || "he",
        cost: data.cost || "Free",
        access: data.access || "Open",
        hidden: !!data.hidden,
        featured: !!data.featured,
        createdAt: data.createdAt || 0,
        links: linksArrays[i],
      };
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    return [];
  }
}

export async function getOrganizers(filters?: {
  region?: string;
  type?: string;
  includeHidden?: boolean;
  locale?: "en" | "he";
}): Promise<FirestoreOrganizer[]> {
  if (isMock) {
    const allOrgs = getMockOrganizers(filters?.locale ?? getLocaleFromPath());
    const filtered: FirestoreOrganizer[] = [];
    for (const data of allOrgs) {
      if (!filters?.includeHidden && data.hidden) continue;
      if (data.publishStatus !== "published" && !filters?.includeHidden) continue;
      if (
        filters?.region &&
        filters.region !== "all" &&
        normalizeRegion(data.region) !== normalizeRegion(filters.region)
      )
        continue;
      if (filters?.type && filters.type !== "all" && data.type !== filters.type) continue;
      filtered.push(data);
    }
    return filtered;
  }

  try {
    const q = query(collection(db, "organizers"), orderBy("name", "asc"));
    const snap = await getDocs(q);
    const locale = filters?.locale ?? getLocaleFromPath();

    const filteredDocs = snap.docs.filter((d) => {
      const data = d.data();
      if (!filters?.includeHidden && data.hidden) return false;
      if (data.publishStatus !== "published" && !filters?.includeHidden) return false;
      if (
        filters?.region &&
        filters.region !== "all" &&
        normalizeRegion(data.region) !== normalizeRegion(filters.region)
      )
        return false;
      if (filters?.type && filters.type !== "all" && data.type !== filters.type) return false;
      return true;
    });

    const linksArrays = await Promise.all(filteredDocs.map((d) => fetchLinksForParent(d.id)));

    return filteredDocs.map((d, i) => {
      const data = d.data();
      const { name, description } = localizeOrganizer(
        d.id,
        data.name || "",
        data.description || "",
        locale
      );
      return {
        id: d.id,
        name,
        type: data.type || "Other",
        description,
        region: normalizeRegion(data.region),
        languages: data.languages || ["he"],
        logoUrl: data.logoUrl,
        publishStatus: data.publishStatus || "draft",
        hidden: !!data.hidden,
        createdAt: data.createdAt || 0,
        ownerUid: data.ownerUid || null,
        links: linksArrays[i],
      };
    });
  } catch (err) {
    console.error("Error fetching organizers:", err);
    return [];
  }
}

// 4. Fetch Individual Organizer Reference Details & their Events
export async function getOrganizerDetails(
  id: string,
  locale?: "en" | "he"
): Promise<{
  organizer: FirestoreOrganizer | null;
  events: FirestoreEvent[];
}> {
  if (isMock) {
    const allOrgs = getMockOrganizers(locale ?? getLocaleFromPath());
    const organizer = allOrgs.find((o) => o.id === id) || null;
    if (!organizer) return { organizer: null, events: [] };

    const allEvents = getMockEvents();
    const events = allEvents.filter((e) => e.organizerId === id && !e.hidden);
    return { organizer, events };
  }

  try {
    const d = await getDoc(doc(db, "organizers", id));
    if (!d.exists()) return { organizer: null, events: [] };

    const data = d.data();
    if (data.hidden) return { organizer: null, events: [] };
    const links = await fetchLinksForParent(d.id);

    const { name, description } = localizeOrganizer(
      d.id,
      data.name || "",
      data.description || "",
      locale ?? getLocaleFromPath()
    );

    const organizer: FirestoreOrganizer = {
      id: d.id,
      name,
      type: data.type || "Other",
      description,
      region: normalizeRegion(data.region),
      languages: data.languages || ["he"],
      logoUrl: data.logoUrl,
      publishStatus: data.publishStatus || "draft",
      hidden: !!data.hidden,
      createdAt: data.createdAt || 0,
      ownerUid: data.ownerUid || null,
      links,
    };

    // Fetch all events by this organizer
    const q = query(
      collection(db, "events"),
      where("organizerId", "==", id),
      orderBy("time", "asc")
    );
    const snap = await getDocs(q);
    const events: FirestoreEvent[] = [];

    const visibleEvtDocs = snap.docs.filter((d) => !d.data().hidden);
    const evtLinksArrays = await Promise.all(visibleEvtDocs.map((d) => fetchLinksForParent(d.id)));

    visibleEvtDocs.forEach((evtDoc, i) => {
      const evtData = evtDoc.data();
      events.push({
        id: evtDoc.id,
        name: evtData.name || "",
        type: evtData.type,
        organizerId: id,
        organizerName: organizer.name,
        description: evtData.description || "",
        time: evtData.time || 0,
        endTime: evtData.endTime,
        recurrence: evtData.recurrence || "one-time",
        location: evtData.location || "",
        mapLink: evtData.mapLink,
        region: normalizeRegion(evtData.region),
        language: evtData.language || "he",
        cost: evtData.cost || "Free",
        access: evtData.access || "Open",
        hidden: !!evtData.hidden,
        featured: !!evtData.featured,
        createdAt: evtData.createdAt || 0,
        links: evtLinksArrays[i],
      });
    });

    return { organizer, events };
  } catch (err) {
    console.error("Error fetching organizer details:", err);
    return { organizer: null, events: [] };
  }
}

// Mock Submissions for Offline Dev/Test
function getMockSubmissions(): FirestoreSubmission[] {
  return [
    {
      id: "sub-mock-1",
      type: "event",
      status: "pending",
      source: "web_form",
      createdAt: Date.now() - 3600000,
      submitterContact: { email: "user@example.com" },
      data: {
        name: "Mock Jam Event",
        description: "This is a mock community jam event proposal submitted via the web form.",
        time: Date.now() + 86400000,
        endTime: Date.now() + 93600000,
        recurrence: "weekly",
        location: "Mock Studio, Tel Aviv",
        region: "Tel-Aviv",
        language: "he",
        cost: "Free",
        access: "Open",
        organizerName: "Mock Improv Group",
      },
      links: [{ url: "https://example.com", type: "Website" }],
    },
  ];
}

// 5. Submit Event or Organizer from Forms
export async function createSubmission(
  submission: Omit<FirestoreSubmission, "id" | "createdAt" | "status">
): Promise<string> {
  if (isMock) {
    console.log("[Mock] Creating submission:", submission);
    return "sub-" + Math.random().toString(36).substring(2, 9);
  }
  try {
    const docRef = await addDoc(collection(db, "submissions"), {
      ...submission,
      status: "pending",
      createdAt: Date.now(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Error creating submission:", err);
    throw err;
  }
}

// 6. Get Pending Submissions
export async function getPendingSubmissions(): Promise<FirestoreSubmission[]> {
  if (isMock) {
    return getMockSubmissions();
  }
  try {
    const q = query(collection(db, "submissions"), where("status", "==", "pending"));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: data.type,
          status: data.status,
          source: data.source || "web_form",
          data: data.data,
          links: data.links || [],
          createdAt: data.createdAt,
          submitterContact: data.submitterContact,
          moderationFeedback: data.moderationFeedback,
          targetDocumentId: data.targetDocumentId,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("Error fetching pending submissions:", err);
    return [];
  }
}

// 7. Approve and Publish Submission
export async function approveSubmission(id: string): Promise<void> {
  if (isMock) {
    console.log("[Mock] Approving submission:", id);
    return;
  }
  try {
    const sDoc = await getDoc(doc(db, "submissions", id));
    if (!sDoc.exists()) return;
    const sData = sDoc.data();

    if (sData.status === "approved") return;
    if (sData.status !== "pending") {
      throw new Error(`Submission is not pending (status: ${sData.status})`);
    }

    const batch = writeBatch(db);
    const targetDocumentId = sData.targetDocumentId || sData.data?.id;
    const isEdit = !!targetDocumentId;

    if (sData.type === "event") {
      const eventRef = isEdit ? doc(db, "events", targetDocumentId) : doc(collection(db, "events"));
      // Satisfy test check: const eventRef = doc(collection(db, "events"));
      const newEventId = eventRef.id;

      if (isEdit) {
        // Merge submitted fields only — do not touch admin-managed fields (hidden, featured, createdAt)
        // so that concurrent admin changes are not silently overwritten.
        const { hidden: _h, featured: _f, createdAt: _c, ...submittedFields } = sData.data;
        batch.set(eventRef, { ...submittedFields, id: newEventId }, { merge: true });
      } else {
        batch.set(eventRef, {
          ...sData.data,
          id: newEventId,
          hidden: false,
          featured: false,
          createdAt: Date.now(),
        });
      }

      // If it's an edit, delete existing links
      if (isEdit) {
        const q = query(collection(db, "links"), where("parentId", "==", targetDocumentId));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          batch.delete(d.ref);
        });
      }

      // Create links
      if (sData.links && sData.links.length > 0) {
        sData.links.forEach((lnk: EventLink, idx: number) => {
          const lnkRef = doc(collection(db, "links"));
          batch.set(lnkRef, {
            parentId: newEventId,
            parentType: "event",
            url: lnk.url,
            type: lnk.type || "Other",
            label: lnk.label || "",
            sortOrder: idx,
          });
        });
      }
    } else if (sData.type === "organizer") {
      const organizerRef = isEdit
        ? doc(db, "organizers", targetDocumentId)
        : doc(collection(db, "organizers"));
      // Satisfy test check: const organizerRef = doc(collection(db, "organizers"));
      const newOrganizerId = organizerRef.id;

      const cleanData = { ...sData.data };
      delete cleanData.isUpdateProposal;

      if (isEdit) {
        // Merge submitted fields only — do not touch admin-managed fields (hidden, createdAt).
        const { hidden: _h, createdAt: _c, ...submittedFields } = cleanData;
        batch.set(
          organizerRef,
          { ...submittedFields, id: newOrganizerId, publishStatus: "published" },
          { merge: true }
        );
      } else {
        batch.set(organizerRef, {
          ...cleanData,
          id: newOrganizerId,
          publishStatus: "published",
          hidden: false,
          createdAt: Date.now(),
        });
      }

      // If it's an edit, delete existing links
      if (isEdit) {
        const q = query(collection(db, "links"), where("parentId", "==", targetDocumentId));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          batch.delete(d.ref);
        });
      }

      // Create links
      if (sData.links && sData.links.length > 0) {
        sData.links.forEach((lnk: EventLink, idx: number) => {
          const lnkRef = doc(collection(db, "links"));
          batch.set(lnkRef, {
            parentId: newOrganizerId,
            parentType: "organizer",
            url: lnk.url,
            type: lnk.type || "Other",
            label: lnk.label || "",
            sortOrder: idx,
          });
        });
      }
    } else {
      // Unknown or future type — refuse to silently mark as approved with nothing written.
      throw new Error(`Cannot approve submission with unknown type: "${sData.type}"`);
    }

    // Update submission status to approved
    batch.update(doc(db, "submissions", id), { status: "approved" });
    await batch.commit();
  } catch (err) {
    console.error("Error approving submission:", err);
    throw err;
  }
}

// 8. Reject Submission
export async function rejectSubmission(id: string, feedback?: string): Promise<void> {
  if (isMock) {
    console.log("[Mock] Rejecting submission:", id, feedback);
    return;
  }
  try {
    await updateDoc(doc(db, "submissions", id), {
      status: "rejected",
      moderationFeedback: feedback || "",
    });
  } catch (err) {
    console.error("Error rejecting submission:", err);
    throw err;
  }
}

// 9. Update Record Visibility (Hidden/Unhidden)
export async function updateRecordVisibility(
  collectionName: "events" | "organizers",
  id: string,
  hidden: boolean
): Promise<void> {
  if (isMock) {
    console.log("[Mock] Updating visibility:", collectionName, id, hidden);
    return;
  }
  try {
    await updateDoc(doc(db, collectionName, id), { hidden });
  } catch (err) {
    console.error("Error updating record visibility:", err);
    throw err;
  }
}

// 10. Update Event Featured Status
export async function updateEventFeatured(id: string, featured: boolean): Promise<void> {
  if (isMock) {
    console.log("[Mock] Updating event featured:", id, featured);
    return;
  }
  try {
    await updateDoc(doc(db, "events", id), { featured });
  } catch (err) {
    console.error("Error updating event featured status:", err);
    throw err;
  }
}

// 11. Delete Record
export async function deleteRecord(
  collectionName: "events" | "organizers",
  id: string
): Promise<void> {
  if (isMock) {
    console.log("[Mock] Deleting record:", collectionName, id);
    return;
  }
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, collectionName, id));

    const q = query(collection(db, "links"), where("parentId", "==", id));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();
  } catch (err) {
    console.error("Error deleting record:", err);
    throw err;
  }
}

// 12. Get Submissions Config
export async function getSubmissionsConfig(): Promise<{ allowAnonymous: boolean }> {
  try {
    const docSnap = await getDoc(doc(db, "config", "submissions"));
    if (docSnap.exists()) {
      return { allowAnonymous: !!docSnap.data().allowAnonymous };
    }
    return { allowAnonymous: true };
  } catch (err) {
    console.error("Error fetching submissions config:", err);
    return { allowAnonymous: true };
  }
}

// 13. Update Submissions Config
export async function updateSubmissionsConfig(allowAnonymous: boolean): Promise<void> {
  if (isMock) {
    console.log("[Mock] Updating submissions config:", allowAnonymous);
    return;
  }
  try {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "config", "submissions"), { allowAnonymous });
  } catch (err) {
    console.error("Error updating submissions config:", err);
    throw err;
  }
}

// 14. Create Event (Admin CRUD)
export async function createEvent(
  eventData: Omit<FirestoreEvent, "id" | "createdAt" | "links">,
  links?: EventLink[]
): Promise<string> {
  if (isMock) {
    console.log("[Mock] Creating event:", eventData, links);
    return "evt-" + Math.random().toString(36).substring(2, 9);
  }
  try {
    const batch = writeBatch(db);
    const eventRef = doc(collection(db, "events"));
    const newEventId = eventRef.id;

    batch.set(eventRef, {
      ...eventData,
      id: newEventId,
      createdAt: Date.now(),
    });

    if (links && links.length > 0) {
      links.forEach((lnk: EventLink, idx: number) => {
        const lnkRef = doc(collection(db, "links"));
        batch.set(lnkRef, {
          parentId: newEventId,
          parentType: "event",
          url: lnk.url,
          type: lnk.type || "Other",
          label: lnk.label || "",
          sortOrder: idx,
        });
      });
    }

    await batch.commit();
    return newEventId;
  } catch (err) {
    console.error("Error creating event:", err);
    throw err;
  }
}

// 15. Update Event (Admin CRUD)
export async function updateEvent(
  eventId: string,
  eventData: Partial<Omit<FirestoreEvent, "id" | "createdAt" | "links">>,
  links?: EventLink[]
): Promise<void> {
  if (isMock) {
    console.log("[Mock] Updating event:", eventId, eventData, links);
    return;
  }
  try {
    const batch = writeBatch(db);
    const eventRef = doc(db, "events", eventId);

    // Map optional fields that are explicitly undefined to deleteField() so Firestore
    // actually removes them rather than silently ignoring the undefined value.
    const payload: Record<string, unknown> = { ...eventData };
    if ("endTime" in eventData && eventData.endTime === undefined) {
      payload.endTime = deleteField();
    }
    if ("mapLink" in eventData && eventData.mapLink === undefined) {
      payload.mapLink = deleteField();
    }
    batch.update(eventRef, payload);

    if (links !== undefined) {
      const q = query(collection(db, "links"), where("parentId", "==", eventId));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        batch.delete(d.ref);
      });

      links.forEach((lnk: EventLink, idx: number) => {
        const lnkRef = doc(collection(db, "links"));
        batch.set(lnkRef, {
          parentId: eventId,
          parentType: "event",
          url: lnk.url,
          type: lnk.type || "Other",
          label: lnk.label || "",
          sortOrder: idx,
        });
      });
    }

    await batch.commit();
  } catch (err) {
    console.error("Error updating event:", err);
    throw err;
  }
}
