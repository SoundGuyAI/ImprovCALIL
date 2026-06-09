import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const schemaPath = join(process.cwd(), "docs", "organizer-schema.json");
const dataPath = join(process.cwd(), "docs", "israeli_improv_organizers.json");

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

interface ExpectedLink {
  url: string;
  type: string;
  label?: string;
}

interface ExpectedOrganizer {
  name: string;
  type: string;
  description: string;
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
    expect(schema.items.properties.type.enum).toEqual(["Group", "School", "Theater", "Other"]);
    expect(schema.items.properties.region.enum).toEqual([
      "Tel-Aviv",
      "Jerusalem",
      "Beer-Sheva",
      "Haifa",
      "Hasharon",
      "Other areas",
    ]);
    expect(schema.items.properties.languages.items.enum).toEqual(["he", "en"]);
    expect(schema.items.properties.links.items.properties.type.enum).toEqual([
      "Website",
      "Facebook",
      "Facebook event",
      "WhatsApp group",
      "Instagram",
      "Other",
    ]);
  });

  it("israeli_improv_organizers.json contains valid data conforming to the schema", () => {
    expect(Array.isArray(organizers)).toBe(true);
    expect(organizers.length).toBe(17);

    const validTypes = schema.items.properties.type.enum;
    const validRegions = schema.items.properties.region.enum;
    const validLanguages = schema.items.properties.languages.items.enum;
    const validLinkTypes = schema.items.properties.links.items.properties.type.enum;

    organizers.forEach((org: ExpectedOrganizer, idx: number) => {
      const name = org.name;
      expect(name, `Organizer #${idx} name`).toBeDefined();
      expect(typeof name, `Organizer #${idx} name type`).toBe("string");

      expect(validTypes, `Organizer #${idx} type "${org.type}"`).toContain(org.type);
      expect(org.description, `Organizer #${idx} description`).toBeDefined();
      expect(typeof org.description, `Organizer #${idx} description type`).toBe("string");

      expect(validRegions, `Organizer #${idx} region "${org.region}"`).toContain(org.region);

      expect(Array.isArray(org.languages), `Organizer #${idx} languages is array`).toBe(true);
      expect(org.languages.length, `Organizer #${idx} languages is not empty`).toBeGreaterThan(0);
      expect(org.languages.length, `Organizer #${idx} languages must be unique`).toBe(
        new Set(org.languages).size
      );
      org.languages.forEach((lang: string) => {
        expect(validLanguages, `Organizer #${idx} language "${lang}"`).toContain(lang);
      });

      if (org.logoUrl !== undefined) {
        expect(typeof org.logoUrl, `Organizer #${idx} logoUrl type`).toBe("string");
      }

      if (org.links !== undefined) {
        expect(Array.isArray(org.links), `Organizer #${idx} links is array`).toBe(true);
        org.links.forEach((link: ExpectedLink, lIdx: number) => {
          expect(link.url, `Organizer #${idx} link #${lIdx} url`).toBeDefined();
          expect(typeof link.url, `Organizer #${idx} link #${lIdx} url type`).toBe("string");
          expect(validLinkTypes, `Organizer #${idx} link #${lIdx} type "${link.type}"`).toContain(
            link.type
          );
          if (link.label !== undefined) {
            expect(typeof link.label, `Organizer #${idx} link #${lIdx} label type`).toBe("string");
          }

          // Check for unexpected properties in link object
          const allowedLinkKeys = ["url", "type", "label"];
          Object.keys(link).forEach((k) => {
            expect(allowedLinkKeys, `Organizer #${idx} link #${lIdx} property "${k}"`).toContain(k);
          });
        });
      }

      // Check for unexpected properties in organizer object
      const allowedOrgKeys = [
        "name",
        "type",
        "description",
        "region",
        "languages",
        "logoUrl",
        "links",
      ];
      Object.keys(org).forEach((k) => {
        expect(allowedOrgKeys, `Organizer #${idx} property "${k}"`).toContain(k);
      });
    });
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
      const nameLower = org.name.toLowerCase();
      forbiddenSubstrings.forEach((forbidden) => {
        expect(
          nameLower,
          `Organizer "${org.name}" must not contain forbidden word "${forbidden}"`
        ).not.toContain(forbidden);
      });
    });
  });
});
