import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(join(process.cwd(), "src", "lib", "auth", "server.ts"), "utf-8");

function getDeleteCurrentAccountTail(source: string): string {
  const start = source.indexOf("export async function deleteCurrentAccount");
  expect(start).toBeGreaterThanOrEqual(0);
  const bodyStart = source.indexOf("{", start);
  const bodyEnd = source.indexOf("\nasync function assertUsernameAvailable", bodyStart);
  expect(bodyEnd).toBeGreaterThan(bodyStart);
  return source.slice(bodyStart, bodyEnd);
}

describe("deleteCurrentAccount finalization order", () => {
  it("clears admin claims and commits Firestore cleanup before deleting the Auth user", () => {
    const tail = getDeleteCurrentAccountTail(serverSource);
    const claimIndex = tail.indexOf("await syncAdminCustomClaim(profile.uid, false)");
    const commitIndex = tail.indexOf("await batch.commit()");
    const deleteIndex = tail.indexOf("await auth.deleteUser(profile.uid)");

    expect(claimIndex).toBeGreaterThanOrEqual(0);
    expect(commitIndex).toBeGreaterThan(claimIndex);
    expect(deleteIndex).toBeGreaterThan(commitIndex);
  });

  it("does not call syncAdminCustomClaim after auth.deleteUser", () => {
    const tail = getDeleteCurrentAccountTail(serverSource);
    const deleteIndex = tail.indexOf("await auth.deleteUser(profile.uid)");
    const claimAfterDelete = tail.indexOf("await syncAdminCustomClaim(profile.uid, false)", deleteIndex);

    expect(deleteIndex).toBeGreaterThanOrEqual(0);
    expect(claimAfterDelete).toBe(-1);
  });
});
