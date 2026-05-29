# Improv Calendar IL — TODO

Project backlog for the Israeli Improv Calendar. See [ISRAELI_IMPROV_CALENDAR.md](./ISRAELI_IMPROV_CALENDAR.md) for the full design / PRD.

---

## Infrastructure & workflow

- [ ] **Add Linear** — Connect the repo to Linear for issue tracking, sprints, and PR-linked work.
- [ ] **Add orchestration** — Set up agent/CI orchestration (e.g. automated PR babysitting, verification loops, deployment pipelines) so changes stay merge-ready.

---

## Priority (explicit backlog)

- [ ] **Finish implementing all pages** — Complete remaining UI, wiring, and edge cases on home, organizers, organizer detail, submit, and admin.
- [ ] **Fill in sample data** — Seed Firestore with realistic events, organizers, links, and pending submissions for dev/demo.
- [ ] **Hide admin panel button from navigation** — Remove `/admin` from public `Header` nav; expose admin only via direct URL or post-login UI.
- [ ] **Add admin functionality** — Full admin CRUD: create/edit events and organizers, merge duplicates, moderation feedback to submitters, link management.
- [ ] **Add calendar view to main page** — Week/month calendar UI on home (in addition to or instead of the current chronological list).
- [ ] **Add login** — Firebase Auth (or equivalent) for admins and optionally community users.
- [ ] **Add personalization** — Saved filters, preferred region/language, favorites, or other user-specific defaults (requires auth or local prefs).

---

## From design doc — not yet implemented

### Design & branding

- [ ] **Change color scheme to be more Israeli** — Refresh theme/Tailwind palette (Mediterranean tones, local cultural cues) while keeping contrast and accessibility for EN/HE.
- [ ] **Add light and dark modes** — Theme toggle (system preference + manual override); define light/dark token sets and persist user choice.

### Localization & UX

- [ ] **Multi-select region filter** — PRD allows filtering by one or more regions; UI is single-select today.
- [ ] **Proper event type field** — Store `Show | Jam | Workshop | Festival | Other` on each event; stop inferring type from title/description keywords.
- [ ] **Default “events this week” scope** — Home should default to the current week (Israel timezone), not all events.
- [ ] **Recurring events** — Model recurrence (weekly, monthly, bi-weekly, end date) and expand occurrences in calendar/list views.

### Subscription & outreach

- [ ] **iCal / Google Calendar feed** — Public subscription URL; exclude hidden events from feed.
- [ ] **Email signup & newsletter** — Collect email (+ optional phone with consent) for updates and notifications.

### Static pre-rendering & performance

- [ ] **Static home / “this week” page** — SSG or ISR for the default calendar view.
- [ ] **Static organizer reference pages** — Pre-render one page per published, non-hidden organizer.
- [ ] **Regeneration triggers** — Nightly midnight (Israel TZ) refresh plus on-change rebuild when published/hidden records change.
- [ ] **CDN cache invalidation** — Purge updated URLs after static rebuild.

### Data entry & integrations

- [ ] **Free-text submission + real LLM parsing** — Parse pasted flyer text into structured draft fields (Gemini or similar); queue for moderation.
- [ ] **Organizer form: new vs update flow** — Search/select existing organizer for updates; admin merge on approve.
- [ ] **REST or GraphQL API** — Programmatic create/update of events and organizers (authenticated).
- [ ] **WhatsApp scraping** — Automated ingestion from relevant groups (beyond admin simulator).
- [ ] **Telegram bot** — Live bot: receive messages, LLM parse, confirm receipt, optional clarifying questions, queue for moderation.

### Admin panel (design gaps)

- [ ] **Secure admin access** — Auth + authorization; admin routes must not be usable anonymously.
- [ ] **Manual add/edit event forms** — Full field editing in admin (region, organizer FK or display string, typed links, recurrence, hidden).
- [ ] **Organizer merge** — Merge duplicate organizer records from admin.
- [ ] **Moderation feedback** — Optional rejection reason emailed to submitter when contact was provided.
- [ ] **Firestore security rules** — Least-privilege rules aligned with public read vs admin write.

### Organizer directory (design gaps)

- [ ] **Respect hidden organizers on public site** — No directory link to hidden organizers; plain-text host name on linked events when organizer is hidden.
- [ ] **Organizer logos** — Upload/display logo on directory and detail pages.

### Visibility & featured content

- [ ] **Featured banner rules** — Ensure hidden events never appear in public featured carousel (partially done; verify end-to-end).

---

## Pages & polish checklist

| Page | Status | Remaining work |
|------|--------|----------------|
| Home (`/`) | Partial | Calendar view, week scope, event type field, subscription CTA |
| Organizers (`/organizers`) | Partial | Logos, static pre-render hook |
| Organizer detail (`/organizers/[id]`) | Partial | Static pre-render, hidden-organizer edge cases |
| Submit (`/submit`) | Partial | Real LLM tab, organizer update flow, validation |
| Admin (`/admin`) | Partial | Auth gate, create/edit forms, merge, hide nav link |

---

## Reference

- Design / PRD: [ISRAELI_IMPROV_CALENDAR.md](./ISRAELI_IMPROV_CALENDAR.md)
- Inspiration: [London](https://improv-calendar.co.uk/), [Bristol](https://bristol-improv-calendar.netlify.app/), [Amsterdam](https://improv.amsterdam/)
