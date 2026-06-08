# Fix Organizers Page and Deploy Missing Firestore Indexes

The organizers directory and details pages need to be fully functional. Currently, the organizer details page fails to fetch events because of a missing composite index on the `events` collection for `organizerId` and `time`. This plan details adding the index to `firestore.indexes.json`, deploying the new index using the Firebase CLI / Firebase MCP tools, and adding automated Playwright E2E tests to verify that both the organizers main page and the detail page are rendering and working as expected.

## User Review Required

> [!IMPORTANT]
> The missing composite index will be deployed to the active Firebase project `improv-calendar-il` via the `firebase_deploy` MCP tool. This will enable the query `collection(db, "events").where("organizerId", "==", id).orderBy("time", "asc")` to execute successfully.

## Open Questions

No open questions. The index structure is fully defined by the query and matches the console link provided by the user.

## Proposed Changes

### Firestore Configuration

---

#### [MODIFY] [firestore.indexes.json](file:///c:/UnityProj/ImprovCALIL/firestore.indexes.json)

Add the composite index for the `events` collection to support querying events by `organizerId` ordered by `time` ascending.

```json
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "organizerId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "time",
          "order": "ASCENDING"
        }
      ]
    }
```

### E2E Testing

---

#### [NEW] [organizers.spec.ts](file:///c:/UnityProj/ImprovCALIL/e2e/organizers.spec.ts)

Create a new E2E test suite to:
1. Verify that the `/en/organizers` and `/he/organizers` directory pages load successfully.
2. Verify search and filtering by Region and Organizer Type on the directory page.
3. Verify navigation from the directory page to an organizer's detail page (`/en/organizers/<id>`).
4. Verify that the organizer detail page displays the organizer's details (Name, About, Links, Languages) and their scheduled events correctly.

## Verification Plan

### Automated Tests

1. Run the local verification harness to ensure all tests (including Prettier, ESLint, TypeScript compilation, Vitest unit tests, and Playwright E2E tests) pass:
   ```bash
   node scripts/verify-harness.js
   ```

### Manual Verification
1. Run the development server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000/en/organizers` and click on an organizer to view their details page and confirm all events and contact links load without errors.
