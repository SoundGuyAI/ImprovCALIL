import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";

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

describe("organizer schema and data integrity", () => {
  it("schema defines the correct structure and enums", () => {
    expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(schema.type).toBe("array");

    const orgSchema = schema.definitions.organizer;
    expect(orgSchema.properties.type.enum).toEqual(["Group", "School", "Theater", "Other"]);
    expect(orgSchema.properties.region.enum).toEqual([
      "Tel-Aviv",
      "Jerusalem",
      "Beer-Sheva",
      "Haifa",
      "Hasharon",
      "Other areas",
    ]);
    expect(orgSchema.properties.languages.items.enum).toEqual(["he", "en"]);
    expect(orgSchema.properties.links.items.properties.type.enum).toEqual([
      "Website",
      "Facebook",
      "Facebook event",
      "WhatsApp group",
      "Instagram",
      "Other",
    ]);
  });

  it("israeli_improv_organizers.json contains valid data conforming to the schema and has exactly 17 organizers", () => {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const valid = validate(organizers);
    if (!valid) {
      console.error("Schema validation errors:", validate.errors);
    }
    expect(valid).toBe(true);
    expect(organizers.length).toBe(17);
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
