# Install Cursor Rules & Skills in Another Project

Replicate the Improv Dashboard Cursor agent setup in any repo.

## Quick copy (fastest)

If you have this repo locally, copy the folders directly:

```powershell
# PowerShell — run from the TARGET project root
$source = "C:\UnityProj\ImprovDashboard"   # adjust path
Copy-Item "$source\.cursor\rules" ".cursor\rules" -Recurse -Force
Copy-Item "$source\.cursor\skills" ".cursor\skills" -Recurse -Force
Copy-Item "$source\docs\cursor-agent-setup" "docs\cursor-agent-setup" -Recurse -Force
```

```bash
# Bash — run from the TARGET project root
SOURCE="/path/to/ImprovDashboard"
cp -r "$SOURCE/.cursor/rules" .cursor/
cp -r "$SOURCE/.cursor/skills" .cursor/
cp -r "$SOURCE/docs/cursor-agent-setup" docs/
```

Then customize (see below).

## Fresh install from GitHub

Use the bundled scripts — they clone upstream repos and install the same files with the same names:

```powershell
# Windows
.\docs\cursor-agent-setup\install-from-sources.ps1
```

```bash
# macOS / Linux
chmod +x docs/cursor-agent-setup/install-from-sources.sh
./docs/cursor-agent-setup/install-from-sources.sh
```

Scripts install:

- **15 rules** from [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules)
- **25 skills** from [spencerpauly/awesome-cursor-skills](https://github.com/spencerpauly/awesome-cursor-skills)

They do **not** copy project-specific files. Add those manually:

| File                                  | Action                                            |
| ------------------------------------- | ------------------------------------------------- |
| `.cursor/rules/next-intl-project.mdc` | Copy from Improv Dashboard and edit locales/paths |
| `.cursor/skills/rtl-locale-testing/`  | Copy if project has RTL locales                   |

## Core Tech Stack Bootstrap Blueprint

If you are initializing a brand-new project from scratch using the same technologies (Next.js 15, React 19, Tailwind CSS, `next-intl` localization with RTL, Firebase, Vitest, and Playwright) but for a different use case, follow this blueprint to set up the foundational files.

### 1. App Initialization & Dependencies

Run these commands in a clean target repository to initialize Next.js and install the exact compatible packages:

```powershell
# Initialize Next.js 15 app structure (Tailwind, TypeScript, App Router, Src directory)
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

# Install core runtime dependencies (React 19, next-intl, Firebase Client SDK, Lucide Icons)
npm install next@15.5.18 react@19.0.0 react-dom@19.0.0 next-intl@4.13.0 firebase@12.14.0 lucide-react@1.17.0

# Install development & testing tools
npm install -D vitest@4.1.7 jsdom@29.1.1 @vitejs/plugin-react@6.0.2 @playwright/test@1.60.0
```

### 2. Localization Configuration (`next-intl` & RTL)

Configure the routing and translation engine using these 5 basic files:

#### `next.config.ts` (Wrap with next-intl and inject build variables)

```typescript
import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import createNextIntlPlugin from "next-intl/plugin";
import versionData from "./version.json"; // create a version.json e.g. {"version": "0.1.0"}

const withNextIntl = createNextIntlPlugin();

function resolveBuildCommit(): string {
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (vercelSha) return vercelSha.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: versionData.version,
    NEXT_PUBLIC_BUILD_COMMIT: resolveBuildCommit(),
  },
};

export default withNextIntl(nextConfig);
```

#### `src/middleware.ts` (Routing middleware)

```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(he|en)/:path*"],
};
```

#### `src/i18n/routing.ts` (Define locales and default locale)

```typescript
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "he"],
  defaultLocale: "en",
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

#### `src/i18n/request.ts` (Load translations dynamically)

```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

#### `src/app/[locale]/layout.tsx` (RTL and font setup)

```typescript
import { Rubik } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "700", "900"],
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"}>
      <body className={`${rubik.variable} font-sans antialiased bg-zinc-950 text-zinc-100 min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

#### Message Catalogs

Create `messages/en.json` and `messages/he.json` directory structure and files in your project root:

- `messages/en.json` contains: `{"common": {"title": "My English App"}}`
- - `messages/he.json` contains: `{"common": {"title": "האפליקציה שלי"}}`

### 3. Firebase Client SDK Setup

Create `src/lib/firebase.ts` to initialize Firebase services safely for Next.js SSR (Server-Side Rendering):

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
```

Create a `.env.local` file containing the matching environment variables prefixed with `NEXT_PUBLIC_FIREBASE_`.

### 4. Vitest Configuration

Configure Vitest for unit testing using the jsdom browser-mocking environment:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Verify your configuration with a simple placeholder test, e.g. `src/lib/version.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Sanity test", () => {
  it("verifies mathematical correctness", () => {
    expect(1 + 1).toBe(2);
  });
});
```

### 5. Playwright E2E Setup

Initialize the Playwright E2E testing framework:

```bash
# Install Chromium browser dependencies
npx playwright install --with-deps chromium
```

Add your end-to-end tests inside the `./e2e` directory and configure standard routing matches.

---

## After installing — customize per project

### 1. Edit or remove irrelevant rules

| If your project…            | Action                                                                     |
| --------------------------- | -------------------------------------------------------------------------- |
| Does not use Firebase       | Remove `tailwind-react-firebase.mdc` or swap for your stack                |
| Does not use Vercel         | Remove `vercel-deployment.mdc`                                             |
| Has no RTL/i18n             | Remove `rtl-i18n.mdc`, `next-intl-project.mdc`, `rtl-locale-testing` skill |
| Uses Jest not Vitest        | Swap `vitest-unit-testing.mdc` for Jest rule from awesome-cursorrules      |
| Uses Cypress not Playwright | Swap Playwright rules/skills                                               |

### 2. Write project-specific rules

Create `.cursor/rules/your-project.mdc` with:

- Dev server port and npm scripts
- Framework versions and folder conventions
- Auth/backend provider (Firebase, Supabase, etc.)
- i18n locales and message file paths

Use `next-intl-project.mdc` in this repo as a template.

### 3. Add stack-specific skills

Install via Cursor **Settings → Plugins** or copy skill folders:

| Stack         | Suggested skills (already in Improv Dashboard under `.agents/skills/`)                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Firebase      | `firebase-basics`, `firebase-auth-basics`, `firebase-firestore`, `firebase-security-rules-auditor` |
| Vercel deploy | `deploy-to-vercel`, `vercel-cli-with-tokens`, `vercel-react-best-practices`                        |
| UI audit      | `web-design-guidelines`, `vercel-composition-patterns`                                             |

Prefer a single canonical location: **`.cursor/skills/`**.

### 4. Add `AGENTS.md` (recommended)

Short agent instructions at repo root: dev commands, env vars, ports, test commands. See this project's `AGENTS.md`.

### 5. Verify discovery

- Rules: Cursor picks up `.cursor/rules/*.mdc` automatically
- Skills: Cursor discovers `.cursor/skills/*/SKILL.md`
- Restart Cursor or open a new agent chat if skills don't appear

## Full inventory

See [MANIFEST.md](./MANIFEST.md) for every file name, source mapping, and tier grouping.

## Optional: consolidate duplicate skill folders

Improv Dashboard also has skills under `.agents/skills/`, `.claude/skills/`, and `.kiro/skills/`. For a clean setup in a new project, use only `.cursor/skills/` and delete duplicates elsewhere.

## Optional: Cursor hooks

After install, consider adding `.cursor/hooks.json` using the `suggesting-cursor-hooks` skill to auto-run:

```json
{
  "afterFileEdit": [{ "command": "npm run lint" }]
}
```

Adjust commands to match your project (`npm test`, `tsc --noEmit`, etc.).
