# AGENTS.md

## Cursor Cloud specific instructions

### Overview
**ImprovIL** (`improv-cal-il`) is a Next.js 15 (App Router) web app for discovering and submitting improv events in Israel. It uses TypeScript, Tailwind CSS, next-intl (EN/HE with RTL), and Firebase (Firestore, Auth, Storage). The dev server runs on **port 3000** (`npm run dev` → `next dev`).

### Quick reference
| Task | Command |
|---|---|
| Dev server | `npm run dev` (http://localhost:3000) |
| Lint | `npm run lint` |
| Unit tests | `npm test` |
| Unit tests (watch) | `npm run test:watch` |
| E2E tests | `npm run test:e2e` (Playwright; starts dev server on port 3000) |
| Build | `npm run build` |
| Seed database | `node scripts/seed.js` (requires Firebase env vars in `.env.local`) |

### Firebase configuration (required for dev and E2E)
The Firebase client initializes at module load in `src/lib/firebase.ts` (including `getAuth`). **Without valid `NEXT_PUBLIC_FIREBASE_*` values, `/en` and other locale routes fail during SSR with `FirebaseError: auth/invalid-api-key`.**

Create a `.env.local` in the repo root (never commit it) with:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

On Cursor Cloud, add the same six names as **repository secrets** so agents can write `.env.local` before `npm run dev` or `npm run test:e2e`. Copy values from the Firebase console or your Vercel project env.

`scripts/seed.js` reads `.env.local` with its own parser (no dotenv package).

### Lint
`eslint.config.mjs` uses ESLint 9 flat config with `eslint-config-next` (`core-web-vitals.js`, `typescript.js` imports). `npm run lint` may still fail on pre-existing issues in `src/app/[locale]/*` until those are fixed in app code.

### Playwright
- E2E tests live in `e2e/` (e.g. `e2e/sanity.spec.ts`).
- `playwright.config.ts` uses `baseURL` and `webServer` at http://localhost:3000.
- Install Chromium once per VM: `npx playwright install --with-deps chromium` (included in the update script).

### Locale routing
`next-intl` middleware redirects `/` → `/en`. Use `/en` or `/he` for manual testing.

### Verification order (before merge)
Per `.cursor/rules/pr-merge-verification.mdc`: `npm run lint` → `npm test` → `npm run build` → `npm run test:e2e` (E2E needs Firebase configured).
