# Security Audit — feature/impcal-50

Audited: 2026-06-19  
Scope: JSON submission API, Admin CRUD, auth bypass patterns

Four issues were found. Two were fixed in the same session; two were deferred by the developer.

---

## Fixed

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

## Deferred — needs future decision

### #1 — `NEXT_PUBLIC_*` env var used for server-side auth bypass (High)

**Files:** `src/app/api/submissions/json/route.ts`, `src/lib/permissions.ts`, `src/lib/auth/server.ts`

`NEXT_PUBLIC_ADMIN_DEV_UID` is a client-side env var (baked into the JS bundle at build time and publicly readable). It is also checked on the server to bypass authentication: if its value is `"admin-test"`, `POST /api/submissions/json` accepts unauthenticated requests, and `getCurrentProfile()` returns a synthetic admin session without any cookie.

If a production or staging deployment ships with this variable set to `"admin-test"` — intentionally or by mistake — the entire JSON submission API becomes open with full admin privileges.

**Suggested fix:** Replace the bypass with a proper server-only env var (no `NEXT_PUBLIC_` prefix), or gate the bypass strictly on `NODE_ENV === "development"` with an explicit build-time assertion that the variable is absent in production.

### #4 — Ingestion simulator writes directly to Firestore from the browser (Medium/Architectural)

**File:** `src/app/[locale]/admin/page.tsx` — `runIngestionSim` function

The simulator imports `firebase/firestore` client SDK at runtime and calls `addDoc` directly from the browser, bypassing server-side validation and any Firestore security rules. Input (`simText`) is truncated to 100 chars before storage but is otherwise unsanitized.

This is currently low-risk because the simulator is admin-only and the data is hardcoded outside of the description field. However it sets a pattern where client-side writes to `submissions` are considered acceptable, which weakens the security model.

**Suggested fix:** Move the simulator submission through the existing server API (`POST /api/submissions/json` or a dedicated simulator route) so server-side validation and auth checks apply uniformly.
