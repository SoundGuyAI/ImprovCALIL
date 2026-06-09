# Task List - IMPCAL-13: Add Calendar View to Main Page

- [x] Add translation keys for `listView`, `weekView`, `monthView`, `today`, `next`, `prev` to `messages/en.json` and `messages/he.json`.
- [x] Implement UI for view mode switcher in `src/app/[locale]/page.tsx` (above the event listing).
- [x] Implement `Week View` UI & Logic (Sunday start, previous/next buttons, list of events under each day, details modal triggers).
- [x] Implement `Month View` UI & Logic (Grid layout, previous/next month navigation, desktop event items, mobile responsive selection and drawer list, details modal triggers).
- [x] Add new Playwright E2E tests in `e2e/calendar.spec.ts` covering view switching, navigation, and modal activation.
- [x] Run `node scripts/verify-harness.js` to ensure the changes are clean, build successfully, and all tests pass.
- [x] Submit changes.
