# Plan - Address PR Comments and Fix Bugs

This plan details the fixes for bugs identified in PR 76 review #4462967694, including the month drawer desync, event type mapping, and seed data cleanup, followed by creating a Linear card for multi-day events.

## User Review Required

> [!NOTE]
> We will create a Linear issue for the multi-day event calendar rendering constraint, as it is a pre-existing architectural limitation of `getEventsForDay` and is outside the immediate scope of PR 76.

## Proposed Changes

### Next.js Client & Components

#### [MODIFY] [page.tsx](file:///C:/Users/Oded/.gemini/antigravity/worktrees/IMPCAL-13/src/app/[locale]/page.tsx)
- Revert initial `selectedCalendarDay` state to `null` to prevent the mobile events panel from opening automatically on load.
- Add `md:hidden` class to the Month View selected-day events panel container to prevent it from rendering on desktop viewports (where events are already listed inline within the calendar cells).
- Update the event type filter logic to inspect `e.type` directly (case-insensitive) if it is set. If `e.type` is not present, fall back to title and description keyword checks to support legacy events.

### Data Layer

#### [MODIFY] [db.ts](file:///C:/Users/Oded/.gemini/antigravity/worktrees/IMPCAL-13/src/lib/db.ts)
- Update `getEvents` document mapping to copy `type: data.type` into the returned `FirestoreEvent` object.
- Update `getOrganizerDetails` document mapping to copy `type: evtData.type` into the returned events list.

### Scripts & Tooling

#### [MODIFY] [seed.js](file:///C:/Users/Oded/.gemini/antigravity/worktrees/IMPCAL-13/scripts/seed.js)
- Remove the leftover debug string `" Re-rendered static index test."` from the description of `evt-haifa-festival`.

## Linear Integration
- Create a Linear card for tracking multi-day event calendar rendering support (making events span multiple days instead of just the start day).

## Babysitting & Verification Plan
- Use `dev_agent` and `reviewer_agent` subagents to apply the changes and execute `node scripts/verify-harness.js`.
- Push to `feature/impcal-13`.
- Run a babysitting loop that waits for 5 minutes after pushing to ensure GitHub Actions CI completes fully and Bugbot submits its final review.
- Double-check comments and review status to ensure there are no new issues.
- Dispatch a Telegram notification on completion.
