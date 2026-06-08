export interface OrphanedOwnerMetadata {
  ownerStatus: "orphaned";
  ownerDeletedAt: unknown;
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
