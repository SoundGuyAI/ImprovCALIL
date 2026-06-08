import type {
  AuthLocale,
  AuthProfile,
  EditableProfileFields,
  ProfileLink,
  PublicProfile,
} from "@/types/auth";

export interface StoredUserProfile {
  uid?: unknown;
  displayName?: unknown;
  email?: unknown;
  username?: unknown;
  phone?: unknown;
  links?: unknown;
  bio?: unknown;
  locale?: unknown;
  isAdmin?: unknown;
  accountStatus?: unknown;
}

export interface UserProfileWrite {
  uid: string;
  displayName: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  links: ProfileLink[];
  bio: string | null;
  locale: AuthLocale;
  isAdmin: boolean;
  accountStatus: "active" | "deleted";
}

export interface VerifiedProfileToken {
  uid: string;
  name?: unknown;
  email?: unknown;
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const MAX_LINKS = 5;

export function normalizeAuthLocale(locale: unknown): AuthLocale {
  return locale === "he" ? "he" : "en";
}

export function normalizeDisplayName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 80) : null;
}

export function normalizeUsername(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase().replace(/^@+/, "");
  return USERNAME_PATTERN.test(normalized) ? normalized : null;
}

export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 40) : null;
}

export function normalizeBio(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 500) : null;
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function normalizeProfileLinks(value: unknown): ProfileLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const data = item as Record<string, unknown>;
      const label = typeof data.label === "string" ? data.label.trim().slice(0, 40) : "";
      const url = typeof data.url === "string" ? data.url.trim().slice(0, 300) : "";
      if (!label || !url || !isSafeHttpUrl(url)) {
        return null;
      }
      return { label, url };
    })
    .filter((item): item is ProfileLink => item !== null)
    .slice(0, MAX_LINKS);
}

export function normalizeEditableProfileFields(input: EditableProfileFields): {
  displayName: string | null;
  username: string | null;
  phone: string | null;
  links: ProfileLink[];
  bio: string | null;
} {
  return {
    displayName: normalizeDisplayName(input.displayName),
    username: normalizeUsername(input.username),
    phone: normalizePhone(input.phone),
    links: normalizeProfileLinks(input.links),
    bio: normalizeBio(input.bio),
  };
}

function storedLinks(raw: StoredUserProfile | null): ProfileLink[] {
  return normalizeProfileLinks(raw?.links);
}

export function toAuthProfile(raw: StoredUserProfile | null, uid: string): AuthProfile {
  return {
    uid,
    displayName: typeof raw?.displayName === "string" ? raw.displayName : null,
    email: typeof raw?.email === "string" ? raw.email : null,
    username: typeof raw?.username === "string" ? raw.username : null,
    phone: typeof raw?.phone === "string" ? raw.phone : null,
    links: storedLinks(raw),
    bio: typeof raw?.bio === "string" ? raw.bio : null,
    locale: normalizeAuthLocale(raw?.locale),
    isAdmin: raw?.isAdmin === true,
    accountStatus: raw?.accountStatus === "deleted" ? "deleted" : "active",
  };
}

export function toPublicProfile(raw: StoredUserProfile | null, uid: string): PublicProfile | null {
  if (!raw) {
    return null;
  }
  const username = typeof raw?.username === "string" ? raw.username : null;
  if (!username || raw?.accountStatus === "deleted") {
    return null;
  }

  return {
    uid,
    displayName: typeof raw.displayName === "string" ? raw.displayName : null,
    username,
    links: storedLinks(raw),
    bio: typeof raw.bio === "string" ? raw.bio : null,
  };
}

export function buildUserProfileWrite(
  token: VerifiedProfileToken,
  existingProfile: StoredUserProfile | null,
  locale: unknown,
  requestedProfile: EditableProfileFields = {}
): UserProfileWrite {
  const editable = normalizeEditableProfileFields(requestedProfile);
  const existingDisplayName =
    typeof existingProfile?.displayName === "string" ? existingProfile.displayName : null;
  const existingEmail = typeof existingProfile?.email === "string" ? existingProfile.email : null;
  const tokenName = normalizeDisplayName(token.name);
  const tokenEmail = typeof token.email === "string" && token.email.length > 0 ? token.email : null;

  return {
    uid: token.uid,
    displayName: editable.displayName ?? existingDisplayName ?? tokenName,
    email: existingEmail ?? tokenEmail,
    username: editable.username ?? normalizeUsername(existingProfile?.username),
    phone: editable.phone ?? normalizePhone(existingProfile?.phone),
    links: editable.links.length > 0 ? editable.links : storedLinks(existingProfile),
    bio: editable.bio ?? normalizeBio(existingProfile?.bio),
    locale: normalizeAuthLocale(existingProfile?.locale ?? locale),
    isAdmin: existingProfile?.isAdmin === true,
    accountStatus: existingProfile?.accountStatus === "deleted" ? "deleted" : "active",
  };
}
