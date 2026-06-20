# Security & Bug Audit — feature/impcal-50

Audited: 2026-06-19  
Scope: JSON submission API, Admin CRUD, auth bypass patterns, db layer, submit form

---

## Fixed (Security)

### #2 — Internal error messages leaked in 500 response

**File:** `src/app/api/submissions/json/route.ts`  
The catch block was returning `error.message` verbatim in the JSON body, which could expose Firestore collection names, document paths, or quota details to callers.  
**Fix applied:** Removed the `message` field from the 500 response; error is logged server-side only.

### #3 — No batch size limit on the submission API

**File:** `src/app/api/submissions/json/route.ts`  
The endpoint accepted an arbitrarily large JSON array with no upper bound, allowing a single request to create thousands of submissions.  
**Fix applied:** Added `MAX_EVENTS_PER_REQUEST = 50` guard; returns 400 if exceeded.

### #5 — Promise rejection reason assumed to be an Error object

**File:** `src/app/api/submissions/json/route.ts`  
`result.reason?.message` would produce `undefined` when a promise was rejected with a plain string or non-Error value.  
**Fix applied:** Now uses `result.reason instanceof Error ? result.reason.message : String(result.reason ?? "Unknown error")`.

### #6 — AdminEventFormModal always mounted regardless of active tab

**File:** `src/app/[locale]/admin/page.tsx`  
The modal component was rendered unconditionally at the bottom of `<main>`, always in the DOM even when the events tab was not active.  
**Fix applied:** Modal is now conditionally rendered only when `activeTab === "events"`.

---

## Fixed (Bugs)

### B1 — `getPendingSubmissions` fetched the entire submissions collection

**File:** `src/lib/db.ts`  
The Firestore query had no `where` filter, downloading all submissions on every admin page load and tab switch. The admin page then filtered client-side, which becomes expensive as data grows.  
**Fix applied:** Added `where("status", "==", "pending")` to the query; client-side sort replaces `orderBy` to avoid requiring a composite index.

### B2 — `clearOrganizerForm` did not reset `isUpdate`, `orgType`, `orgRegion`, `orgLanguages`

**File:** `src/app/[locale]/submit/page.tsx`  
After a successful organizer submission, the "Update listing" toggle and language/region/type selections carried over silently into the next submission.  
**Fix applied:** `clearOrganizerForm` now resets all organizer form state fields to their initial defaults.

### B3 — N+1 Firestore queries in `getEvents`, `getOrganizers`, `getOrganizerDetails`

**File:** `src/lib/db.ts`  
`fetchLinksForParent` was called serially inside a loop over every document, producing N+1 sequential Firestore round-trips per page load.  
**Fix applied:** Refactored all three functions to filter documents first, then fetch all links in parallel with `Promise.all`, reducing total latency from N×RTT to ~1×RTT.

### B4 — Approval of edit submissions read existing event fields outside the write batch

**File:** `src/lib/db.ts` — `approveSubmission`  
When approving an edit, `hidden`, `featured`, and `createdAt` were read from Firestore before the batch write. A concurrent admin change between the read and commit (e.g. hiding the event) would be silently overwritten.  
**Fix applied:** For edit approvals, the pre-read is eliminated entirely. The batch now uses `merge: true` and spreads only the submitted fields, explicitly omitting `hidden`, `featured`, and `createdAt` so Firestore preserves their current values. New-event approvals still set all three explicitly.

### B5 — Organizer select showed "custom" label after deselecting a linked organizer

**File:** `src/components/admin/AdminEventFormModal.tsx`  
Selecting "-- Select --" after picking a real organizer cleared `organizerId` but left `organizerName` populated, causing the select to snap to showing "Other (Custom Text)" while `organizerId` was `""`.  
**Fix applied:** `handleChange` for `organizerId` now clears `organizerName` for both `""` and `"custom"` values.

### C1 — `featuredIndex` could index out of bounds on the featured carousel

**File:** `src/app/[locale]/page.tsx`  
`featuredIndex` state was never clamped to the length of `featuredEvents`. If the array shrank (e.g. after a future re-fetch), `featuredEvents[featuredIndex]` would be `undefined` and every property access inside the carousel section would throw, crashing the page.  
**Fix applied:** Derived `safeFeaturedIndex = featuredIndex % featuredEvents.length` and used it for all array accesses and the counter display. The raw state variable is retained so carousel navigation continues to work correctly.

### C2 — Hardcoded E2E event timestamp was set to a fixed past date

**File:** `e2e/json-submission.spec.ts`  
`time: 1781802000000` was approximately June 17, 2026 — already in the past. The calendar list view only shows events within a 30-day lookback, so the test would have started failing around July 17, 2026.  
**Fix applied:** Replaced with `Date.now() + 7 * 24 * 60 * 60 * 1000` so the event is always 7 days in the future regardless of when the test runs.

### C3 — Dead `process.env` mutation in `test.beforeAll` across two E2E specs

**Files:** `e2e/json-submission.spec.ts`, `e2e/admin-crud.spec.ts`  
`process.env.NEXT_PUBLIC_ADMIN_DEV_UID = "admin-test"` was set in `test.beforeAll`, which runs in the Playwright test runner process — not the Next.js dev server process. The mutation had no effect on the server and misled future maintainers into thinking the bypass was being programmatically controlled by the test.  
**Fix applied:** Removed both `beforeAll` blocks and replaced with a comment explaining that the bypass depends on `.env.local` being pre-configured on the server.

### D1 — Hidden organizers were accessible by direct URL

**File:** `src/lib/db.ts` — `getOrganizerDetails`  
The function fetched the organizer document without checking `data.hidden`. Any user who knew or guessed a hidden organizer's Firestore ID could view their full profile page at `/[locale]/organizers/[id]`. The `organizer === null` not-found path already existed in the page component.  
**Fix applied:** Added `if (data.hidden) return { organizer: null, events: [] }` immediately after the document fetch.

### D2 — Clearing `endTime` in the admin edit modal silently no-ops in Firestore

**Files:** `src/components/admin/AdminEventFormModal.tsx`, `src/lib/db.ts`  
When the user clears the End Time field, `handleChange` sets `formData.endTime = undefined`. The Firestore client SDK silently strips `undefined` values from `batch.update` payloads, so the old `endTime` value remained in the document. There was no way to remove an end time through the UI.  
**Fix applied:** `updateEvent` now checks for `"endTime" in eventData && eventData.endTime === undefined` (and the same for `mapLink`) and replaces those with `deleteField()` before calling `batch.update`. Added `deleteField` to the Firestore import.

### D3 — JSON submission schema allowed empty strings for required fields

**File:** `docs/event-submission-schema.json`  
Required string fields (`name`, `description`, `location`, `organizerName`) had no `minLength` constraint, so payloads like `{ name: "", ... }` passed AJV validation and produced nameless submissions in the moderation queue. Enum fields (`recurrence`, `region`, `cost`, `access`) accepted any arbitrary string.  
**Fix applied:** Added `minLength: 1` to required string fields, `minimum: 1` to `time`/`endTime` (blocks zero/negative timestamps), and `enum` constraints to `recurrence`, `region`, `cost`, and `access`.

### C4 — `getExpandedEvents` and `groupedEvents` re-computed on every render

**File:** `src/app/[locale]/page.tsx`  
Both derivations ran unconditionally in the render body, re-executing the recurrence expansion loop (up to 500 iterations per recurring event) and re-grouping on every state change, including unrelated ones like modal open/close and carousel clicks.  
**Fix applied:** Wrapped both in `useMemo` — `displayEvents` keyed on `[filteredEvents, viewMode, currentDate]`, `groupedEvents` keyed on `[displayEvents, locale]`.

### E1 — `approveSubmission` silently marks unknown-type submissions as "approved"

**File:** `src/lib/db.ts` — `approveSubmission`  
The function handled `sData.type === "event"` and `sData.type === "organizer"` but had no `else` guard. Any submission with a corrupted or unrecognized `type` field fell through both branches, hit the unconditional `batch.update(...{ status: "approved" })`, committed, and disappeared from the moderation queue — with no event or organizer written to Firestore. The admin had no indication that data was lost.  
**Fix applied:** Added an `else` branch that throws `Error("Cannot approve submission with unknown type: ...")`, preventing the batch from committing and surfacing the problem as a visible error in the UI.

### E2 — `clear-db.js` project safety check bypassed when `projectId` is undefined

**File:** `scripts/clear-db.js`  
The safety guard was `if (projectId && !projectId.includes(...))`. When `NEXT_PUBLIC_FIREBASE_PROJECT_ID` was absent from `.env.local` and `clientConfig.projectId` was also undefined, `projectId` was falsy and the entire guard short-circuited — the script would proceed to delete documents from an unknown project.  
**Fix applied:** Added an explicit `if (!projectId) { process.exit(1) }` check before the allow-list test, so an undefined project ID always aborts immediately.

### E3 — `clear-db.js` single Firestore batch per collection exceeded 500-operation limit

**File:** `scripts/clear-db.js`  
All three collection-clear sections created a single `writeBatch` and added every matched document delete to it. Firestore's Client SDK limits batches to 500 operations; if more than 500 test documents accumulated in any collection, `batch.commit()` would throw and the cleanup script would fail.  
**Fix applied:** Extracted a `deleteDocs(docs, firestore)` helper that chunks the document list into slices of ≤ 499 and commits one batch per chunk. All three collection deletes now use it.

---

## Deferred — needs future decision

### #1 — `NEXT_PUBLIC_*` env var used for server-side auth bypass (High)

**Files:** `src/app/api/submissions/json/route.ts`, `src/lib/permissions.ts`, `src/lib/auth/server.ts`

`NEXT_PUBLIC_ADMIN_DEV_UID` is a client-side env var (baked into the JS bundle at build time and publicly readable). It is also checked on the server to bypass authentication: if its value is `"admin-test"`, `POST /api/submissions/json` accepts unauthenticated requests, and `getCurrentProfile()` returns a synthetic admin session without any cookie.

If a production or staging deployment ships with this variable set to `"admin-test"` — intentionally or by mistake — the entire JSON submission API becomes open with full admin privileges.

**Suggested fix:** Replace the bypass with a proper server-only env var (no `NEXT_PUBLIC_` prefix), or gate the bypass strictly on `NODE_ENV === "development"` with an explicit build-time assertion that the variable is absent in production.

### F1 — `AdminClientGate` hung forever when `/api/auth/custom-token` did not respond

**File:** `src/components/admin/AdminClientGate.tsx`  
The `fetch("/api/auth/custom-token", ...)` call had no `AbortController` and no timeout. A slow Firebase Admin cold start or a dropped connection would leave the "Preparing admin session…" spinner visible indefinitely with no way for the user to recover.  
**Fix applied:** Replaced the `cancelled` boolean with an `AbortController`. A 10-second `setTimeout` calls `controller.abort()`, which rejects the fetch and falls into the `catch` branch that sets `failed = true`. The cleanup function passed to `useEffect` also calls `controller.abort()` and `clearTimeout` so both paths (unmount and timeout) are handled.

### F2 — Monthly recurrence used browser local-timezone day instead of Jerusalem day

**File:** `src/app/[locale]/page.tsx` — `getExpandedEvents`  
`const origDay = eventStart.getDate()` uses the browser's local timezone. A midnight event in Israel is 10 pm the previous day in UTC-2, so `.getDate()` returns the wrong calendar day. Monthly occurrences were anchored to the wrong day-of-month for browsers outside Israel.  
**Fix applied:** Replaced with `getJerusalemParts(eventStart).day`, which uses `Intl.DateTimeFormat` with `timeZone: "Asia/Jerusalem"` — the same helper already used throughout the file.

### F3 — `convertJerusalemLocalToUtc` returned `NaN` for unrecognized non-empty strings

**File:** `src/lib/date-utils.ts`  
When the input didn't match the `YYYY-MM-DDTHH:MM` regex, the fallback was `new Date(localStr).getTime()`. If that produced an invalid date, `NaN` was returned and could be stored as the event's `time` field without detection.  
**Fix applied:** The fallback now checks `isNaN(fallback)` and returns `0` instead of `NaN`, keeping a safe sentinel consistent with the empty-string case.

### F4 — `deleteCurrentAccount` Admin SDK batch exceeded the 500-operation limit

**File:** `src/lib/auth/server.ts`  
The account deletion path built a single `db.batch()` and added every orphaned organizer and submission to it. Firebase Admin SDK batches have the same 500-operation cap as the client SDK. A user with many organizer + submission documents would cause `batch.commit()` to throw after admin claims were already cleared, leaving the account partially deleted.  
**Fix applied:** Introduced `commitUpdatesInChunks` which slices the collected update entries into groups of ≤ 499 and commits one batch per group. The user-profile deletion (which uses `set` + `merge: true` rather than `update`) runs in its own dedicated final batch after all chunks complete.

### F5 — `handleAiParse` `setTimeout` fired state updates on an unmounted component

**File:** `src/app/[locale]/submit/page.tsx`  
The 2-second mock-parse delay was scheduled with a bare `setTimeout` and never cancelled. If the user switched tabs or navigated away before the delay completed, the callback called `setEventName`, `setEventLocation`, etc. on an already-unmounted component (silently dropped in React 18, but still a resource leak).  
**Fix applied:** The timer ID is stored in `aiParseTimerRef` (a `useRef`). A `useEffect` with an empty dependency array returns a cleanup function that calls `clearTimeout(aiParseTimerRef.current)`, ensuring the timer is cancelled on unmount.

### #4 — Ingestion simulator writes directly to Firestore from the browser (Medium/Architectural)

**File:** `src/app/[locale]/admin/page.tsx` — `runIngestionSim` function

The simulator imports `firebase/firestore` client SDK at runtime and calls `addDoc` directly from the browser, bypassing server-side validation and any Firestore security rules. Input (`simText`) is truncated to 100 chars before storage but is otherwise unsanitized.

This is currently low-risk because the simulator is admin-only and the data is hardcoded outside of the description field. However it sets a pattern where client-side writes to `submissions` are considered acceptable, which weakens the security model.

**Suggested fix:** Move the simulator submission through the existing server API (`POST /api/submissions/json` or a dedicated simulator route) so server-side validation and auth checks apply uniformly.

### G1 — `runIngestionSim` `setTimeout` had no cleanup on unmount

**File:** `src/app/[locale]/admin/page.tsx` — `runIngestionSim`  
The 1500ms simulation delay was a bare `setTimeout(async () => { ... }, 1500)` with no timer ID tracking. If the admin navigated away before the delay fired, the callback still executed, calling `setSimulating`, `setSimSuccess`, `setSimText`, and `await refreshData()` against stale React state. The file already imported `useRef` for `persistedAllowAnonymousRef`.  
**Fix applied:** Added `simTimerRef` (`useRef<ReturnType<typeof setTimeout> | null>(null)`); assigned the timer ID to `simTimerRef.current`; added a `useEffect` cleanup that calls `clearTimeout(simTimerRef.current)` on unmount — identical pattern to the F5 fix in `submit/page.tsx`.

### G2 — Admin event form offered "daily" recurrence (unsupported) and omitted "bi-weekly" (supported)

**File:** `src/components/admin/AdminEventFormModal.tsx`  
The recurrence `<select>` had `<option value="daily">` but `"daily"` is absent from the JSON schema enum and not handled by `getExpandedEvents`. A daily-recurrence event would silently appear only once on the calendar. Meanwhile `"bi-weekly"` — which is in the schema enum and fully expanded by the calendar — was missing from the select, making it unreachable through the UI.  
**Fix applied:** Removed the `"daily"` option; added `<option value="bi-weekly">Bi-weekly</option>` between Weekly and Monthly, matching the schema enum order exactly.

### G3 — Admin console fetched all three Firestore collections on every tab switch

**File:** `src/app/[locale]/admin/page.tsx`  
The data-loading `useEffect` depended on `[activeTab, locale]` and unconditionally fetched all events (including hidden), all organizers (including hidden), and all pending submissions on every tab change — including tabs like "Simulator" and "Settings" that need none of that data.  
**Fix applied:** Added per-tab flags (`needsEvents`, `needsOrganizers`, `needsSubmissions`) keyed on `activeTab`, then used `Promise.all` to fetch only the required sources in parallel. Tabs that don't need a given collection resolve immediately with `null` and skip the corresponding `setState` call, keeping existing state intact.

### H1 — Recurring event expansion burned the 500-iteration safety cap on historical iterations

**File:** `src/app/[locale]/page.tsx` — `getExpandedEvents`  
The loop started `current` at `event.time` (original event date) and stepped forward one recurrence at a time. The `safetyCount < 500` guard was supposed to prevent infinite loops, but it also limited total reach from the origin. A daily event created 2 years ago needed 730 iterations just to reach today — the loop quit after 500, never entering the visible range. Weekly events hit the same cap after ~9.6 years; now that `daily` is supported the threshold dropped to ~1.4 years.  
**Fix applied:** Before the loop, `current` is fast-forwarded to one step before `startRange` using integer division. For fixed-interval types (daily, weekly, bi-weekly) the step size in milliseconds is used directly. For monthly, the month difference is computed and `setMonth` advances to within 2 months of `startRange`, leaving the loop's existing complex day-clamping logic to handle the last steps. The 500-iteration cap now governs only the visible window.

### H2 — Admin approve/reject failures were silent — no user-visible feedback

**File:** `src/app/[locale]/admin/page.tsx` — `handleApprove`, `handleReject`  
Both handlers had `catch (err) { console.error(err); }` with nothing surfaced to the UI. A Firestore permission error, network failure, or the E1 unknown-type guard throwing would leave the submission in the queue with the admin seeing no indication that the action failed.  
**Fix applied:** Added `moderationError` state. Both handlers call `setModerationError(null)` at the start and `setModerationError(...)` in the catch block with a localised message including the error text. A red banner renders at the top of the queue tab whenever `moderationError` is non-null, and clears automatically when the next action begins.

### I1 — Recurring events always classified as "past" on the organizer detail page

**File:** `src/app/[locale]/organizers/[id]/page.tsx`  
`upcomingEvents` and `pastEvents` were both filtered purely on `e.time >= Date.now()`. `getOrganizerDetails` returns raw events without recurrence expansion, so a weekly event that started last month had `e.time` in the past and landed permanently in "Past Events" even though it still runs every week.  
**Fix applied:** Recurring events (`recurrence !== "one-time"`) are always included in `upcomingEvents` regardless of their original start date, since they have no definitive end. Only `"one-time"` events are gated on `e.time < Date.now()` for the past list.

### J1 — Profile links could not be cleared to empty via the update API

**File:** `src/lib/auth/profile.ts` — `buildUserProfileWrite`  
`links: editable.links.length > 0 ? editable.links : storedLinks(existingProfile)` treated an explicitly-submitted empty array (`links: []`) identically to an omitted `links` field, so the user's existing links always survived — there was no way to remove all profile links through the API.  
**Fix applied:** Changed to `"links" in requestedProfile && requestedProfile.links !== undefined ? editable.links : storedLinks(existingProfile)`. The presence check distinguishes "not provided" (keep existing) from "explicitly set to `[]`" (clear).

### J2 — Email lookup rate limiter shared one bucket for all clients without IP headers, and missed CDN headers

**File:** `src/lib/auth/email-lookup-rate-limit.ts` — `getEmailLookupClientKey`, `checkEmailLookupRateLimit`  
`getEmailLookupClientKey` only checked `x-forwarded-for` and `x-real-ip`, falling back to `"unknown-client"`. Cloudflare (`cf-connecting-ip`) and Vercel (`x-vercel-forwarded-for`) deployments might not populate those two headers, causing all their requests to share a single rate-limit bucket — one client exhausts the quota for everyone. Additionally, the "unknown-client" bucket used the same high limits (30 requests / 10 unique emails) as identified clients.  
**Fix applied:** Added `cf-connecting-ip` and `x-vercel-forwarded-for` header lookups before the fallback. When `clientKey === "unknown-client"`, stricter limits apply (5 requests / 2 unique emails per window) so an unknown-IP client cannot exhaust the shared bucket.

### K1 — Submit form recurrence select was missing "daily" and had inconsistent ordering

**File:** `src/app/[locale]/submit/page.tsx`  
The event submission form's recurrence `<select>` listed `one-time → weekly → monthly → bi-weekly`, omitting `"daily"` entirely even though it was added to the JSON schema and admin event modal. A user submitting a daily event via the web form had no way to select it.  
**Fix applied:** Added `<option value="daily">Daily</option>` and reordered to match the admin form: one-time → daily → weekly → bi-weekly → monthly.

### L1 — Cost badge labels showed "Free Only" / "Paid Only" instead of "Free" / "Paid"

**Files:** `messages/en.json`, `messages/he.json`, `src/app/[locale]/page.tsx`  
All three badge display sites (list view, month-view selected-day panel, detail modal) used `tFilters("free")` and `tFilters("paid")` — the same translation keys as the filter dropdown options, which resolve to "Free Only" and "Paid Only". Event cards therefore showed "Free Only" as a badge label on every free event.  
**Fix applied:** Added `"costFree"`, `"costPaid"`, `"costDonation"` keys (and Hebrew equivalents) to both message files; updated all three badge sites to use `tFilters("costFree/costPaid/costDonation")` while leaving `"free"/"paid"/"donation"` untouched for the filter dropdown.

### M1 — `filteredEvents` not in `useMemo` — `displayEvents` recomputed on every render

**File:** `src/app/[locale]/page.tsx`  
`filteredEvents` was a plain `const` computed in the render body. Every render (including modal open/close, carousel clicks, calendar day selection) created a new array reference, defeating the `useMemo` on `displayEvents` and re-running the full recurrence expansion loop on every interaction.  
**Fix applied:** Wrapped `filteredEvents` in `useMemo` with deps `[events, search, selectedRegion, selectedType, selectedLanguage, selectedCost, selectedAccess]`.

### M2 — List view `endRange` computed with raw 86 400 000 ms — DST off-by-one

**File:** `src/app/[locale]/page.tsx` — `getExpandedEvents`  
`endRange = new Date(jerusalemToDate(..., 0, 0).getTime() + 86400000 - 1)` assumed every day is exactly 86 400 seconds. On the DST spring-forward night in Jerusalem (UTC+2 → UTC+3), "one day later midnight" is only 82 800 000 ms away — the raw addition overshoots by one calendar day.  
**Fix applied:** Changed to `jerusalemToDate(endYmd.year, endYmd.month, endYmd.day + 1, 0, 0).getTime() - 1`, which routes through `convertJerusalemLocalToUtc` and correctly resolves the next calendar midnight regardless of DST.

### N1 — Week and month view `endRange` ended at 23:59, excluding last 60 s of each day

**File:** `src/app/[locale]/page.tsx` — `getExpandedEvents`  
`endRange = jerusalemToDate(..., 23, 59)` resolved to exactly 23:59:00 Jerusalem time. Events at 23:59:01–23:59:59 fell outside the query window and were invisible in week and month views.  
**Fix applied:** Both paths now compute `new Date(jerusalemToDate(..., day + 1, 0, 0).getTime() - 1)` — the last millisecond before the next Jerusalem midnight — using the same DST-safe pattern as the M2 fix.

### N2 — Daily / weekly / bi-weekly recurrence stepped with raw milliseconds — DST drift

**File:** `src/app/[locale]/page.tsx` — `getExpandedEvents` expansion loop  
`current.setTime(current.getTime() + 86400000)` for daily (and equivalent for weekly/bi-weekly) causes a wall-clock drift of ±1 hour on DST transition nights. A recurring 20:00 show would appear at 21:00 on the occurrence that crosses the spring-forward boundary.  
**Fix applied:** All three fixed-interval types now step through Jerusalem calendar arithmetic: `getJerusalemParts(current)` extracts the wall-clock hour/minute, then `jerusalemToDate(parts.year, parts.month, parts.day + N, parts.hour, parts.minute)` re-resolves the next occurrence with correct DST handling, identical to the monthly logic already in the file.

### N3 — Month grid cell `isCurrentMonth` used browser-local `getMonth()`

**File:** `src/app/[locale]/page.tsx` — month view grid  
`day.getMonth() === currentDate.getMonth()` uses the browser's local timezone. For browsers in UTC-5, Jerusalem midnight (UTC+3) is 19:00 local the day before — cells near month boundaries read the wrong calendar month and render with incorrect faded/full-color styling.  
**Fix applied:** Replaced with `getJerusalemParts(day).month === getJerusalemParts(currentDate).month && ...year === ...year`.

### N4 — Week/month view day numbers used browser-local `getDate()` / `toLocaleDateString`

**File:** `src/app/[locale]/page.tsx` — week and month view day headers  
`day.getDate()` and `day.toLocaleDateString(...)` without a `timeZone` option used the browser's local timezone. For non-Israeli browsers, midnight-Jerusalem cells displayed the previous calendar day's number.  
**Fix applied:** Day numbers now use `getJerusalemParts(day).day`; week-view `dayName` now passes `timeZone: "Asia/Jerusalem"` to `toLocaleDateString`.

### N5 — Selected-day panel header formatted date in browser local timezone

**File:** `src/app/[locale]/page.tsx` — month view selected-day panel  
`selectedCalendarDay.toLocaleDateString(locale, { weekday, day, month, year })` had no `timeZone` option. For UTC-5 users, a "Thursday March 1" Jerusalem cell displayed "Wednesday February 28" in the panel header.  
**Fix applied:** Added `timeZone: "Asia/Jerusalem"` to the `toLocaleDateString` options object.

### N6 — `clearEventForm` did not reset region, language, cost, access, recurrence dropdowns

**File:** `src/app/[locale]/submit/page.tsx`  
After a successful event submission, `clearEventForm()` reset text fields but left all five dropdown states (`eventRegion`, `eventLanguage`, `eventCost`, `eventAccess`, `eventRecurrence`) at their previous values. The next form submission silently inherited those selections without user awareness.  
**Fix applied:** Added explicit `setEventRegion("Tel-Aviv")`, `setEventLanguage("he")`, `setEventCost("Paid")`, `setEventAccess("Open")`, `setEventRecurrence("one-time")` calls to `clearEventForm`.

### N7 — `clear-db.js` production project ID in the cleanup allowlist

**File:** `scripts/clear-db.js`  
`allowedProjects: ["improv-calendar-il"]` explicitly whitelisted the production Firebase project, so `node scripts/clear-db.js` would run successfully against production without any safety error. The intent was to allow only dev/staging/test/emulator projects.  
**Fix applied:** Removed the `allowedProjects` array entirely. The `isAllowed` check now relies solely on the `projectId.includes("dev"|"staging"|"test"|"emulator")` pattern, which the production project name does not satisfy.

### N8 — JSON submission schema accepted arbitrary extra fields

**File:** `docs/event-submission-schema.json`  
`"additionalProperties": true` allowed callers to inject `hidden: true`, `featured: true`, or any other field through the JSON API. While the API route explicitly overrides `hidden` and `featured`, arbitrary unknown keys were written to Firestore unvalidated.  
**Fix applied:** Changed to `"additionalProperties": false`.

### N9 — `language` field in submission schema had no enum constraint

**File:** `docs/event-submission-schema.json`  
`"language": { "type": "string", "minLength": 1 }` accepted any non-empty string. Submitting `"language": "klingon"` passed AJV validation and persisted to Firestore undetected.  
**Fix applied:** Added `"enum": ["he", "en", "he/en", "other"]` in place of `minLength`.

### N10 — Type filter in `db.ts` included dead `data.recurrence !== filters.type` condition

**File:** `src/lib/db.ts` — both mock and live `getEvents` paths  
The type filter was `data.recurrence !== filters.type && data.type !== filters.type`. The `recurrence` check is always false (recurrence values like "weekly" never equal type values like "Show"), making it dead code. While the filter still worked correctly by accident, the condition was misleading and would silently change behavior if recurrence values ever collided with type names.  
**Fix applied:** Removed the `data.recurrence !== filters.type &&` clause from both occurrences, leaving only `data.type !== filters.type`.

### N11 — `email-lookup-rate-limit.ts` sorted `recentAttempts` in place before storing

**File:** `src/lib/auth/email-lookup-rate-limit.ts`  
`recentAttempts.sort(...)` mutated the array that was about to be stored in `state.attempts`. The sort was needed only to find the oldest attempt; the stored array's order was changed as a side effect.  
**Fix applied:** Changed to `.slice().sort(...)` to sort a copy, leaving the original array unmodified.

### N12 — `ignoreBuildErrors: true` silenced TypeScript errors in production builds

**File:** `next.config.ts`  
`typescript: { ignoreBuildErrors: true }` unconditionally suppressed all TypeScript type errors during `next build`. Type errors that catch null-access, wrong prop types, or missing fields were silently ignored in CI and production deploys.  
**Fix applied:** Changed to `ignoreBuildErrors: process.env.NODE_ENV !== "production"`. Production builds (`next build` in CI) now fail on type errors; the dev server (`next dev`) continues to tolerate them for a fast feedback loop.

### N13 — Per-event Firestore error messages exposed raw internals in 207 responses

**File:** `src/app/api/submissions/json/route.ts`  
When a batch submission had partial failures, the per-event error array included `result.reason.message` verbatim. Firestore errors can contain collection names, document paths, service account details, or quota strings.  
**Fix applied:** Replaced the raw message with the fixed string `"submission could not be stored"`. The actual error is still logged server-side via the outer catch block.

### N14 — Submit form `REGION_KEYS` missing "North" and "South"

**File:** `src/app/[locale]/submit/page.tsx`  
The schema enum and main page `REGIONS` array both include `"North"` and `"South"`, but the submit form's `REGION_KEYS` constant did not. Users submitting via the manual form had no way to select those two regions.  
**Fix applied:** Added `"North"` and `"South"` to `REGION_KEYS`.

### K2 — "Donation" cost value unsupported in UI despite being in the schema

**Files:** `src/app/[locale]/submit/page.tsx`, `src/app/[locale]/page.tsx`, `messages/en.json`, `messages/he.json`  
The JSON schema `cost` enum includes `"Donation"` but every UI surface that renders or filters cost was a binary Free/Paid check, silently falling through to "Paid" styling for any Donation event. The submit form had no Donation option. The AI parse mock had no donation keyword detection.  
**Fix applied:** Added `"Donation"` to the submit form cost select and to the AI parse keyword check. Added `"Donation Only"` / `"תרומה בלבד"` filter options to both message files and the main page filter dropdown. Updated all four cost-display sites (list view badge, month view selected-day badge, mobile calendar dot, detail modal) to use violet styling for Donation, preserving emerald for Free and amber for Paid.
