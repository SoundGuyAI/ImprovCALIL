# Porting Plan: Authentication, Organizer Management, and Gated Moderation

This document defines the roadmap to migrate and extend the authentication layer, profile controls, admin configuration controls, and self-editing workflows from `ImprovDashboard` to `ImprovCALIL`.

---

## 1. Architectural Strategy & Feature Gating

We are establishing the core database and rules infrastructure to support self-managed organizer accounts, while retaining a robust admin approval pipeline.

### Submission Controls (Anonymous & Logged-In)
- **Hybrid Support:** The system supports both anonymous and logged-in event/organizer submissions.
- **Admin Configuration Gating:** Admins can dynamically toggle anonymous submissions on/off via the Admin Console. This state is stored in Firestore at `/config/submissions` (`{ allowAnonymous: boolean }`).
- **Moderation Requirements:**
  - Anonymous submissions always go to the moderation queue for admin approval.
  - Submissions from registered users who do **not** own a verified Organizer profile go to the moderation queue.
  - Submissions from verified Organizers modifying their own events or profile go to the moderation queue as **Change Request notifications** before going live.

### Organizer Ownership & Self-Editing
- **Owner ID:** We are adding `ownerUid` (string or null) to the `organizers` collection.
- **Change Requests:** When an organizer edits their organizer profile or events, the system will not write directly to the public record. Instead, it creates a submission of type `edit_organizer` or `edit_event` pointing to the target document.
- **Admin Notification Queue:** The Admin Console moderation tab will display these edit proposals as notifications, allowing the admin to inspect the changes (diff view) and approve/reject them.

---

## 2. Infrastructure Setup (Action Required by Developer)

To enable server-side auth (handling session cookies, deleting accounts, verifying roles) and Admin Firestore operations on the live site, you must configure a Firebase Service Account:

### Step 1: Generate Service Account Key
1. Go to the **Firebase Console** -> Project Settings -> **Service Accounts**.
2. Click **Generate new private key** and download the JSON file.

### Step 2: Configure Local Development environment
1. Save the JSON file inside the `ImprovCALIL` workspace at `.secrets/firebase-admin.json` (do not commit this file; it is gitignored).
2. Alternatively, set the environment variable in your local `.env.local`:
   `FIREBASE_SERVICE_ACCOUNT_KEY='{"project_id": "...", "private_key": "...", "client_email": "..."}'`
3. Configure your local admin bypass UID in `.env.local` to skip console layouts during dev:
   `NEXT_PUBLIC_ADMIN_DEV_UID="<your-auth-uid>"`

### Step 3: Configure Hosting Server Environment (Vercel)
1. Go to your project settings in the Vercel Dashboard.
2. Under **Environment Variables**, add:
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: Paste the full stringified service account JSON.
   - `FIREBASE_PROJECT_ID` / `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Set to your Firebase project ID.
3. Ensure client environment variables (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.) are also populated.

---

## 3. Detailed File Porting Map

### Components

#### [NEW] `src/components/auth/AuthProvider.tsx` (Copy & Adapt)
Listen to client-side auth status. On login, retrieve profile doc `/users/{uid}`. Sync session state.
- **Adaptation:** Ensure it matches `ImprovCALIL` routing patterns.

#### [NEW] `src/components/auth/LoginForm.tsx` (Copy)
Clean English/Hebrew input form handling signup, signin, reset flow, and loader states.

#### [NEW] `src/components/auth/ProfileMenu.tsx` (Copy & Adapt)
Navigation header dropdown displaying avatar/initials. Add links to edit profile and delete account.

#### [NEW] `src/components/auth/ProfileEditForm.tsx` (Copy)
Updates user details. Checks username availability in the `/users` collection.

#### [NEW] `src/components/auth/DeleteAccountPanel.tsx` (Copy)
Requires the user to type their email to confirm account deletion.

#### [NEW] `src/components/EnvConfigAlert.tsx` (Copy & Adapt)
Warns local developers if client keys are missing to prevent crash loops.

---

### Backend & Libraries

#### [NEW] `src/lib/firebase-admin.ts` (Copy)
Initializes Admin SDK using `.secrets/firebase-admin.json` or `FIREBASE_SERVICE_ACCOUNT_KEY`.

#### [NEW] `src/lib/auth/server.ts` (Copy & Adapt)
Add server session actions. Update `deleteCurrentAccount()` to handle deletions cleanly:
- Delete user document `/users/{uid}`.
- Find `submissions` matching the user's UID or contact email and mark them as `orphaned`.
- Find `organizers` where `ownerUid == uid` and set `ownerUid = null` (orphaning the ownership link).

#### [NEW] `src/lib/permissions.ts` (Copy & Adapt from dashboard's `improv-games/permissions.ts`)
Add role and admin helper gates:
- `isUserAdmin(profile)`: True if `profile.isAdmin === true` or in development matching `NEXT_PUBLIC_ADMIN_DEV_UID`.
- `canUserEditOrganizer(profile, organizer)`: True if admin, or if `organizer.ownerUid === profile.uid`.

#### [NEW] `src/lib/auth/profile.ts`, `delete-account.ts`, `email-lookup-rate-limit.ts`, `redirect.ts`, `constants.ts` (Copy)
Common helpers for email match checks, rate-limiting, and route redirects.

---

### Route Layouts & API Handlers

#### [NEW] `/api/auth/` routes (Copy & Adapt)
Create the following API routes in `src/app/api/auth/`:
1. `session/route.ts`: POST to create, DELETE to destroy HTTP-only session cookies.
2. `me/route.ts`: GET endpoint returning the profile.
3. `profile/route.ts`: POST to update details.
4. `account/route.ts`: DELETE to delete account and clean up DB references.
5. `email-status/route.ts`: Prevents user enumeration.

#### [MODIFY] `src/app/[locale]/layout.tsx`
Wrap children in `<NextIntlClientProvider>` and `<AuthProvider locale={locale}>`. Render `<EnvConfigAlert />` at the top of the body.

#### [MODIFY] `src/components/Header.tsx`
Render `<ProfileMenu />` in the navigation bar.

#### [NEW] `src/app/[locale]/admin/layout.tsx` (Guard Layout)
Fetch `getCurrentProfile()` on server side. If not logged in or not an admin, display the "Access Denied" screen containing local bypass instructions.

#### [MODIFY] `src/app/[locale]/admin/page.tsx`
- Add a **Settings tab** to allow admins to toggle the anonymous submissions state.
- Add an **Edit Queue** or diff view within the moderation queue to show organizer change proposals side-by-side with live data.

---

## 4. Parallel Subagent Testing & Port Gating

To allow Symphony to run multiple subagent workspaces concurrently in parallel Git worktrees without colliding on the default dev port (e.g. `3000`), we must configure dynamic port selection.

### [MODIFY] `playwright.config.ts`
Modify the configuration file to read `PORT` from environment variables, defaulting to `3000`:
```typescript
const PORT = process.env.PORT || "3000";

export default defineConfig({
  // ... other configs
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: PORT === "3000" ? "npm run dev" : `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
```

### [MODIFY] `package.json`
Update script commands to allow developers to manually trigger alternative dev ports when running multiple branches locally:
```json
  "scripts": {
    "dev": "next dev -p 3000",
    "dev2": "next dev -p 3001",
    "dev3": "next dev -p 3002",
    "build": "next build",
    // ... other scripts
  }
```

---

## 5. Additional Premium Features & Workflow Integrations

We will port these visual, compliance, and developer workflow enhancements from `ImprovDashboard` to give `ImprovCALIL` a highly polished finish.

### A. Bilingual Flag Emojis Switcher
- **Implementation:** Replace the standard text/globe button in `src/components/Header.tsx` or port `src/components/LocaleSwitcher.tsx`.
- **Details:** Use `🇮🇱` for Hebrew and `🇺🇸` (or `🇬🇧`) for English. Configure proper ARIA labels (`aria-label`) so it announces the target language correctly in screen readers (LTR/RTL compliant).

### B. Aesthetic & Localized Privacy Policy Page
- **Implementation:** Create `src/app/[locale]/privacy/page.tsx` and define the matching English/Hebrew translations in localization JSONs under `/messages`.
- **Details:** Use structured typography, harmonized colors, and a premium card layout to present compliance terms clearly, which is a key requirement for Firebase Auth apps.

### C. App Version Footer Widget
- **Implementation:** Port `src/components/AppVersion.tsx` and import it into `src/app/[locale]/layout.tsx` or the footer component.
- **Details:** Reads version keys from `package.json` and optionally outputs git commit hashes to display active build configurations.

### D. Telegram Developer Alert Integration
- **Implementation:** Update `WORKFLOW.md` in `ImprovCALIL` to support remote developer messaging.
- **Details:** Configure the hook to run:
  `node c:/UnityProj/symphony/scripts/notify.js "[{{ agent_name }}] requires attention on {{ issue.identifier }}: <message>"`
  This alerts the developer instantly via Telegram if an agent gets blocked on credentials or needs manual layout verification.

### E. Playwright Visual Screenshot Sanity Testing
- **Implementation:** Expand E2E scripts under `./e2e` to trigger visual comparisons using screenshots.
- **Details:** Write automated specs that navigate layouts in Hebrew and English and save snapshots under `.screenshots/IMPCAL-<issue_number>/` for manual visual alignment checks before pushing PRs.

---

## 6. Database Schema & Firestore Rules

### Collection Schema Changes
1. **`/config/submissions`**
   - `{ allowAnonymous: boolean }`
2. **`/organizers/{organizerId}`**
   - Add `{ ownerUid: string | null }`
3. **`/submissions/{submissionId}`**
   - Add `{ ownerUid?: string, targetDocumentId?: string }` (to reference original docs for change requests)

### Rules Updates (`firestore.rules`)
Update `firestore.rules` to read document-level flags and support organizer self-submission:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.isAdmin == true || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Allow users to manage their profiles
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow write: if isAdmin();
    }

    // Config is readable by everyone, modifiable only by Admin
    match /config/{configId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Submissions
    match /submissions/{submissionId} {
      allow create: if (
        // Allow logged-in submission
        isAuthenticated() ||
        // Allow anonymous if config allows it
        get(/databases/$(database)/documents/config/submissions).data.allowAnonymous == true
      );
      allow read, write: if isAdmin();
    }

    // Events rules
    match /events/{eventId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Organizers rules
    match /organizers/{organizerId} {
      allow read: if true;
      allow write: if isAdmin() || (
        isAuthenticated() && 
        resource.data.ownerUid == request.auth.uid && 
        request.resource.data.ownerUid == request.auth.uid
      );
    }
  }
}
```

---

## 7. Verification Plan

1. **Unit Tests:** Port auth validation tests (`profile.test.ts`, `delete-account.test.ts`) and run `npm test`.
2. **Linting and Type Checks:** Run `npm run lint` and `npx tsc --noEmit`.
3. **Local Dev Override Verification:** Set `NEXT_PUBLIC_ADMIN_DEV_UID` in `.env.local` to confirm you can moderate listings without custom claims.
4. **Harness Verification:** Run `node scripts/verify.js` to ensure the Next.js compilation succeeds with the new components.
