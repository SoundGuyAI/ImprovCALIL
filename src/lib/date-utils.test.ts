import { describe, it, expect } from "vitest";
import {
  browserDatetimeLocalToJerusalemLocal,
  convertBrowserDatetimeLocalToUtc,
  convertJerusalemLocalToUtc,
  convertUtcToBrowserDatetimeLocal,
  convertUtcToJerusalemLocal,
  jerusalemLocalToBrowserDatetimeLocal,
} from "./date-utils";

describe("date-utils timezone conversion", () => {
  it("converts Jerusalem local time to UTC Unix timestamp correctly", () => {
    // 2026-06-25T20:00 (Jerusalem Summer Time UTC+3)
    const localStr = "2026-06-25T20:00";
    const expectedUtc = Date.UTC(2026, 5, 25, 17, 0); // 17:00 UTC
    expect(convertJerusalemLocalToUtc(localStr)).toBe(expectedUtc);

    // 2026-12-25T20:00 (Jerusalem Winter Time UTC+2)
    const localWinterStr = "2026-12-25T20:00";
    const expectedWinterUtc = Date.UTC(2026, 11, 25, 18, 0); // 18:00 UTC
    expect(convertJerusalemLocalToUtc(localWinterStr)).toBe(expectedWinterUtc);
  });

  it("converts UTC Unix timestamp to Jerusalem local time string correctly", () => {
    // 17:00 UTC on 2026-06-25 is 20:00 local time (Summer Time UTC+3)
    const utcTime = Date.UTC(2026, 5, 25, 17, 0);
    expect(convertUtcToJerusalemLocal(utcTime)).toBe("2026-06-25T20:00");

    // 18:00 UTC on 2026-12-25 is 20:00 local time (Winter Time UTC+2)
    const winterUtcTime = Date.UTC(2026, 11, 25, 18, 0);
    expect(convertUtcToJerusalemLocal(winterUtcTime)).toBe("2026-12-25T20:00");
  });

  it("handles empty or invalid inputs gracefully", () => {
    expect(convertJerusalemLocalToUtc("")).toBe(0);
    expect(convertUtcToJerusalemLocal(undefined)).toBe("");
    expect(convertUtcToJerusalemLocal(NaN)).toBe("");
    expect(convertBrowserDatetimeLocalToUtc("")).toBe(0);
    expect(browserDatetimeLocalToJerusalemLocal("")).toBe("");
    expect(jerusalemLocalToBrowserDatetimeLocal("")).toBe("");
  });

  it("round-trips Jerusalem time through browser datetime-local helpers", () => {
    const jerusalemStr = "2026-06-25T20:00";
    const browserStr = jerusalemLocalToBrowserDatetimeLocal(jerusalemStr);
    expect(browserDatetimeLocalToJerusalemLocal(browserStr)).toBe(jerusalemStr);
    const utc = convertJerusalemLocalToUtc(jerusalemStr);
    expect(convertUtcToBrowserDatetimeLocal(utc)).toBe(browserStr);
    expect(convertBrowserDatetimeLocalToUtc(browserStr)).toBe(utc);
  });
});
