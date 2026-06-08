import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(join(process.cwd(), "src", "lib", "auth", "server.ts"), "utf-8");

describe("deleteCurrentAccount ordering", () => {
  it("commits Firestore cleanup before deleting the Auth user", () => {
    const fnStart = serverSource.indexOf("export async function deleteCurrentAccount");
    const fnEnd = serverSource.indexOf("async function assertUsernameAvailable", fnStart);
    const fnBody = serverSource.slice(fnStart, fnEnd);

    const commitIndex = fnBody.indexOf("await batch.commit()");
    const deleteIndex = fnBody.indexOf("await auth.deleteUser(profile.uid)");
    const syncIndex = fnBody.indexOf("await syncAdminCustomClaim(profile.uid, false)");

    expect(commitIndex).toBeGreaterThan(-1);
    expect(deleteIndex).toBeGreaterThan(-1);
    expect(syncIndex).toBeGreaterThan(-1);
    expect(syncIndex).toBeLessThan(deleteIndex);
    expect(commitIndex).toBeLessThan(deleteIndex);
  });
});
