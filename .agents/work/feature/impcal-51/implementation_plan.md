# Implementation Plan - IMPCAL-51 Language Selection like in Improdash

Port the bilingual flag emoji language switcher and app version widget from the Improv Dashboard project to the Improv Calendar Israel project.

## Tasks to complete:
1. Verify the setup of the worktree and that the branch `feature/impcal-51` is checked out.
2. Confirm the localization configurations in `messages/en.json` and `messages/he.json`.
3. Audit and align `src/components/LocaleSwitcher.tsx` with the reference implementation in `C:\UnityProj\ImprovDashboard\src\components\LocaleSwitcher.tsx`.
4. Check that `src/components/Header.tsx` imports and embeds the `LocaleSwitcher` correctly.
5. Check `src/app/[locale]/layout.tsx` to verify `<AppVersion />` is placed in the footer, centered, styled, and premium-looking.
6. Verify and update Playwright E2E tests in `e2e/sanity.spec.ts` to cover locale switching and version rendering.
7. Run the verification harness using `node scripts/verify-harness.js`.
8. Take screenshot evidence of language switching and footer rendering and commit the screenshots.
9. Submit the changes using the submit script.
