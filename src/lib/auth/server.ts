import "server-only";

import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { AUTH_SESSION_COOKIE, AUTH_SESSION_EXPIRES_IN_MS } from "@/lib/auth/constants";
import { isMatchingAccountEmail } from "@/lib/auth/delete-account";
import {
  buildUserProfileWrite,
  normalizeAuthLocale,
  normalizeEditableProfileFields,
  normalizeUsername,
  toAuthProfile,
} from "@/lib/auth/profile";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import { isUserAdmin } from "@/lib/permissions";
import type { AuthLocale, AuthProfile, EditableProfileFields } from "@/types/auth";

const USERS_COLLECTION = "users";

function shouldGrantAdminClaim(profileIsAdmin: boolean | undefined, uid: string): boolean {
  if (profileIsAdmin) {
    return true;
  }
  return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ADMIN_DEV_UID === uid;
}

async function syncAdminCustomClaim(uid: string, shouldBeAdmin: boolean): Promise<void> {
  const auth = getAdminAuth();
  const userRecord = await auth.getUser(uid);
  const currentIsAdmin = userRecord.customClaims?.isAdmin === true;
  if (currentIsAdmin === shouldBeAdmin) {
    return;
  }

  const nextClaims = { ...(userRecord.customClaims ?? {}) };
  if (shouldBeAdmin) {
    nextClaims.isAdmin = true;
  } else {
    delete nextClaims.isAdmin;
  }
  await auth.setCustomUserClaims(uid, nextClaims);
}

export async function createSessionAndProfile(
  idToken: string,
  locale: unknown,
  requestedProfile?: EditableProfileFields
): Promise<{ sessionCookie: string; profile: AuthProfile }> {
  const auth = getAdminAuth();
  const db = getAdminFirestore();
  const decodedToken = await auth.verifyIdToken(idToken);
  const userRef = db.collection(USERS_COLLECTION).doc(decodedToken.uid);
  const existingSnapshot = await userRef.get();
  const existing = existingSnapshot.exists ? (existingSnapshot.data() ?? null) : null;
  if (existing?.accountStatus === "deleted") {
    throw new Error("This account has been deleted");
  }
  const profileWrite = buildUserProfileWrite(decodedToken, existing, locale, requestedProfile);
  if (profileWrite.username) {
    await assertUsernameAvailable(profileWrite.username, decodedToken.uid);
  }
  const now = FieldValue.serverTimestamp();

  await userRef.set(
    {
      ...profileWrite,
      createdAt: existingSnapshot.exists ? (existing?.createdAt ?? now) : now,
      updatedAt: now,
    },
    { merge: true }
  );

  await syncAdminCustomClaim(
    decodedToken.uid,
    shouldGrantAdminClaim(profileWrite.isAdmin, decodedToken.uid)
  );

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: AUTH_SESSION_EXPIRES_IN_MS,
  });

  return {
    sessionCookie,
    profile: toAuthProfile(profileWrite, decodedToken.uid),
  };
}

export async function updateCurrentProfile(
  profile: AuthProfile,
  input: EditableProfileFields
): Promise<AuthProfile> {
  const db = getAdminFirestore();
  const userRef = db.collection(USERS_COLLECTION).doc(profile.uid);
  const snapshot = await userRef.get();
  const existing = snapshot.exists ? (snapshot.data() ?? null) : null;
  if (existing?.accountStatus === "deleted") {
    throw new Error("This account has been deleted");
  }

  const existingUsername = typeof existing?.username === "string" ? existing.username : null;
  const isUsernameChanging = input.username !== undefined && input.username !== existingUsername;

  if (isUsernameChanging) {
    if (input.username !== null && input.username !== "") {
      if (typeof input.username !== "string") {
        throw new Error("Invalid username format");
      }
      if (input.username.trim() !== "") {
        const normalizedUsername = normalizeUsername(input.username);
        if (normalizedUsername === null) {
          throw new Error("Invalid username format");
        }
      }
    }
  }

  const normalized = normalizeEditableProfileFields(input);
  if (isUsernameChanging && normalized.username) {
    await assertUsernameAvailable(normalized.username, profile.uid);
  }

  const write: Record<string, unknown> = {
    locale: profile.locale,
    isAdmin: existing?.isAdmin === true,
    accountStatus: "active",
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (input.displayName !== undefined) {
    write.displayName = normalized.displayName ?? FieldValue.delete();
  }
  if (input.username !== undefined && isUsernameChanging) {
    write.username = normalized.username ?? FieldValue.delete();
  }
  if (input.phone !== undefined) {
    write.phone = normalized.phone ?? FieldValue.delete();
  }
  if (input.links !== undefined) {
    write.links = normalized.links;
  }
  if (input.bio !== undefined) {
    write.bio = normalized.bio ?? FieldValue.delete();
  }

  await userRef.set(write, { merge: true });

  const updatedData = {
    ...existing,
    displayName:
      input.displayName !== undefined ? normalized.displayName : (existing?.displayName ?? null),
    username:
      input.username !== undefined && isUsernameChanging
        ? normalized.username
        : (existingUsername ?? null),
    phone: input.phone !== undefined ? normalized.phone : (existing?.phone ?? null),
    links: input.links !== undefined ? normalized.links : (existing?.links ?? []),
    bio: input.bio !== undefined ? normalized.bio : (existing?.bio ?? null),
    locale: profile.locale,
    isAdmin: existing?.isAdmin === true,
    accountStatus: "active" as const,
  };

  return toAuthProfile(
    {
      ...updatedData,
      uid: profile.uid,
      email: typeof existing?.email === "string" ? existing.email : profile.email,
    },
    profile.uid
  );
}

export async function deleteCurrentAccount(
  profile: AuthProfile,
  typedEmail: unknown
): Promise<void> {
  if (!isMatchingAccountEmail(profile.email, typedEmail)) {
    throw new Error("Email confirmation does not match");
  }

  const auth = getAdminAuth();
  const db = getAdminFirestore();
  const now = FieldValue.serverTimestamp();
  const batch = db.batch();

  // 1. Orphan organizers
  const organizersSnapshot = await db
    .collection("organizers")
    .where("ownerUid", "==", profile.uid)
    .get();
  organizersSnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      ownerUid: null,
      ownerStatus: "orphaned",
      ownerDeletedAt: now,
    });
  });

  // 2. Orphan submissions by UID
  const submissionsSnapshot = await db
    .collection("submissions")
    .where("ownerUid", "==", profile.uid)
    .get();
  submissionsSnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      ownerUid: null,
      ownerStatus: "orphaned",
      ownerDeletedAt: now,
    });
  });

  // 3. Orphan submissions by Email
  if (profile.email) {
    const submissionsByEmailSnapshot = await db
      .collection("submissions")
      .where("submitterContact.email", "==", profile.email)
      .get();
    submissionsByEmailSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        submitterContact: {
          email: "deleted-user@soundguy.ai",
          phone: null,
        },
        ownerStatus: "orphaned",
        ownerDeletedAt: now,
      });
    });
  }

  // 4. Mark user profile as deleted
  batch.set(
    db.collection(USERS_COLLECTION).doc(profile.uid),
    {
      accountStatus: "deleted",
      displayName: "Deleted user",
      email: null,
      phone: null,
      links: [],
      bio: null,
      isAdmin: false,
      deletedAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  await syncAdminCustomClaim(profile.uid, false);
  await batch.commit();
  await auth.deleteUser(profile.uid);
}

async function assertUsernameAvailable(username: string, uid: string): Promise<void> {
  const normalized = normalizeUsername(username);
  if (!normalized) {
    return;
  }

  const db = getAdminFirestore();
  const matches = await db
    .collection(USERS_COLLECTION)
    .where("username", "==", normalized)
    .limit(2)
    .get();
  const taken = matches.docs.some((doc) => doc.id !== uid);
  if (taken) {
    throw new Error("Username is already taken");
  }
}

export async function getProfileForSessionCookie(
  sessionCookie: string | undefined
): Promise<AuthProfile | null> {
  if (!sessionCookie) {
    return null;
  }

  try {
    const auth = getAdminAuth();
    const db = getAdminFirestore();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const snapshot = await db.collection(USERS_COLLECTION).doc(decoded.uid).get();
    const userData = snapshot.exists ? (snapshot.data() ?? null) : null;
    if (userData?.accountStatus === "deleted") {
      return null;
    }
    const profile = toAuthProfile(userData, decoded.uid);

    await syncAdminCustomClaim(
      decoded.uid,
      shouldGrantAdminClaim(userData?.isAdmin === true, decoded.uid)
    );

    return profile;
  } catch {
    return null;
  }
}

export async function createCustomTokenForCurrentProfile(): Promise<string | null> {
  const profile = await getCurrentProfile();
  if (!profile || !isUserAdmin(profile)) {
    return null;
  }

  return getAdminAuth().createCustomToken(profile.uid);
}

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  return getProfileForSessionCookie(sessionCookie);
}

export async function requireCurrentProfile(): Promise<AuthProfile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Authentication required");
  }

  return profile;
}

export function normalizeRouteLocale(locale: unknown): AuthLocale {
  return normalizeAuthLocale(locale);
}
