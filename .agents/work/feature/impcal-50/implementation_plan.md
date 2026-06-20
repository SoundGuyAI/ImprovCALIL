# Implementation Plan & Audit Report (IMPCAL-50)

## Audit Findings & Design Decisions

### 1. Timezone Leakage on Forms (Admin & Submitter)
*   **Problem:** The original implementation utilized `<input type="datetime-local">` which outputs a locale-unspecified `YYYY-MM-DDTHH:MM` string. Parsing this with `new Date(string).getTime()` interprets the time in the submitter's/admin's local browser timezone. For remote users or VPN users, this caused visual time-shifting when events were displayed on the calendar locked to `Asia/Jerusalem`.
*   **Solution:** Created a new module `src/lib/date-utils.ts` featuring timezone-safe conversion helpers:
    *   `convertJerusalemLocalToUtc(localStr)`: Maps local Jerusalem datetime strings to UTC timestamps.
    *   `convertUtcToJerusalemLocal(ts)`: Formats UTC timestamps into Jerusalem `datetime-local` input format.
*   **Integration:** Replaced local date manipulation logic in `AdminEventFormModal.tsx` and the submit page `submit/page.tsx` with these helpers.
*   **Testing:** Added a unit test suite `src/lib/date-utils.test.ts` verifying seasonal winter/summer timezone offsets (+2 / +3 hours).

### 2. ESLint & Code Convention Fixes
*   **Unused variables warning in `src/lib/db.ts`**: Inside `approveSubmission()`, a destructuring assignment of `isUpdateProposal` bound it to an unused variable. Changed to copy and standard `delete` operation.
*   **Unused variables warning in `src/lib/date-utils.ts`**: Inside `convertJerusalemLocalToUtc()`, the first element of match `_` was unused. Omitted the variable from array destructuring.

### 3. Review of the Admin Instant Approval Flow
*   **Verification:** Verified anonymous vs administrator auth states. Since `isAdmin` is determined by permissions logic utilizing user profiles, the button correctly renders only for administrators.
*   **E2E Coverage:** Playwright E2E tests have been run and verified.
*   **Hydration:** Hydration mismatches are protected; all components build correctly.

---

## Status
*   **Timezone locks**: Completed & integrated.
*   **Form inputs timezone safety**: Completed & integrated.
*   **ESLint warnings**: Resolved.
*   **Verification suite**: All checks passed (Prettier -> Lint -> TypeScript -> Unit Tests -> Next.js Build -> E2E Playwright).
