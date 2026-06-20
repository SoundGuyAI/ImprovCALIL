import type { AuthProfile } from "@/types/auth";
import type { FirestoreOrganizer, FirestoreEvent } from "./db";

export function isUserAdmin(profile: AuthProfile | null): boolean {
  if (!profile) {
    return false;
  }
  if (profile.isAdmin) {
    return true;
  }
  // Local development bypass support (also allow during E2E tests)
  const isDevOrTest =
    process.env.NODE_ENV !== "production" &&
    (process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ADMIN_DEV_UID === "admin-test");
  if (
    isDevOrTest &&
    (profile.uid === "admin-test" ||
      (process.env.NEXT_PUBLIC_ADMIN_DEV_UID &&
        profile.uid === process.env.NEXT_PUBLIC_ADMIN_DEV_UID))
  ) {
    return true;
  }
  return false;
}

export function canUserEditOrganizer(
  profile: AuthProfile | null,
  organizer: FirestoreOrganizer | null
): boolean {
  if (!profile || !organizer) {
    return false;
  }
  if (isUserAdmin(profile)) {
    return true;
  }
  // Cast because ownerUid will be added to FirestoreOrganizer
  const ownerUid = (organizer as { ownerUid?: string | null }).ownerUid;
  return !!ownerUid && ownerUid === profile.uid;
}

export function canUserEditEvent(
  profile: AuthProfile | null,
  event: FirestoreEvent | null
): boolean {
  if (!profile || !event) {
    return false;
  }
  if (isUserAdmin(profile)) {
    return true;
  }
  return false;
}
