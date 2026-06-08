import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(join(process.cwd(), "src", "lib", "auth", "server.ts"), "utf-8");

describe("deleteCurrentAccount operation order", () => {
  it("clears admin claims and commits Firestore before deleting the Auth user", () => {
    const deleteBlock = serverSource.slice(
      serverSource.indexOf("export async function deleteCurrentAccount"),
      serverSource.indexOf("async function assertUsernameAvailable")
    );

    const claimIndex = deleteBlock.indexOf("syncAdminCustomClaim(profile.uid, false)");
    const batchIndex = deleteBlock.indexOf("await batch.commit()");
    const deleteUserIndex = deleteBlock.indexOf("await auth.deleteUser(profile.uid)");

    expect(claimIndex).toBeGreaterThan(-1);
    expect(batchIndex).toBeGreaterThan(claimIndex);
    expect(deleteUserIndex).toBeGreaterThan(batchIndex);
  });
});
