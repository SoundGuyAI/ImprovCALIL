# Implementation Plan - IMPCAL-60

We need to address three Bugbot review comments on PR #75 regarding schema validation and data corrections.

## Steps

1. **Schema Root Validation**:
   - Update `docs/organizer-schema.json` so the root represents an array of organizer records.
   - We will define the root as an array of items referencing `#/definitions/organizer`.
   - We will move the object definition to `definitions.organizer`.
   - Ensure `"uniqueItems": true` is set on the `languages` array of the organizer (it is already present, but we will preserve it).

2. **Data Record Corrections**:
   - Update `docs/israeli_improv_organizers.json`:
     - `"Improv Theater Israel"`: set `type` to `"School"` (instead of `"Theater"`).
     - `"Improv NOW!"`: set `type` to `"Other"` (instead of `"Group"`).
     - `"Shlofta"`: set `region` to `"Other areas"` (instead of `"Tel-Aviv"`).

3. **AJV Validation in Unit Tests**:
   - Add/ensure `ajv` and `ajv-formats` are installed as devDependencies.
   - Refactor `src/lib/organizers-data.test.ts` to use Ajv and validate the entire `docs/israeli_improv_organizers.json` file in one assertion.
   - Add explicit assertion that `organizers.length === 17`.

4. **Verification**:
   - Run `npm test` to verify unit tests pass.
   - Run `node scripts/verify-harness.js` to ensure the entire verification suite passes.
   - Commit and push to `feature/impcal-60`.
