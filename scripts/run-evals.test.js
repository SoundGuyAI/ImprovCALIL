import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { evaluateField, formatFieldResultsTable } = require("./run-evals.js");

describe("evaluateField", () => {
  it("passes exact and case-insensitive string matches with full score", () => {
    expect(evaluateField("region", "Jerusalem", "Jerusalem")).toEqual({
      passed: true,
      score: 1.0,
      msg: "Exact match",
    });

    expect(evaluateField("cost", "free", "Free")).toEqual({
      passed: true,
      score: 1.0,
      msg: "Case-insensitive exact match",
    });
  });

  it("gives partial credit for name, location, and description substring overlap", () => {
    expect(
      evaluateField(
        "description",
        "Workshop and jam for improvisers",
        "Workshop and jam for improvisers of every level"
      )
    ).toEqual({
      passed: true,
      score: 0.8,
      msg: "Substring overlap match",
    });
  });

  it("scores links by matching URL and case-insensitive type", () => {
    const parsedLinks = [
      { url: "https://example.com/event", type: "facebook event" },
      { url: "https://example.com/chat", type: "WhatsApp Group" },
    ];
    const targetLinks = [
      { url: "https://example.com/event", type: "Facebook Event" },
      { url: "https://example.com/missing", type: "WhatsApp group" },
    ];

    expect(evaluateField("links", parsedLinks, targetLinks)).toEqual({
      passed: false,
      score: 0.5,
      msg: "Matched 1/2 elements",
    });
  });

  it("fails array comparisons when the parsed field is not an array", () => {
    expect(evaluateField("links", "https://example.com/event", [])).toEqual({
      passed: false,
      score: 0.0,
      msg: "Expected array, got string",
    });
  });
});

describe("formatFieldResultsTable", () => {
  it("escapes markdown table delimiters and line breaks in details", () => {
    const table = formatFieldResultsTable({
      description: {
        score: 0,
        passed: false,
        msg: "Expected A | got B\nSecond line",
      },
    });

    expect(table).toContain("Expected A \\| got B Second line");
  });
});
