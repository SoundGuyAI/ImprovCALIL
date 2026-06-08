export interface AuthProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  links: ProfileLink[];
  bio: string | null;
  locale: "en" | "he";
  isAdmin: boolean;
  accountStatus: "active" | "deleted";
}

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
}

export type AuthLocale = AuthProfile["locale"];

export interface ProfileLink {
  label: string;
  url: string;
}

export interface EditableProfileFields {
  displayName?: unknown;
  username?: unknown;
  phone?: unknown;
  links?: unknown;
  bio?: unknown;
}

export interface PublicProfile {
  uid: string;
  displayName: string | null;
  username: string;
  links: ProfileLink[];
  bio: string | null;
}
