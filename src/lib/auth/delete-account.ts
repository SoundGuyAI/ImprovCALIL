import type { AuthProfile } from "@/types/auth";

export interface OrphanedOwnerMetadata {
  ownerStatus: "orphaned";
  ownerDeletedAt: unknown;
}

export function buildActiveUserProfileRestore(profile: AuthProfile): Record<string, unknown> {
  return {
    accountStatus: "active",
    displayName: profile.displayName,
    email: profile.email,
    phone: profile.phone,
    links: profile.links,
    bio: profile.bio,
    isAdmin: profile.isAdmin,
    deletedAt: null,
  };
}

export function isMatchingAccountEmail(profileEmail: string | null, typedEmail: unknown): boolean {
  if (!profileEmail || typeof typedEmail !== "string") {
    return false;
  }

  return profileEmail.trim().toLowerCase() === typedEmail.trim().toLowerCase();
}

export function buildOrphanedOwnerMetadata(ownerDeletedAt: unknown): OrphanedOwnerMetadata {
  return {
    ownerStatus: "orphaned",
    ownerDeletedAt,
  };
}
