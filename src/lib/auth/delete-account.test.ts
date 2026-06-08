import { describe, expect, it } from "vitest";
import { buildActiveUserProfileRestore } from "@/lib/auth/delete-account";
import type { AuthProfile } from "@/types/auth";

const activeProfile: AuthProfile = {
  uid: "user-1",
  displayName: "Test User",
  email: "test@example.com",
  username: "testuser",
  phone: "+123",
  links: [{ label: "Site", url: "https://example.com" }],
  bio: "Bio",
  locale: "en",
  isAdmin: false,
  accountStatus: "active",
};

describe("buildActiveUserProfileRestore", () => {
  it("restores active account fields needed to sign in again", () => {
    expect(buildActiveUserProfileRestore(activeProfile)).toEqual({
      accountStatus: "active",
      displayName: "Test User",
      email: "test@example.com",
      phone: "+123",
      links: [{ label: "Site", url: "https://example.com" }],
      bio: "Bio",
      isAdmin: false,
      deletedAt: null,
    });
  });
});
