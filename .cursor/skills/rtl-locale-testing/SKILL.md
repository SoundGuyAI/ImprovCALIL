---
name: rtl-locale-testing
description: Test RTL locale pages (e.g. /he) alongside LTR (/en) — screenshot both, check dir, logical CSS, and mirrored layouts in Cursor's browser.
user-invocable: true
---

# RTL Locale Testing

Verify bilingual apps render correctly in both LTR and RTL locales after UI changes.

## When to Use

- After editing layout, navigation, forms, or Tailwind spacing
- When adding or changing translated copy
- Before merging UI PRs for i18n-enabled apps

## Workflow

### 1. Start dev server

Run the project's dev command and note the port (Improv Dashboard uses **9003**).

### 2. Test LTR baseline

Open `{baseUrl}/en` (or the default locale path). Screenshot key pages.

### 3. Test RTL locale

Open `{baseUrl}/he` (or the RTL locale path). Screenshot the same pages.

### 4. Checklist

- `<html dir="rtl">` on Hebrew (or RTL) pages; `dir="ltr"` on English
- Text alignment follows reading direction
- Icons, chevrons, and asymmetric UI mirror correctly (back buttons, dropdown carets)
- No horizontal overflow or clipped content in RTL
- Forms: labels, errors, and focus rings align with reading direction
- Tailwind uses logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) — flag physical `ml-*`/`mr-*`/`pl-*`/`pr-*` in new code
- Both locale message files have matching keys

### 5. Viewport sizes

Repeat at mobile (~375px), tablet (~768px), and desktop (~1280px) for at least one critical page per locale.

### 6. Report

List pages tested, screenshots taken, and any RTL-specific issues with file/line references.

## Pair With

- `responsive-testing` — multi-viewport checks
- `accessibility-auditing` — labels and tab order in both locales
- `visual-qa-testing` — general browser verification
