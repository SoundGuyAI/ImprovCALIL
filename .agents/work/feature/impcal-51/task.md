# Todo List - IMPCAL-51 Language Selection

- [ ] Audit and align `src/components/LocaleSwitcher.tsx` with reference and check its dropdown styling, ARIA labels, and transitions.
- [ ] Verify `src/components/Header.tsx` usage of `LocaleSwitcher`.
- [ ] Audit `src/app/[locale]/layout.tsx` usage of `AppVersion` footer component.
- [ ] Run typescript checks, lint, and tests locally to verify correctness.
- [ ] Run Playwright tests and expand if necessary to cover all switcher transitions and ARIA labels.
- [ ] Save screenshot evidence under `.screenshots/IMPCAL-51/attempt-1/` and commit the files.
- [ ] Run `node scripts/verify-harness.js`.
- [ ] Submit the branch and PR.
