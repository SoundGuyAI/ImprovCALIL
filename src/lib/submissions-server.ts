import "server-only";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { FirestoreSubmission } from "@/lib/db";

/** Create a pending submission via Admin SDK (bypasses client auth / allowAnonymous config). */
export async function createSubmissionAdmin(
  submission: Omit<FirestoreSubmission, "id" | "createdAt" | "status">
): Promise<string> {
  const db = getAdminFirestore();
  const docRef = await db.collection("submissions").add({
    ...submission,
    status: "pending",
    createdAt: Date.now(),
  });
  return docRef.id;
}
