# Implementation Plan - IMPCAL-60: Revise organizer data structure and input field

Review the organizers listed in the Improv Calendar Israel resource file, define a JSON schema for importing organizer data, and extract the organizers from the resources file into a compliant JSON data file.

## Schema Definition (`docs/organizer-schema.json`)

The JSON schema will represent an array of organizer records. Each organizer record will conform to:
- **name**: string (required)
- **type**: enum `"Group" | "School" | "Theater" | "Other"` (required)
- **description**: string (required)
- **region**: enum `"Tel-Aviv" | "Jerusalem" | "Beer-Sheva" | "Haifa" | "Hasharon" | "Other areas"` (required)
- **languages**: array of strings (required)
- **logoUrl**: string / URI (optional)
- **links**: array of Link objects, where each Link contains:
  - **url**: string / URI (required)
  - **type**: enum `"Website" | "Facebook" | "Facebook event" | "WhatsApp group" | "Instagram" | "Other"` (required)
  - **label**: string (optional)

## Data Extraction (`docs/israeli_improv_organizers.json`)

We will parse `docs/ISRAELI_IMPROV_RESOURCES.md` and extract the 17 unique, valid, published organizers:
1. **תיאטרון האימפרוב / Improv Theater Israel** (School, Tel-Aviv, ["he", "en"])
2. **ImPro's (אימפרo's)** (School, Tel-Aviv, ["he"])
3. **Improvise.co.il** (School, Tel-Aviv, ["he", "en"])
4. **פרוביזורי / Provizori** (Group, Tel-Aviv, ["he"])
5. **פורפליי / 4play** (Group, Tel-Aviv, ["he"])
6. **שלופתא / Shlofta** (Group, Other areas, ["he", "en"])
7. **הייפרוב / HighProv** (Group, Tel-Aviv, ["he"])
8. **Tel Aviv Improv Workshop** (Group, Tel-Aviv, ["en", "he"])
9. **Bi-Lingual Improv in Tel-Aviv** (Group, Tel-Aviv, ["he", "en"])
10. **Improv NOW!** (Other, Tel-Aviv, ["he", "en"])
11. **Mind Flow** (School, Tel-Aviv, ["he"])
12. **Center Stage Israel** (School, Tel-Aviv, ["en"])
13. **English On Stage — Maniact** (Group, Tel-Aviv, ["en"])
14. **Crossroads — Theater Shed** (School, Jerusalem, ["en"])
15. **J-Town Playhouse (JET Community)** (Theater, Jerusalem, ["en"])
16. **Debbie Hirsch — Laughter Games** (Other, Jerusalem, ["en"])
17. **חי-פה / Hai-Pa (Beit HaGefen)** (Group, Haifa, ["he"])

We will exclude adjacent acting schools (Nissan Nativ, Impro), stand-up heavy clubs, general venues, and unverified/TODO entries (Monty, Line Up).

## Verification Plan
1. Validate `docs/israeli_improv_organizers.json` against `docs/organizer-schema.json` using a schema validation script.
2. Run the repository-wide verification harness script: `node scripts/verify-harness.js`.
