import { describe, expect, it } from "vitest";
import { isSafeLocalizedPath, resolveSafeNextPath, stripLocalePrefix } from "./redirect";

describe("isSafeLocalizedPath", () => {
  it("detects valid localized paths", () => {
    expect(isSafeLocalizedPath("/en")).toBe(true);
    expect(isSafeLocalizedPath("/he")).toBe(true);
    expect(isSafeLocalizedPath("/en/profile")).toBe(true);
    expect(isSafeLocalizedPath("/he/admin/dashboard")).toBe(true);
  });

  it("returns false for non-localized paths", () => {
    expect(isSafeLocalizedPath("/profile")).toBe(false);
    expect(isSafeLocalizedPath("")).toBe(false);
    expect(isSafeLocalizedPath(null)).toBe(false);
    expect(isSafeLocalizedPath(undefined)).toBe(false);
  });

  it("rejects unsafe paths", () => {
    expect(isSafeLocalizedPath("//google.com")).toBe(false);
    expect(isSafeLocalizedPath("/en\\something")).toBe(false);
  });
});

describe("resolveSafeNextPath", () => {
  it("returns input if already localized", () => {
    expect(resolveSafeNextPath("/en/profile", "en")).toBe("/en/profile");
    expect(resolveSafeNextPath("/he/profile", "en")).toBe("/he/profile");
  });

  it("prepends locale if path is safe and unlocalized", () => {
    expect(resolveSafeNextPath("/profile", "en")).toBe("/en/profile");
    expect(resolveSafeNextPath("/profile", "he")).toBe("/he/profile");
  });

  it("uses fallback locale if unsupported", () => {
    expect(resolveSafeNextPath("/profile", "fr")).toBe("/en/profile");
  });

  it("returns fallback root for unsafe/invalid input", () => {
    expect(resolveSafeNextPath("//google.com", "he")).toBe("/he");
    expect(resolveSafeNextPath(null, "en")).toBe("/en");
  });
});

describe("stripLocalePrefix", () => {
  it("removes locale prefixes correctly", () => {
    expect(stripLocalePrefix("/en/profile")).toBe("/profile");
    expect(stripLocalePrefix("/he/profile")).toBe("/profile");
    expect(stripLocalePrefix("/en")).toBe("/");
    expect(stripLocalePrefix("/he")).toBe("/");
  });

  it("leaves non-localized paths intact", () => {
    expect(stripLocalePrefix("/profile")).toBe("/profile");
    expect(stripLocalePrefix("/")).toBe("/");
    expect(stripLocalePrefix("/en-us/something")).toBe("/en-us/something");
  });
});
