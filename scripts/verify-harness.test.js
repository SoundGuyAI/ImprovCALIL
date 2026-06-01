import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { STEPS, formatFailuresReportMarkdown } = require("./verify-harness.js");

describe("verification harness steps", () => {
  it("keeps the merge gate checks in the required order", () => {
    expect(STEPS.map((step) => step.name)).toEqual([
      "Prettier Formatting",
      "Linting",
      "TypeScript Safety",
      "Unit Tests",
      "Production Build",
      "End-to-End Tests",
    ]);
  });

  it("maps each step to remediation rules for failure reporting", () => {
    expect(STEPS.every((step) => step.rules.length > 0)).toBe(true);
    expect(STEPS.find((step) => step.name === "Unit Tests")).toMatchObject({
      command: "npm",
      args: ["test"],
      rules: [".cursor/rules/vitest-unit-testing.mdc"],
    });
  });
});

describe("formatFailuresReportMarkdown", () => {
  it("includes the failing command, exit code, governing rules, and output snippet", () => {
    const markdown = formatFailuresReportMarkdown({
      stepName: "Unit Tests",
      command: "npm test",
      exitCode: 1,
      governingRules: [".cursor/rules/vitest-unit-testing.mdc"],
      description: "Vitest unit tests failed to pass.",
      outputSnippet: "expected 1 to be 2",
    });

    expect(markdown).toContain("# ❌ Harness Verification Failure: Unit Tests");
    expect(markdown).toContain("* **Command Executed**: `npm test`");
    expect(markdown).toContain("* **Exit Code**: `1`");
    expect(markdown).toContain("vitest-unit-testing.mdc");
    expect(markdown).toContain("expected 1 to be 2");
  });
});
