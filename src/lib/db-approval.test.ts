import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(join(process.cwd(), "src", "lib", "db.ts"), "utf-8");

describe("submission approval publishing", () => {
  it("uses Firestore-generated document IDs instead of millisecond timestamps", () => {
    expect(dbSource).not.toContain("`evt-${Date.now()}`");
    expect(dbSource).not.toContain("`org-${Date.now()}`");
    expect(dbSource).toContain('const eventRef = doc(collection(db, "events"));');
    expect(dbSource).toContain('const organizerRef = doc(collection(db, "organizers"));');
  });
});
