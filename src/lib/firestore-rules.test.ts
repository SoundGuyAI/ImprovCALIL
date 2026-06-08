import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rules = readFileSync(join(process.cwd(), "firestore.rules"), "utf-8");

describe("Firestore security rules", () => {
  it("uses custom claims as the only admin authority source", () => {
    expect(rules).toContain("return isAuthenticated() && request.auth.token.isAdmin == true;");
    expect(rules).not.toContain("get(/databases/$(database)/documents/users");
  });

  it("does not allow unauthenticated clients to seed public collections", () => {
    expect(rules).not.toMatch(/allow write: if isAdmin\(\) \|\| !exists/);
    expect(rules.match(/allow write: if isAdmin\(\);/g)).toHaveLength(4);
  });

  it("restricts organizer writes to admins", () => {
    expect(rules).toMatch(
      /match \/organizers\/\{organizerId\}[\s\S]*allow create, update, delete: if isAdmin\(\);/
    );
  });

  it("keeps public submission creation constrained by validation", () => {
    expect(rules).toContain("allow create: if isValidSubmissionCreate();");
    expect(rules).toContain("request.resource.data.status == 'pending'");
    expect(rules).toContain("request.resource.data.type in ['event', 'organizer']");
  });
});
