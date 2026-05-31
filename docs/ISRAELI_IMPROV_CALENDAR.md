# Israeli Improv Calendar - Design & PRD

## Core Features

### Site Localization

- The website UI must be fully localized in **Hebrew** and **English**.
- Support for RTL (Right-to-Left) and LTR (Left-to-Right) layouts.

### Event Types

The system must support distinct event categories:

- **Show**: Performance events.
- **Jam**: Open participation improv sessions.
- **Workshop**: Educational/training sessions.
- **Festival**: Multi-day or special event series.
- **Other**: Catch-all for events that do not fit the categories above, or for event types not yet supported in the system (until a dedicated type is added).

### Regions

Events are categorized by **region** in Israel. Users can browse and filter the calendar by region.

- **Tel-Aviv**
- **Jerusalem**
- **Beer-Sheva**
- **Haifa**
- **Hasharon**
- **Other areas**: Events outside the listed regions, or where the region is unclear until confirmed.

Each event must be assigned exactly one region (default or inferred on submission; admins can correct). The calendar view should support filtering by one or more regions, and optionally grouping or splitting the event list by region.

### Filters & Search

- **Region**: Filter by Tel-Aviv, Jerusalem, Beer-Sheva, Haifa, Hasharon, Other areas (single or multi-select).
- **Language**: Filter events by their primary language (Hebrew, English, etc.).
- **Event Type**: Filter by Show, Jam, Workshop, Festival, Other.
- **Cost**: Filter by **Paid** vs **Free**.
- **Access**: Filter by **Private** vs **Open** events.

### Typed links (events & organizers)

Both **event** and **organizer** records can include zero or more **links**. Each link is a row in the database (not only inline HTML), so type and URL are queryable and consistent in admin and on the public site.

**Link type** (stored per link; exactly one):

- **Website**: General site or landing page.
- **Facebook**: Facebook page or profile.
- **Facebook event**: Link to a specific Facebook event.
- **WhatsApp group**: Invite or group link.
- **Instagram**: IG profile or post.
- **Other**: Any URL that does not fit the above; optional short **label** (e.g. “Ticket booth”, “YouTube”) shown next to the icon.

**Link record** fields:

- Parent: event ID and/or organizer ID (links belong to one parent).
- **URL** (required).
- **Link type** (required; enum above).
- Optional **label** (especially for `other`).
- Optional sort order for display.

**Display**: Render each link with an icon matching its type (site, Facebook, WhatsApp, Instagram, generic/external). For `other`, use a generic link icon plus the label when present. Links open in a new tab with appropriate `rel` attributes.

### Organizers (database)

**Organizers** are first-class records in the database when the host is a known, reusable entity (troupe, school, theater, etc.). Events do **not** always require an organizer record—see **Organizer on events** below.

**Organizer type** (exactly one per record):

- **Group**: Improv troupe, collective, or community group.
- **School**: Training program or improv school.
- **Theater**: Venue or theater company focused on performance.
- **Other**: Any entity that is not a group, school, or theater (e.g. independent producer, festival brand, one-off host).

**Organizer record** fields (stored in the database, editable via admin):

- Name, **type** (Group / School / Theater / Other), description, **region**, languages, **typed links** (see above), optional logo/image, publish status, **hidden** (see **Visibility (hidden)**).

New organizers can be created in admin or proposed via the **organizer web form** (and other submission flows); duplicates should be merged or linked during moderation.

### Organizer on events

Each event uses **one** of the following (mutually exclusive for display; both may exist internally during moderation until an admin links a record):

1. **Organizer record** (optional FK): When set, the event is tied to a published organizer; the calendar and organizer directory show the canonical name, type, region, and links from that record.
2. **Organizer display string** (plain text): When there is no organizer record—or the host is not yet in the directory—the event shows a **string** only (e.g. “Open mic hosts”, a person’s name, a one-off collective). The string **`Unknown`** is valid when the submitter does not know the host; show it literally or with a neutral “Organizer unknown” label per UI copy.

Moderation should prefer linking to an existing organizer or creating one when the same host appears often; otherwise keep the display string.

### Visibility (hidden)

Events and organizers each have a **`hidden`** flag (boolean, stored in the database). Hidden records **remain in the database** and are fully editable in admin; they are **excluded from all public display** until the flag is cleared.

**Hidden event** — not shown on the public calendar (any view or filter), **iCal/subscription feeds**, featured banner, or static pre-rendered listings; not counted in public “events this week” or organizer **public** upcoming/past lists.

**Hidden organizer** — omitted from the organizer directory listing; no public organizer reference page (treat as not found or unpublished for anonymous users). **Published events** linked to a hidden organizer may still appear on the calendar if the events themselves are not hidden; the public UI should not link to the hidden organizer’s directory URL (show name as plain text only, or organizer display string as applicable).

**Admin only**:

- Toggle **hidden** on any event or organizer record (independent of draft/pending vs published).
- **Show hidden** toggle in the admin UI (per session or list view): when **off**, admin lists and calendars match the public site (hidden omitted). When **on**, hidden events and organizers appear in admin lists (visually distinct, e.g. badge or muted row) for review, merge, or un-hiding.
- Optional admin preview of the public site always behaves as the anonymous user (hidden excluded) unless a dedicated “preview including hidden” mode is added later.

Community submissions do not set **hidden**; only admins (or automated admin rules) do.

### Event Data Structure

Each event entry must include:

- **Name**: Title of the event.
- **Organizer**: Either a reference to an **organizer** record (by ID) **or** an **organizer display string** (see **Organizer on events**). Do not require both; do not require a record when only a string is known.
- **Typed links** (optional): Event-specific links (tickets, Facebook event, WhatsApp, etc.) using the same **link type** model as organizers; stored in the database per link.
- **Time**: Date and start/end time.
- **Recurrence**:
  - **One-time**: Single event.
  - **Recurring**: Repeating event with defined frequency (e.g., Weekly, Monthly, Bi-weekly) and optional **End Date** (e.g. for a 6-week workshop).
- **Location**: Venue address and/or map link.
- **Region**: One of Tel-Aviv, Jerusalem, Beer-Sheva, Haifa, Hasharon, Other areas (derived from location when possible).
- **Attributes**:
  - Language (e.g., Hebrew, English, Spanish, Other).
  - Cost (Paid/Free).
  - Access (Private/Open).
- **Hidden**: When true, record is kept in the database but excluded from public display (see **Visibility (hidden)**).

### Subscription

- Users must be able to **subscribe** to the calendar (e.g., iCal/Google Calendar feed).
- **Email signup & newsletter** subscription.
- During signup, collect **email address** and **phone number** (with consent) for updates and notifications.

### Featured Content

- **Featured Event Banner**: A prominent banner at the top of the site to highlight specific events. **Hidden** events must not appear in the public banner even if marked featured.

### Static pre-rendering (performance)

Some high-traffic views change less often than the full event feed and are good candidates for **static HTML** generated ahead of time, then served from cache or a CDN.

**Pre-rendered pages** (initial scope):

- **Home / main calendar**: The default view showing **events this week** (or equivalent primary listing).
- **Organizer reference pages**: One static page per published organizer in the directory.

**Regeneration triggers**:

- **Scheduled**: e.g. every night at **midnight** (Israel timezone) to refresh week boundaries and “this week” lists.
- **On change**: When a **published** event or organizer is **added, updated, unpublished, or hidden/unhidden**, enqueue a rebuild of affected static pages (home if the event falls in the current week; that organizer’s page if the organizer is published and not hidden). Static output must **exclude hidden** events and organizers (same rules as the live public site).

**Implementation notes** (for engineering; not prescriptive):

- Use SSG/ISR or a build step plus invalidation webhooks; keep admin and API paths dynamic.
- Full calendar browse (all regions, all filters, far-future dates) may stay **dynamic** or use shorter cache TTL than the home and organizer pages.
- After regeneration, purge CDN/cache keys for updated URLs only.

### Organizer directory (organization references)

The calendar site includes a **directory of organization references**—pointers to groups, schools, theaters, and other organizers in the database. These are **not** social-style profile pages; they are concise **referral entries** (who they are, how to find them, what they run).

- Each **organization reference** is **rendered from a database record** (one URL per published organizer). Content updates when admins edit the record; public HTML for each page is **pre-rendered** on a schedule and on publish (see **Static pre-rendering**).
- Updates are **infrequent** compared to events (semi-static): reference entries change occasionally, while the event calendar changes often.
- A **listing page** indexes all published, **non-hidden** organization references; users can browse by name, filter by **organizer type** (Group, School, Theater, Other), and filter by **region** (same regions as events).
- Each reference entry shows key organizer details, **typed outbound links** (with icons per link type), and **upcoming / past events** linked to that organizer.
- Records are maintained via the admin panel (add, edit, publish/unpublish) and via the **organizer submission form** (see **Data Entry & Integrations**); nothing is published until an admin approves.

### Data Entry & Integrations

- **Event web form**: A user-friendly structured form for manual event submission.
- **Organizer web form**: A structured on-site form for groups, schools, theaters, and other hosts to **propose or update** an organizer directory entry. Submissions are stored as **draft/pending** and are **not** published automatically.
  - **Fields** (aligned with organizer records): name, **type** (Group / School / Theater / Other), description, **region**, languages, **typed links** (URL + link type per row), optional logo/image upload, optional submitter contact (email/phone, for moderation only—not shown publicly unless admin chooses).
  - **New vs update**: Submitter indicates whether this is a **new** organizer or an **update** to an existing listing; for updates, search/select the existing record or provide enough detail for admin to match (name + region + type).
  - **Flow**: On submit, confirm receipt; entry enters the **organizer moderation queue**. Admin reviews, edits, merges duplicates, approves (creates or updates published record + triggers static rebuild) or rejects (optional reason to submitter if contact was provided).
  - Same moderation rules as events: no auto-publish, no overwrite of a live record without admin action.
- **Free-text submission (site)**: A simple on-site field where users paste or type unstructured event details (like a message or flyer text). An **LLM** (or admin during moderation) extracts structured fields; the submission is stored as **draft/pending** and enters the **moderation queue**—same rules as other channels (not auto-published).
- **API**: A REST/GraphQL API for programmatic data entry.
- **Scraping**: Automated scraping of event data from relevant **WhatsApp groups**.
- **Telegram bot**:
  - Users send free-text messages (and optionally images/links) describing an event to a dedicated **Telegram bot**.
  - An **LLM** parses the message and extracts structured fields (name, time, location, region, type, language, cost, access, organizer name/type, **URLs with inferred link types**, etc.); matcher logic or admin links the submission to an existing **organizer** record, creates a pending one, or leaves an **organizer display string** (including `Unknown`) when no match exists.
  - Parsed results are stored as **draft** or **pending** submissions—not published automatically.
  - Submissions enter the **moderation queue** for admin review, edit, and approve/reject before appearing on the calendar.
  - The bot should confirm receipt and, when useful, ask clarifying questions or report missing fields the LLM could not infer.

### Admin Panel

- **Dashboard**: Secure interface for administrators.
- **Event Management**: Add, edit, and delete events manually (including **region**, **organizer record or display string**, **typed links**, and **hidden**). List views support a **Show hidden** toggle to include or exclude hidden events.
- **Organizer Management**: Add, edit, merge, and publish organizer records (type: Group, School, Theater, Other; **typed links**; **hidden**); organization reference pages update when records change and trigger static rebuilds where configured. List views support **Show hidden** for hidden organizers.
- **Moderation Queue**: Review system to **approve** or reject community submissions before they go live:
  - **Events**: structured web form, free-text site submission, API, scraping, Telegram bot / LLM pipeline.
  - **Organizers**: organizer web form (new listings and proposed updates); approve merges into published directory or reject with optional feedback.
- **Featured Control**: Toggle specific events as "Featured" to display them in the top banner.

## Referral Sites

- [**London Improv Calendar**](https://improv-calendar.co.uk/): Reference for design and functionality inspiration.
- [**Bristol Improv Calendar**](https://bristol-improv-calendar.netlify.app/): Reference for design and functionality inspiration.
- [**Amsterdam Improv Calendar**](https://improv.amsterdam/): Reference for design and functionality inspiration.
