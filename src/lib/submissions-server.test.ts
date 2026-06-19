import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  join(process.cwd(), "src", "app", "api", "submissions", "json", "route.ts"),
  "utf-8"
);
const serverSource = readFileSync(
  join(process.cwd(), "src", "lib", "submissions-server.ts"),
  "utf-8"
);

describe("JSON submission API server writes", () => {
  it("creates submissions through the Admin SDK, not the unauthenticated client SDK", () => {
    expect(routeSource).toContain("createSubmissionAdmin");
    expect(routeSource).not.toContain('from "@/lib/db"');
    expect(serverSource).toContain("getAdminFirestore");
    expect(serverSource).toContain('status: "pending"');
  });
});
