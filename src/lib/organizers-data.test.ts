import { readFileSync } from "node:fs";
import { join } from "node:path";
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

describe("organizer schema and data integrity", () => {
  it("schema defines the correct structure and enums", () => {
    expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(schema.type).toBe("object");
    expect(schema.properties.type.enum).toEqual(["Group", "School", "Theater", "Other"]);
    expect(schema.properties.region.enum).toEqual([
      "Tel-Aviv",
      "Jerusalem",
      "Beer-Sheva",
      "Haifa",
      "Hasharon",
      "Other areas",
    ]);
    expect(schema.properties.languages.items.enum).toEqual(["he", "en"]);
    expect(schema.properties.links.items.properties.type.enum).toEqual([
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
    expect(organizers.length).toBeGreaterThan(0);

    const validTypes = schema.properties.type.enum;
    const validRegions = schema.properties.region.enum;
    const validLanguages = schema.properties.languages.items.enum;
    const validLinkTypes = schema.properties.links.items.properties.type.enum;

    organizers.forEach((org: ExpectedOrganizer, idx: number) => {
      // Validate localized name
      expect(Array.isArray(org.name), `Organizer #${idx} name is array`).toBe(true);
      expect(org.name.length, `Organizer #${idx} name is not empty`).toBeGreaterThan(0);
      const nameLocales = org.name.map((n) => n.locale);
      const uniqueNameLocales = new Set(nameLocales);
      expect(nameLocales.length, `Organizer #${idx} name locales length matches unique set`).toBe(
        uniqueNameLocales.size
      );
      org.name.forEach((nameObj, nIdx) => {
        expect(["en", "he"], `Organizer #${idx} name locale #${nIdx}`).toContain(nameObj.locale);
        expect(typeof nameObj.value, `Organizer #${idx} name value #${nIdx}`).toBe("string");
        expect(
          nameObj.value.length,
          `Organizer #${idx} name value length #${nIdx}`
        ).toBeGreaterThan(0);
      });

      // Validate category
      expect(validTypes, `Organizer #${idx} type "${org.type}"`).toContain(org.type);

      // Validate localized description
      expect(Array.isArray(org.description), `Organizer #${idx} description is array`).toBe(true);
      expect(org.description.length, `Organizer #${idx} description is not empty`).toBeGreaterThan(
        0
      );
      const descLocales = org.description.map((d) => d.locale);
      const uniqueDescLocales = new Set(descLocales);
      expect(
        descLocales.length,
        `Organizer #${idx} description locales length matches unique set`
      ).toBe(uniqueDescLocales.size);
      org.description.forEach((descObj, dIdx) => {
        expect(["en", "he"], `Organizer #${idx} description locale #${dIdx}`).toContain(
          descObj.locale
        );
        expect(typeof descObj.value, `Organizer #${idx} description value #${dIdx}`).toBe("string");
        expect(
          descObj.value.length,
          `Organizer #${idx} description value length #${dIdx}`
        ).toBeGreaterThan(0);
      });

      // Validate region
      expect(validRegions, `Organizer #${idx} region "${org.region}"`).toContain(org.region);

      // Validate languages
      expect(Array.isArray(org.languages), `Organizer #${idx} languages is array`).toBe(true);
      expect(org.languages.length, `Organizer #${idx} languages is not empty`).toBeGreaterThan(0);
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
