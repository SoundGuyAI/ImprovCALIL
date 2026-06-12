import { describe, it, expect } from "vitest";
import { formatAppVersionLabel, APP_VERSION } from "./version";
import pkg from "../../package.json";

describe("formatAppVersionLabel", () => {
  it("asserts that APP_VERSION matches package.json version", () => {
    expect(APP_VERSION).toBe(pkg.version);
    expect(formatAppVersionLabel()).toContain(pkg.version);
  });

  it("includes version and commit when commit is present", () => {
    expect(formatAppVersionLabel("1.2.3", "abc1234")).toBe("v1.2.3 (abc1234)");
  });

  it("omits commit suffix when commit is unknown", () => {
    expect(formatAppVersionLabel("1.2.3", "unknown")).toBe("v1.2.3");
  });

  it("omits commit suffix when commit is empty", () => {
    expect(formatAppVersionLabel("1.2.3", "")).toBe("v1.2.3");
  });
});
