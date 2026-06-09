import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

const schemaPath = join(process.cwd(), "docs", "organizer-schema.json");
const dataPath = join(process.cwd(), "docs", "israeli_improv_organizers.json");

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

interface LocalizedString {
  locale: "en" | "he";
  value: string;
}

interface ExpectedLink {
  url: string;
  type: string;
  label?: string;
}

interface ExpectedOrganizer {
  name: LocalizedString[];
  type: string;
  description: LocalizedString[];
  region: string;
  languages: string[];
  logoUrl?: string;
  links?: ExpectedLink[];
}

const organizers = JSON.parse(readFileSync(dataPath, "utf-8")) as ExpectedOrganizer[];

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateOrganizers = ajv.compile(schema);

describe("organizer schema and data integrity", () => {
  it("schema defines the correct structure and enums", () => {
    const organizerRecord = schema.definitions.organizerRecord;

    expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(schema.type).toBe("array");
    expect(organizerRecord.properties.type.enum).toEqual(["Group", "School", "Theater", "Other"]);
    expect(organizerRecord.properties.region.enum).toEqual([
      "Tel-Aviv",
      "Jerusalem",
      "Beer-Sheva",
      "Haifa",
      "Hasharon",
      "Other areas",
    ]);
    expect(organizerRecord.properties.languages.items.enum).toEqual(["he", "en"]);
    expect(organizerRecord.properties.links.items.properties.type.enum).toEqual([
      "Website",
      "Facebook",
      "Facebook event",
      "WhatsApp group",
      "Instagram",
      "Other",
    ]);
  });

  it("israeli_improv_organizers.json contains valid data conforming to the schema", () => {
    const valid = validateOrganizers(organizers);
    expect(
      valid,
      `Data file validation failed: ${JSON.stringify(validateOrganizers.errors, null, 2)}`
    ).toBe(true);
  });

  it("does not include general venues or unverified entries", () => {
    // Unverified/venues check (Monty, Line Up, Clipa, Tzavta, Cameri, Nissan Nativ)
    const forbiddenSubstrings = [
      "monty",
      "line up",
      "ליין אפ",
      "מונטי",
      "clipa",
      "קליפה",
      "tzavta",
      "צוותא",
      "cameri",
      "קאמרי",
      "nissan nativ",
      "ניסן נתיב",
    ];

    organizers.forEach((org: ExpectedOrganizer) => {
      org.name.forEach((localizedName) => {
        const nameLower = localizedName.value.toLowerCase();
        forbiddenSubstrings.forEach((forbidden) => {
          expect(
            nameLower,
            `Organizer name component "${localizedName.value}" must not contain forbidden word "${forbidden}"`
          ).not.toContain(forbidden);
        });
      });
    });
  });
});
