import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const {
  STEPS,
  ensureReportDir,
  formatFailuresReportMarkdown,
  writeFailuresReport,
} = require("./verify-harness.js");

const REPORT_DIR = path.join(process.cwd(), ".agents", "reports");

describe("verification harness steps", () => {
  it("keeps the merge gate checks in the required order", () => {
    expect(STEPS.map((step) => step.name)).toEqual([
      "Prettier Formatting Check",
      "ESLint Code Linting",
      "TypeScript Compilation Safety (Type check)",
      "Vitest Unit & Integration Tests",
      "Next.js Production Build",
      "End-to-End Tests",
    ]);
  });

  it("maps each step to remediation rules for failure reporting", () => {
    expect(STEPS.every((step) => step.rules.length > 0)).toBe(true);
    expect(STEPS.find((step) => step.name === "Vitest Unit & Integration Tests")).toMatchObject({
      command: "npm",
      args: ["run", "test"],
      rules: [".cursor/rules/vitest-unit-testing.mdc"],
    });
  });
});

describe("formatFailuresReportMarkdown", () => {
  it("includes the failing command, exit code, governing rules, and output snippet", () => {
    const markdown = formatFailuresReportMarkdown({
      stepName: "Vitest Unit & Integration Tests",
      command: "npm run test",
      exitCode: 1,
      governingRules: [".cursor/rules/vitest-unit-testing.mdc"],
      description: "Vitest unit tests failed to pass.",
      outputSnippet: "expected 1 to be 2",
    });

    expect(markdown).toContain("# 🚨 Agent Verification Failure Report");
    expect(markdown).toContain(
      "The local verification harness encountered a failure at **Vitest Unit & Integration Tests**."
    );
    expect(markdown).toContain("- **Command:** `npm run test`");
    expect(markdown).toContain("- **Exit Code:** 1");
    expect(markdown).toContain("vitest-unit-testing.mdc");
    expect(markdown).toContain("expected 1 to be 2");
  });
});

describe("writeFailuresReport", () => {
  afterEach(() => {
    fs.rmSync(REPORT_DIR, { recursive: true, force: true });
  });

  it("creates the reports directory before writing failure artifacts", () => {
    fs.rmSync(REPORT_DIR, { recursive: true, force: true });
    expect(fs.existsSync(REPORT_DIR)).toBe(false);

    writeFailuresReport({
      stepName: "Prettier Formatting Check",
      command: "npx prettier --check .",
      exitCode: 1,
      outputSnippet: "formatting error",
    });

    expect(fs.existsSync(REPORT_DIR)).toBe(true);
    expect(fs.existsSync(path.join(REPORT_DIR, "failures.json"))).toBe(true);
    expect(fs.existsSync(path.join(REPORT_DIR, "failures.md"))).toBe(true);
  });

  it("ensureReportDir is idempotent when the directory already exists", () => {
    ensureReportDir();
    ensureReportDir();
    expect(fs.existsSync(REPORT_DIR)).toBe(true);
  });
});
