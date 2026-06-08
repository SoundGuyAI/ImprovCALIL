import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(join(process.cwd(), "src", "lib", "auth", "server.ts"), "utf-8");

describe("session profile admin claim sync", () => {
  it("uses Firestore isAdmin as the sole source of truth when refreshing session claims", () => {
    const sessionProfileBlock = serverSource.slice(
      serverSource.indexOf("export async function getProfileForSessionCookie"),
      serverSource.indexOf("export async function createCustomTokenForCurrentProfile")
    );

    expect(sessionProfileBlock).toContain(
      "shouldGrantAdminClaim(userData?.isAdmin === true, decoded.uid)"
    );
    expect(sessionProfileBlock).not.toContain("decoded.isAdmin");
  });
});
