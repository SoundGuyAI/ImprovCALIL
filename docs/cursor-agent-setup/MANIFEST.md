# Cursor Agent Setup Manifest

Inventory of Cursor **project rules** (`.cursor/rules/`) and **skills** (`.cursor/skills/`) added to Improv Dashboard on 2026-05-29.

Use this file to replicate the same setup in another project. See [INSTALL-OTHER-PROJECT.md](./INSTALL-OTHER-PROJECT.md) for step-by-step instructions.

## Sources

| Source | URL | License |
|--------|-----|---------|
| awesome-cursorrules | https://github.com/PatrickJS/awesome-cursorrules | CC0-1.0 |
| awesome-cursor-skills | https://github.com/spencerpauly/awesome-cursor-skills | See repo |

---

## Project rules (`.cursor/rules/`)

16 files total: 15 from awesome-cursorrules + 1 project-specific custom rule.

### Tier 1 — Stack match

| File | Original source filename | Purpose |
|------|--------------------------|---------|
| `nextjs15-react19-tailwind.mdc` | `nextjs15-react19-vercelai-tailwind-cursorrules-prompt-file.mdc` | Next.js 15, React 19, Tailwind |
| `tailwind-react-firebase.mdc` | `tailwind-react-firebase-cursorrules-prompt-file.mdc` | Tailwind + React + Firebase |
| `rtl-i18n.mdc` | `rtl-right-to-left-i18n-cursorrules-prompt-file.mdc` | RTL/i18n, logical CSS, Tailwind |
| `nextjs-app-router.mdc` | `nextjs-app-router-cursorrules-prompt-file.mdc` | App Router patterns |

### Tier 2 — Agent discipline

| File | Original source filename | Purpose |
|------|--------------------------|---------|
| `anti-overengineering.mdc` | `anti-overengineering.mdc` | Minimal, scoped changes |
| `anti-sycophancy-code-discipline.mdc` | `anti-sycophancy-code-discipline-cursorrules-prompt-file.mdc` | Block hallucinated APIs, false validation |
| `typescript-code-convention.mdc` | `typescript-code-convention-cursorrules-prompt-file.mdc` | TypeScript conventions |
| `javascript-typescript-code-quality.mdc` | `javascript-typescript-code-quality-cursorrules-pro.mdc` | JS/TS code quality |
| `code-style-consistency.mdc` | `code-style-consistency-cursorrules-prompt-file.mdc` | Consistent style across codebase |

### Tier 3 — Testing & review

| File | Original source filename | Purpose |
|------|--------------------------|---------|
| `vitest-unit-testing.mdc` | `vitest-unit-testing-cursorrules-prompt-file.mdc` | Vitest unit tests |
| `playwright-e2e-testing.mdc` | `playwright-e2e-testing-cursorrules-prompt-file.mdc` | Playwright E2E |
| `playwright-accessibility-testing.mdc` | `playwright-accessibility-testing-cursorrules-prompt-file.mdc` | Playwright a11y |
| `pr-review.mdc` | `pr-review-cursorrules-prompt-file.mdc` | PR review (security, perf, tests, architecture) |

### Tier 4 — Security & deploy

| File | Original source filename | Purpose |
|------|--------------------------|---------|
| `devsecops-appsec.mdc` | `security-devsecops-ssdls-appsec.mdc` | DevSecOps, secrets, auth |
| `vercel-deployment.mdc` | `vercel-deployment-cursorrules-prompt-file.mdc` | Vercel deploy, edge, caching |

### Custom (project-specific)

| File | Purpose |
|------|---------|
| `next-intl-project.mdc` | next-intl EN/HE routing, translations, RTL — **customize per project** |

---

## Skills (`.cursor/skills/`)

26 directories total: 25 from awesome-cursor-skills + 1 custom skill.

### Tier 1 — Testing & browser QA

| Skill directory | Purpose |
|-----------------|---------|
| `adding-e2e-tests` | Scaffold Playwright E2E + CI |
| `writing-tests` | Write unit/integration tests with mocking |
| `recording-browser-flow-as-test` | Record browser flow → Playwright spec |
| `setting-up-ci` | GitHub Actions (lint, test, typecheck, deploy) |
| `finding-dev-server-url` | Find dev server port from terminals |
| `visual-qa-testing` | Browser screenshots, console, network audit |
| `verifying-in-browser` | Side-by-side dev server verification |
| `accessibility-auditing` | ARIA tree, labels, contrast |
| `responsive-testing` | Mobile/tablet/desktop screenshots |
| `rtl-locale-testing` | **Custom** — test `/en` vs `/he` RTL layouts |

### Tier 2 — Agent workflow

| Skill directory | Purpose |
|-----------------|---------|
| `suggesting-cursor-rules` | Propose new `.mdc` rules from repeated corrections |
| `suggesting-cursor-hooks` | Propose `.cursor/hooks.json` for lint/test automation |
| `auto-type-checking` | Run `tsc --noEmit` after edits |
| `grinding-until-pass` | Loop fix → test → lint until green |
| `systematic-debugging` | Reproduce, isolate, verify |
| `babysitting-pr` | Keep PR merge-ready (CI, comments, conflicts) |
| `parallel-test-fixing` | Fix failing tests in parallel subagents |

### Tier 3 — Code quality & security

| Skill directory | Purpose |
|-----------------|---------|
| `auditing-security` | OWASP, secrets, insecure patterns |
| `auditing-performance` | Bundle, rendering, CWV |
| `reviewing-code` | Correctness, maintainability, perf |
| `api-smoke-testing` | Hit API routes, report failures |

### Tier 4 — Optional / later

| Skill directory | Purpose |
|-----------------|---------|
| `adding-analytics` | PostHog events, flags, session replay |
| `adding-feature-flags` | Feature flags (PostHog or local) |
| `adding-error-tracking` | Sentry crash reporting |
| `seo-auditing` | Meta, OG, sitemap, CWV |
| `building-skills-from-patterns` | Turn repeated workflows into new skills |

### Not installed (listed in awesome-cursor-skills README but absent from repo)

| Skill | Notes |
|-------|-------|
| `anthropic-frontend-design` | Referenced in README; no `resources/` folder in repo at clone time |

---

## Pre-existing skills (not from awesome-cursor-skills)

These were already in the project under `.agents/skills/`, `.claude/skills/`, and/or `.kiro/skills/` before this setup. Consider consolidating into `.cursor/skills/` on other projects.

### Firebase (plugin + skills)

- `firebase-basics`
- `firebase-auth-basics`
- `firebase-firestore`
- `firebase-security-rules-auditor`
- `firebase-app-hosting-basics`
- `firebase-hosting-basics`
- `firebase-ai-logic-basics`
- `firebase-crashlytics`
- `firebase-data-connect`
- `firebase-remote-config-basics`

### Vercel

- `deploy-to-vercel`
- `vercel-cli-with-tokens`
- `vercel-react-best-practices`
- `vercel-composition-patterns`
- `vercel-react-view-transitions`
- `vercel-optimize`
- `web-design-guidelines`
- `vercel-react-native-skills` (only if doing RN)

### Other

- `xcode-project-setup` (iOS only)

---

## Project context reference (Improv Dashboard)

When adapting rules/skills to another stack, replace these project facts:

| Setting | Improv Dashboard value |
|---------|------------------------|
| Framework | Next.js 15 App Router, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Backend | Firebase (Auth, Firestore, Storage) |
| i18n | next-intl — `en`, `he` with RTL |
| Unit tests | Vitest |
| E2E | Playwright |
| Dev port | 9003 |
| Agent instructions | `AGENTS.md` |

---

## Directory layout after setup

```
.cursor/
  rules/          # 16 × .mdc files
  skills/         # 26 skill directories (each with SKILL.md)
  settings.json   # (existing) plugin config
  mcp.json        # (existing) MCP servers

docs/cursor-agent-setup/
  MANIFEST.md                 # this file
  INSTALL-OTHER-PROJECT.md    # replication guide
  install-from-sources.ps1    # Windows install script
  install-from-sources.sh     # Unix install script
```
