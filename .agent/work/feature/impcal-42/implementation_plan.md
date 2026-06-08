# Implementation Plan - IMPCAL-42: Port Auth, User Profiles, Admin Gating, and Parallel Port Gating

This plan outlines the steps to port authentication, user profiles, admin gating, and parallel port gating from the `ImprovDashboard` codebase into `ImprovCALIL`.

## User Review Required

> [!IMPORTANT]
> **Firebase Service Account Configuration**
> To support server-side Firebase operations (verifying session cookies, profile creation, and account deletions), a service account key must be supplied.
>
> - For local development, download the service account JSON and place it in `.secrets/firebase-admin.json` (gitignored).
> - Alternatively, define `FIREBASE_SERVICE_ACCOUNT_KEY` inside `.env.local` containing the JSON string.
> - For production, configure the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable in Vercel.

> [!TIP]
> **Local Admin Development Bypass**
> Configure `NEXT_PUBLIC_ADMIN_DEV_UID="<your-uid>"` in your `.env.local` to grant yourself admin rights locally without needing custom user claims.

---

## Proposed Changes

We will copy and adapt components and libraries from `ImprovDashboard` (`C:\UnityProj\ImprovDashboard`) to `ImprovCALIL` (`c:\UnityProj\ImprovCALIL`).

### 1. Build and Dependency Configuration

#### [MODIFY] [package.json](file:///c:/UnityProj/ImprovCALIL/package.json)

- Add `"firebase-admin": "^13.10.0"` to `dependencies`.
- Add secondary dev scripts for alternate ports to prevent developer port conflicts:
  ```json
  "dev": "next dev -p 3000",
  "dev2": "next dev -p 3001",
  "dev3": "next dev -p 3002"
  ```

---

### 2. Firebase Rules & Initialization

#### [MODIFY] [firestore.rules](file:///c:/UnityProj/ImprovCALIL/firestore.rules)

Update rules to cover:

- `/config/submissions` document to verify if anonymous submissions are enabled.
- Allow read/write to `/users/{uid}` for matching owners.
- Submissions create rule checks: allow if logged-in OR if anonymous submissions are enabled in `/config/submissions`.
- Organizers edit rule checks: allow if admin OR if `resource.data.ownerUid == request.auth.uid`.

#### [MODIFY] [src/lib/firebase.ts](file:///c:/UnityProj/ImprovCALIL/src/lib/firebase.ts)

Add detection helper flags for missing client configuration keys to prevent crash loops when env variables are not populated:

- Export `isConfigMissing`, `missingConfig`, and `isMock` so pages can display warnings instead of crashing.

#### [NEW] [src/lib/firebase-admin.ts](file:///c:/UnityProj/ImprovCALIL/src/lib/firebase-admin.ts)

Port client-independent Admin SDK initializer. Reads `.secrets/firebase-admin.json` or `FIREBASE_SERVICE_ACCOUNT_KEY` env var.

---

### 3. Authentication & Profile Core

#### [NEW] [src/types/auth.ts](file:///c:/UnityProj/ImprovCALIL/src/types/auth.ts)

Define structural TypeScript interfaces for `AuthProfile`, `AuthUser`, `ProfileLink`, and `EditableProfileFields`.

#### [NEW] [src/lib/permissions.ts](file:///c:/UnityProj/ImprovCALIL/src/lib/permissions.ts)

Port user access checkers:

- `isUserAdmin(profile)`: Matches admin claim or `NEXT_PUBLIC_ADMIN_DEV_UID`.
- `canUserEditOrganizer(profile, organizer)`: Returns true if admin or if `organizer.ownerUid === profile.uid`.

#### [NEW] [src/lib/auth/constants.ts](file:///c:/UnityProj/ImprovCALIL/src/lib/auth/constants.ts)

Define cookie keys and lifetime values (renaming cookie to `improv_cal_il_session`).

#### [NEW] [src/lib/auth/redirect.ts](file:///c:/UnityProj/ImprovCALIL/src/lib/auth/redirect.ts)

Provide redirect validation helpers.

#### [NEW] [src/lib/auth/delete-account.ts](file:///c:/UnityProj/ImprovCALIL/src/lib/auth/delete-account.ts)

Provide confirmation matching and orphaning builder utilities.

#### [NEW] [src/lib/auth/email-lookup-rate-limit.ts](file:///c:/UnityProj/ImprovCALIL/src/lib/auth/email-lookup-rate-limit.ts)

Rate limit email checking lookup routes.

#### [NEW] [src/lib/auth/profile.ts](file:///c:/UnityProj/ImprovCALIL/src/lib/auth/profile.ts)

Provide profile sanitization and input normalizers.

#### [NEW] [src/lib/auth/server.ts](file:///c:/UnityProj/ImprovCALIL/src/lib/auth/server.ts)

Add Next.js server actions:

- `createSessionAndProfile()`: Sets cookies and Firestore profile records.
- `updateCurrentProfile()`: Server-side validation and profile update.
- `deleteCurrentAccount()`: Deletes Firebase user and updates Firestore links:
  - Deletes `/users/{uid}`.
  - Orphans matching `organizers` (`ownerUid = null`).
  - Orphans matching `submissions` (`submitterContact.email` or `ownerUid` references marked as orphaned).

---

### 4. API Auth Routes

Create Next.js Route Handlers under `src/app/api/auth/`:

- **[NEW] `session/route.ts`**: POST creates cookie session, DELETE clears it.
- **[NEW] `me/route.ts`**: GET returns current profile.
- **[NEW] `profile/route.ts`**: PATCH updates profile fields.
- **[NEW] `account/route.ts`**: DELETE cleans up DB and signs out.
- **[NEW] `email-status/route.ts`**: POST returns password/register type status.

---

### 5. Client Components & Layouts

#### [NEW] [src/components/auth/AuthProvider.tsx](file:///c:/UnityProj/ImprovCALIL/src/components/auth/AuthProvider.tsx)

Provides state synchronization, Firebase Auth listeners, and access context for login/logout actions.

#### [NEW] [src/components/auth/LoginForm.tsx](file:///c:/UnityProj/ImprovCALIL/src/components/auth/LoginForm.tsx)

Responsive English/Hebrew sign-in form supporting password or Google sign-in.
_Note: Color scheme will be adapted to use `indigo` accents instead of ImprovDashboard's `purple`._

#### [NEW] [src/components/auth/ProfileMenu.tsx](file:///c:/UnityProj/ImprovCALIL/src/components/auth/ProfileMenu.tsx)

Dropdown menu for user headers. Displays profile edit, settings, and sign-out links.
_Note: Color scheme will be adapted to use `indigo` accents._

#### [NEW] [src/components/auth/ProfileEditForm.tsx](file:///c:/UnityProj/ImprovCALIL/src/components/auth/ProfileEditForm.tsx)

Updates display name, username, biography, links, and phone.

#### [NEW] [src/components/auth/DeleteAccountPanel.tsx](file:///c:/UnityProj/ImprovCALIL/src/components/auth/DeleteAccountPanel.tsx)

Requires email typing confirmation before deletion.

#### [NEW] [src/components/EnvConfigAlert.tsx](file:///c:/UnityProj/ImprovCALIL/src/components/EnvConfigAlert.tsx)

Demo Mode warning bar, rendered sticky at the top when Firebase is missing configuration keys.

#### [MODIFY] [src/app/[locale]/layout.tsx](file:///c:/UnityProj/ImprovCALIL/src/app/[locale]/layout.tsx)

- Wrap layout children in `<AuthProvider locale={locale}>`.
- Render `<EnvConfigAlert />` at the top of the body.

#### [MODIFY] [src/components/Header.tsx](file:///c:/UnityProj/ImprovCALIL/src/components/Header.tsx)

- Incorporate `<ProfileMenu />` into the header actions section.
- Conditionally hide the `/admin` navigation link from the navigation bar if the logged-in user is not an admin.

---

### 6. Admin Panel Gating & Configuration

#### [NEW] [src/app/[locale]/admin/layout.tsx](file:///c:/UnityProj/ImprovCALIL/src/app/[locale]/admin/layout.tsx)

Create a Server-Side Gating Layout.

- Retrieves `getCurrentProfile()`.
- If not logged in or not an admin, renders a premium "Access Denied" page with bypass troubleshooting details.

#### [MODIFY] [src/app/[locale]/admin/page.tsx](file:///c:/UnityProj/ImprovCALIL/src/app/[locale]/admin/page.tsx)

- Integrate custom layout settings.
- Add a **Settings tab** to allow toggle configuration of `/config/submissions` (`allowAnonymous`).
- Implement an **Edit Queue** view under the moderation tab showing side-by-side comparison (diff view) for pending organizer update requests.

---

### 7. Supplementary Pages & Elements

#### [NEW] [src/app/[locale]/privacy/page.tsx](file:///c:/UnityProj/ImprovCALIL/src/app/[locale]/privacy/page.tsx)

Localized Privacy Policy terms (Hebrew and English), required for applications using external authentication.

#### [NEW] [src/components/AppVersion.tsx](file:///c:/UnityProj/ImprovCALIL/src/components/AppVersion.tsx)

Footer widget parsing semver versioning keys from `package.json`.

#### [MODIFY] [messages/en.json](file:///c:/UnityProj/ImprovCALIL/messages/en.json) & [messages/he.json](file:///c:/UnityProj/ImprovCALIL/messages/he.json)

Add localized strings for `auth.*` namespaces (LoginForm, ProfileMenu, ProfileEdit, settings, and DeleteAccountPanel) and `privacy.*` values.

---

## Verification Plan

### Automated Tests

- Run full harness check script to verify code compilation, lint formatting, and unit tests:
  ```bash
  node scripts/verify-harness.js
  ```
- Run standard unit test suites:
  ```bash
  npm test
  ```
- Add unit tests for permissions checks (`src/lib/permissions.test.ts`), session helper routes, and profile fields normalizers.

### Manual Verification

1. **Unconfigured Environment:** Start the server with empty environment variables and confirm the `<EnvConfigAlert />` Demo Mode warning appears correctly.
2. **Access Gating:** Attempt to load `/en/admin` directly without logging in and verify it responds with an Access Denied panel.
3. **Local Dev Bypass:** Define `NEXT_PUBLIC_ADMIN_DEV_UID` matching your user UID, log in, and verify the `/admin` console becomes fully accessible.
4. **Bilingual Verification:** Validate that auth forms (Login, profile edit) align correctly under both LTR (English) and RTL (Hebrew) locales.
