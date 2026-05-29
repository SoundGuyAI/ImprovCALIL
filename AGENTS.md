# AGENTS.md

## Cursor Cloud specific instructions

### Overview
Improv Dashboard is a Next.js 15 (App Router) web app for running live improv sessions. It uses TypeScript, Tailwind CSS, next-intl (EN/HE with RTL), and Firebase (Firestore, Auth, Storage). The dev server runs on **port 9003**.

### Quick reference
| Task | Command |
|---|---|
| Dev server | `npm run dev` (port 9003) |
| Lint | `npm run lint` |
| Unit tests | `npm test` |
| Unit tests (watch) | `npm run test:watch` |
| E2E tests | `npm run test:e2e` (Playwright, Chromium only in CI) |
| Build | `npm run build` |
| Seed database | `node scripts/seed.js` (requires Firebase env vars) |

### Firebase configuration
The Firebase SDK client is initialized in `src/lib/firebase.ts` and reads credentials from environment variables. Create a `.env.local` file with the following keys (all prefixed `NEXT_PUBLIC_FIREBASE_`):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

The `scripts/seed.js` seeding script also reads these vars from `.env.local` (with its own parser, no dotenv dependency needed).

The template gallery reads `sessionPlans` where `isTemplate == true` via the same client SDK (no service account). Deploy `firestore.rules` after rule changes. On Vercel, set the same six `NEXT_PUBLIC_FIREBASE_*` variables as in `.env.local`.

### Notes
- The Playwright E2E config (`playwright.config.ts`) points to `./e2e` test directory, but no E2E test files exist yet. Running `npm run test:e2e` will succeed with zero tests.
- Playwright Chromium browser must be installed separately via `npx playwright install --with-deps chromium`. This is handled by the update script.
- The app's suggestion feature works with static JSON data in `data/suggestions/` and does not require Firebase to be configured.
- Locale routing is handled by `next-intl` middleware. The root URL `/` redirects to `/en`. Use `/en` or `/he` paths.
