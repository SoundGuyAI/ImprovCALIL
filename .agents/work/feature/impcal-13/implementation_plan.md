# Implementation Plan - IMPCAL-13: Add Calendar View to Main Page

This plan outlines the design and implementation steps for introducing week and month calendar views on the localized home page (`/en` and `/he`).

## User Experience Goals
1. **View Modes**: Introduce a switchable control (tabs) for `List`, `Week`, and `Month` views.
2. **Consistent Filters**: Ensure all filters (search, region, type, language, cost, access) continue to filter the events shown in all views.
3. **Week View Layout**: 
   - Displays a 7-day view starting on Sunday (the start of the workweek in Israel).
   - Allows navigation to the previous/next week and a "Today" button to return.
   - Shows event cards on each day with event name, time, region, and details trigger.
4. **Month View Layout**:
   - A grid layout of the current month.
   - Supports RTL layout natively for `/he` (columns reversed or localized).
   - Responsive design: on desktop, shows compact event links inside cells; on mobile, days with events show indicators (dots), and clicking a day displays the selected day's events below the grid.
   - Allows navigation to previous/next month and a "Today" button.
5. **Affordances**: Clicking an event inside any view triggers the existing event detail modal.

## Technical Design

### State management in `page.tsx`
- `viewMode`: `'list' | 'week' | 'month'` (defaults to `'list'`)
- `currentDate`: `Date` (reference date for week/month navigation, defaults to today)
- `selectedCalendarDay`: `Date | null` (currently selected day for mobile month detail drawer/section, defaults to today)

### Helper Utilities
We will add standard JS Date helpers directly inside `page.tsx` or as inline functions:
- `getStartOfWeek(date: Date)`: returns Sunday of that week.
- `getDaysInMonth(year: number, month: number)`: returns number of days.
- `getFirstDayOfMonth(year: number, month: number)`: returns index (0-6) of the first day.
- `isSameDay(date1: Date, date2: Date)`: checks if two dates are the same calendar day.

### Translations
We will add new keys in `messages/en.json` and `messages/he.json`:
- `Common.listView`: "List View" / "תצוגת רשימה"
- `Common.weekView`: "Week View" / "תצוגת שבוע"
- `Common.monthView`: "Month View" / "תצוגת חודש"
- `Common.today`: "Today" / "היום"
- `Common.next`: "Next" / "הבא"
- `Common.prev`: "Previous" / "הקודם"

## Verification Steps
1. **Manual Check**: Verify UI toggles, Hebrew translation, and RTL rendering.
2. **E2E Tests**: Write automated E2E tests in `e2e/calendar.spec.ts` using Playwright:
   - Verifies the view mode switcher is visible.
   - Switches to Week View, verifies navigation and event presence.
   - Switches to Month View, clicks a day/event, verifies detail modal opens.
3. **Verify Harness**: Run `node scripts/verify-harness.js`.
