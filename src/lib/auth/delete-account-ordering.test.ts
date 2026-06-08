import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(join(process.cwd(), "src", "lib", "auth", "server.ts"), "utf-8");

describe("deleteCurrentAccount sequencing", () => {
  it("commits Firestore mutations before clearing admin claims or deleting Auth user", () => {
    const deleteAccountStart = serverSource.indexOf("export async function deleteCurrentAccount");
    const deleteAccountEnd = serverSource.indexOf("async function assertUsernameAvailable", deleteAccountStart);
    const deleteAccountBody = serverSource.slice(deleteAccountStart, deleteAccountEnd);

    const batchCommitIndex = deleteAccountBody.indexOf("await batch.commit()");
    const syncClaimIndex = deleteAccountBody.indexOf("await syncAdminCustomClaim(profile.uid, false)");
    const deleteUserIndex = deleteAccountBody.indexOf("await auth.deleteUser(profile.uid)");

    expect(batchCommitIndex).toBeGreaterThan(-1);
    expect(syncClaimIndex).toBeGreaterThan(-1);
    expect(deleteUserIndex).toBeGreaterThan(-1);
    expect(batchCommitIndex).toBeLessThan(syncClaimIndex);
    expect(syncClaimIndex).toBeLessThan(deleteUserIndex);
  });
});
