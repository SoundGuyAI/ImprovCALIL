# PR Review Comments

## Comment 0

- **ID**: 3374032270
- **Path**: src/components/auth/ProfileMenu.tsx
- **Line**: 32

### Sign-in routes missing

**High Severity**

<!-- DESCRIPTION START -->

The header now links signed-out users to `/login`, and registration redirects to `/profile/edit`, but no matching pages exist under `src/app/[locale]`. Sign-in and profile flows from the new menu cannot load.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: c967a8b2-515a-469e-9ed6-c315b5e65ec1 -->

<!-- LOCATIONS START
src/components/auth/ProfileMenu.tsx#L23-L32
LOCATIONS END -->
<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmE4YTg3OTY0LTM5YTktNDdhOC1hNzg3LTY2YjM4YWU1YTJiNiIsImVuY3J5cHRpb25LZXkiOiJZWWpZLUtJRk4xR0xjenlpcUhnMmRndVIxa1NrTUdqNjlVc0tCWVRENEFFIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmE4YTg3OTY0LTM5YTktNDdhOC1hNzg3LTY2YjM4YWU1YTJiNiIsImVuY3J5cHRpb25LZXkiOiJZWWpZLUtJRk4xR0xjenlpcUhnMmRndVIxa1NrTUdqNjlVc0tCWVRENEFFIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNDE2YjI0NmQ2ZmRmYWY5NTdjMjU3MmE4ZmNlMmE5MTQxOGJhODM2ZiIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 416b246d6fdfaf957c2572a8fce2a91418ba836f. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 1

- **ID**: 3374032278
- **Path**: firestore.rules
- **Line**: 52

### Anonymous submit default mismatch

**Medium Severity**

<!-- DESCRIPTION START -->

Guest submission creates now require `config/submissions` with `allowAnonymous == true`, but the app treats a missing config document as allowing anonymous submissions. Until an admin writes that doc, anonymous submits fail while the admin settings UI defaults the toggle on.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: d6280ea7-edf0-4508-a1d8-82cc19004003 -->

<!-- LOCATIONS START
firestore.rules#L47-L52
src/lib/db.ts#L474-L485
LOCATIONS END -->
<details>
<summary>Additional Locations (1)</summary>

- [`src/lib/db.ts#L474-L485`](https://github.com/SoundGuyAI/ImprovCALIL/blob/416b246d6fdfaf957c2572a8fce2a91418ba836f/src/lib/db.ts#L474-L485)

</details>

<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmE3MGU1YjE2LTIzOGQtNDM1Ni05NGNkLWZlOTljNDY5NTI1ZCIsImVuY3J5cHRpb25LZXkiOiJqQ1F1cFBOZnFTM1pDMFBrSVZuVW8tZUhwbFRGd0NkN19Fai1jUVFTT3BzIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmE3MGU1YjE2LTIzOGQtNDM1Ni05NGNkLWZlOTljNDY5NTI1ZCIsImVuY3J5cHRpb25LZXkiOiJqQ1F1cFBOZnFTM1pDMFBrSVZuVW8tZUhwbFRGd0NkN19Fai1jUVFTT3BzIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNDE2YjI0NmQ2ZmRmYWY5NTdjMjU3MmE4ZmNlMmE5MTQxOGJhODM2ZiIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 416b246d6fdfaf957c2572a8fce2a91418ba836f. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 2

- **ID**: 3374032285
- **Path**: src/lib/permissions.ts
- **Line**: 19

### Admin gate token mismatch

**Medium Severity**

<!-- DESCRIPTION START -->

Server and UI admin checks use the Firestore profile `isAdmin` flag and `NEXT_PUBLIC_ADMIN_DEV_UID`, while Firestore rules only honor `request.auth.token.isAdmin`. Users who pass the new admin layout can still fail client writes like saving submission settings or moderating the queue.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: 088eaac9-02db-4207-9466-d44a6f3afc19 -->

<!-- LOCATIONS START
src/lib/permissions.ts#L3-L19
firestore.rules#L8-L12
LOCATIONS END -->
<details>
<summary>Additional Locations (1)</summary>

- [`firestore.rules#L8-L12`](https://github.com/SoundGuyAI/ImprovCALIL/blob/416b246d6fdfaf957c2572a8fce2a91418ba836f/firestore.rules#L8-L12)

</details>

<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjRkY2Q5ZjIyLTYyZGItNDdiYi04MWNmLTExMmZlZjQ5YTc2MiIsImVuY3J5cHRpb25LZXkiOiIzbm5lckg1M0ZvanFNbXVnd1ZPYzVKbG5zdklIay1MemJFR0ZhSUtublhVIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjRkY2Q5ZjIyLTYyZGItNDdiYi04MWNmLTExMmZlZjQ5YTc2MiIsImVuY3J5cHRpb25LZXkiOiIzbm5lckg1M0ZvanFNbXVnd1ZPYzVKbG5zdklIay1MemJFR0ZhSUtublhVIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNDE2YjI0NmQ2ZmRmYWY5NTdjMjU3MmE4ZmNlMmE5MTQxOGJhODM2ZiIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 416b246d6fdfaf957c2572a8fce2a91418ba836f. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 3

- **ID**: 3374032297
- **Path**: src/components/auth/AuthProvider.tsx
- **Line**: 126

### Auth listener loading stall

**Medium Severity**

<!-- DESCRIPTION START -->

When `onAuthStateChanged` runs while `signingInRef` is true, the handler returns without clearing `loading`. If that ref stays set or no sign-in handler finishes, the profile menu can remain stuck on the loading state.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: a43c1496-b77a-4402-b979-3bdb399b35c8 -->

<!-- LOCATIONS START
src/components/auth/AuthProvider.tsx#L92-L95
LOCATIONS END -->
<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmIwZDczMTZmLTI3ZTQtNGZiZS1hM2EyLTI1ZmI1NGUyYTY5ZSIsImVuY3J5cHRpb25LZXkiOiJNRWhreDZFZUFCeGFMcnBoN1ZVUmxvSXo4SHZYalprdWgxTzVYX1hvR2JjIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmIwZDczMTZmLTI3ZTQtNGZiZS1hM2EyLTI1ZmI1NGUyYTY5ZSIsImVuY3J5cHRpb25LZXkiOiJNRWhreDZFZUFCeGFMcnBoN1ZVUmxvSXo4SHZYalprdWgxTzVYX1hvR2JjIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNDE2YjI0NmQ2ZmRmYWY5NTdjMjU3MmE4ZmNlMmE5MTQxOGJhODM2ZiIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 416b246d6fdfaf957c2572a8fce2a91418ba836f. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 4

- **ID**: 3374144171
- **Path**: firestore.rules
- **Line**: null

<!-- CURSOR_AUTOMATION_ID: 04e2daec-03e4-4452-a690-a8ff569be0cb | RUN_ID: bc-db1a13c8-69b8-487b-b6f4-8236f586d084 -->

**Blocker — moderation bypass**

This rule lets any authenticated user whose `ownerUid` matches write **any field** on their organizer document via the Firebase client SDK.

That conflicts with IMPCAL-42 and `docs/auth_porting_plan.md` §Organizer Ownership: owner edits must create `edit_organizer` submissions, not write the public record directly.

**Trigger:** `updateDoc(doc(db, 'organizers', id), { hidden: false, publishStatus: 'published' })` from browser console while signed in as the owner.

**Fix:** Use `allow write: if isAdmin();` only (same as `events`). Route owner edits through `submissions` + admin `approveSubmission`.

---

## Comment 5

- **ID**: 3374148029
- **Path**: src/app/[locale]/admin/layout.tsx
- **Line**: 10

### Admin gate mismatches Firebase writes

**High Severity**

<!-- DESCRIPTION START -->

The admin layout treats a valid HTTP session profile as authorized, but admin actions such as saving submission settings still use the client Firestore SDK, which relies on a signed-in Firebase user with the `isAdmin` custom claim. A user can pass the layout with only the session cookie while the client has no Firebase auth, so the console loads but privileged writes are denied by rules.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: 5a30a099-6db2-42c5-a5c3-14a7c088f74f -->

<!-- LOCATIONS START
src/app/[locale]/admin/layout.tsx#L6-L9
src/lib/db.ts#L488-L496
LOCATIONS END -->
<details>
<summary>Additional Locations (1)</summary>

- [`src/lib/db.ts#L488-L496`](https://github.com/SoundGuyAI/ImprovCALIL/blob/5e47bf8057b717ad8521d7f61a49532e973c7990/src/lib/db.ts#L488-L496)

</details>

<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmJhOTNhY2M0LTcxMGQtNGUxMi1iMWQ4LTJmOTVkY2EzNWYzNyIsImVuY3J5cHRpb25LZXkiOiJFX0xDVHc4aEZNVlN4UWZndGNpZ1p6UjdLczM1VkdHeGl0dktQaWQ0dHhBIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmJhOTNhY2M0LTcxMGQtNGUxMi1iMWQ4LTJmOTVkY2EzNWYzNyIsImVuY3J5cHRpb25LZXkiOiJFX0xDVHc4aEZNVlN4UWZndGNpZ1p6UjdLczM1VkdHeGl0dktQaWQ0dHhBIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNWU0N2JmODA1N2I3MTdhZDg1MjFkN2Y2MWE0OTUzMmU5NzNjNzk5MCIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 5e47bf8057b717ad8521d7f61a49532e973c7990. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 6

- **ID**: 3374148042
- **Path**: firestore.rules
- **Line**: 79

### Owner organizer rule breaks create

**Medium Severity**

<!-- DESCRIPTION START -->

The new organizer owner write rule compares `resource.data.ownerUid` to the caller. On document create, `resource` is null in Firestore rules, so the owner branch never passes and only admins can create organizer documents, despite the rule appearing to grant owner writes.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: 06fe86ac-6494-434a-8858-108364fcfdc8 -->

<!-- LOCATIONS START
firestore.rules#L68-L75
LOCATIONS END -->
<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjNkNGNjOGYxLTEwNjQtNDhjNS1hZGZiLTU3NDRhOWNhNDA3NyIsImVuY3J5cHRpb25LZXkiOiJiVkhRbTFwV3c5NnY5RjAyV3FPTzBXbk5CWXYwa1h5YVhIRVBORVNKeDVFIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjNkNGNjOGYxLTEwNjQtNDhjNS1hZGZiLTU3NDRhOWNhNDA3NyIsImVuY3J5cHRpb25LZXkiOiJiVkhRbTFwV3c5NnY5RjAyV3FPTzBXbk5CWXYwa1h5YVhIRVBORVNKeDVFIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNWU0N2JmODA1N2I3MTdhZDg1MjFkN2Y2MWE0OTUzMmU5NzNjNzk5MCIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 5e47bf8057b717ad8521d7f61a49532e973c7990. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 7

- **ID**: 3374148050
- **Path**: src/lib/auth/server.ts
- **Line**: 73

### Admin claim sync on login

**Medium Severity**

<!-- DESCRIPTION START -->

Firestore admin writes use the ID token `isAdmin` claim, while UI gating uses `profile.isAdmin` from Firestore. The claim is only synced inside `createSessionAndProfile`, so an admin promoted in Firestore who still has an old session can see the admin UI but client settings saves fail rules checks.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: a8e989ad-4bee-4c2c-b76b-8f70ab5f1cf6 -->

<!-- LOCATIONS START
src/lib/auth/server.ts#L74-L78
src/app/[locale]/admin/page.tsx#L106-L115
LOCATIONS END -->
<details>
<summary>Additional Locations (1)</summary>

- [`src/app/[locale]/admin/page.tsx#L106-L115`](https://github.com/SoundGuyAI/ImprovCALIL/blob/5e47bf8057b717ad8521d7f61a49532e973c7990/src/app/[locale]/admin/page.tsx#L106-L115)

</details>

<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjgxNDI4M2M2LTI0ZjEtNGYyYi04MzY3LTEwNjJjM2ZlNjEyYiIsImVuY3J5cHRpb25LZXkiOiJzOVZUb3Exc0c5eS0tMGpLOG9xNkVtYkJGRmVEZms0a2VwV1lmNGtyX2JrIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjgxNDI4M2M2LTI0ZjEtNGYyYi04MzY3LTEwNjJjM2ZlNjEyYiIsImVuY3J5cHRpb25LZXkiOiJzOVZUb3Exc0c5eS0tMGpLOG9xNkVtYkJGRmVEZms0a2VwV1lmNGtyX2JrIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNWU0N2JmODA1N2I3MTdhZDg1MjFkN2Y2MWE0OTUzMmU5NzNjNzk5MCIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 5e47bf8057b717ad8521d7f61a49532e973c7990. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 8

- **ID**: 3374197149
- **Path**: src/components/auth/AuthProvider.tsx
- **Line**: 120

### Cookie session not restored

**Medium Severity**

<!-- DESCRIPTION START -->

When the Firebase client has no persisted user, `AuthProvider` clears `profile` and never calls `/api/auth/me`, even if the HTTP-only session cookie is still valid. The UI shows signed-out state and profile routes redirect to login while server auth may still succeed.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: a08f3c98-fd5e-439c-8bc6-079320bac7e5 -->

<!-- LOCATIONS START
src/components/auth/AuthProvider.tsx#L86-L92
LOCATIONS END -->
<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmExZDk0ZWRlLTA4ZmEtNDhmMC04NmEyLTIzMDUxZjk2ZWQxMCIsImVuY3J5cHRpb25LZXkiOiIyS3ZIVUZ4TGlPeUFQdzE4a1pxdWNwd2Q2c1R6Qno4ZjdmX2FaS0w5UHlrIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmExZDk0ZWRlLTA4ZmEtNDhmMC04NmEyLTIzMDUxZjk2ZWQxMCIsImVuY3J5cHRpb25LZXkiOiIyS3ZIVUZ4TGlPeUFQdzE4a1pxdWNwd2Q2c1R6Qno4ZjdmX2FaS0w5UHlrIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNDNlNzY4YzViM2RkZmJiNDZmMTVjMmM4YTYyYzE2NGY1NzlmZGU5YiIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 43e768c5b3ddfbb46f15c2c8a62c164f579fde9b. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 9

- **ID**: 3374197155
- **Path**: src/app/[locale]/profile/page.tsx
- **Line**: 21

### Login next path drops locale

**Medium Severity**

<!-- DESCRIPTION START -->

Redirects to login pass `next` values like `/profile` without a locale prefix. `LoginForm` uses `resolveSafeNextPath`, which only accepts `/en/...` or `/he/...`, so after sign-in users land on the locale home instead of the profile page they requested.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: 0dfc4d8a-8ecc-44da-99d3-3144a8fd7b49 -->

<!-- LOCATIONS START
src/app/[locale]/profile/page.tsx#L16-L20
src/app/[locale]/profile/edit/page.tsx#L27-L31
LOCATIONS END -->
<details>
<summary>Additional Locations (1)</summary>

- [`src/app/[locale]/profile/edit/page.tsx#L27-L31`](https://github.com/SoundGuyAI/ImprovCALIL/blob/43e768c5b3ddfbb46f15c2c8a62c164f579fde9b/src/app/[locale]/profile/edit/page.tsx#L27-L31)

</details>

<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjAxZjNiMjVlLThhM2ItNDRjMi1iM2JjLWY0MGIzMmM2ZTBkNiIsImVuY3J5cHRpb25LZXkiOiJaLUFhUGJEdmw2VDhLbGtMcF9yRTAxcllMeHNuRnhxdjQ2QXB4SEZIcEI4IiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjAxZjNiMjVlLThhM2ItNDRjMi1iM2JjLWY0MGIzMmM2ZTBkNiIsImVuY3J5cHRpb25LZXkiOiJaLUFhUGJEdmw2VDhLbGtMcF9yRTAxcllMeHNuRnhxdjQ2QXB4SEZIcEI4IiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNDNlNzY4YzViM2RkZmJiNDZmMTVjMmM4YTYyYzE2NGY1NzlmZGU5YiIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 43e768c5b3ddfbb46f15c2c8a62c164f579fde9b. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 10

- **ID**: 3374197162
- **Path**: src/app/[locale]/admin/page.tsx
- **Line**: 124

### Settings save hides failures

**Medium Severity**

<!-- DESCRIPTION START -->

The new system settings handler calls `updateSubmissionsConfig` but only logs errors to the console. If Firestore rejects the write (missing admin claim, permission denied, or offline client), the toggle still looks saved and no feedback is shown.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: 45989c01-8fc3-43a3-afaa-efec8fd2c081 -->

<!-- LOCATIONS START
src/app/[locale]/admin/page.tsx#L106-L115
LOCATIONS END -->
<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjgzYjE1ODg4LTlhZDQtNGI0NC04OGFjLTI2YTRmNWVkMGVhYiIsImVuY3J5cHRpb25LZXkiOiJ0cmxHS1dBbWpsblMwOTItUGJXUTJBN2g4N3dzN3RyN292WUlYNXFvVFNNIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjgzYjE1ODg4LTlhZDQtNGI0NC04OGFjLTI2YTRmNWVkMGVhYiIsImVuY3J5cHRpb25LZXkiOiJ0cmxHS1dBbWpsblMwOTItUGJXUTJBN2g4N3dzN3RyN292WUlYNXFvVFNNIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNDNlNzY4YzViM2RkZmJiNDZmMTVjMmM4YTYyYzE2NGY1NzlmZGU5YiIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 43e768c5b3ddfbb46f15c2c8a62c164f579fde9b. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 11

- **ID**: 3374231526
- **Path**: src/lib/auth/server.ts
- **Line**: 73

### Admin claims cleared without Firestore

**High Severity**

<!-- DESCRIPTION START -->

`syncAdminCustomClaim` only grants admin when the Firestore profile has `isAdmin` or the dev UID bypass applies. It ignores the verified ID/session token’s `isAdmin` claim, so admins provisioned only via Firebase custom claims lose `isAdmin` on sign-in and on each session profile load, breaking Firestore rules and client admin actions.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: f0ae94fe-2c74-48ed-9f8f-ffb6b983831a -->

<!-- LOCATIONS START
src/lib/auth/server.ts#L75-L79
src/lib/auth/server.ts#L284-L288
LOCATIONS END -->
<details>
<summary>Additional Locations (1)</summary>

- [`src/lib/auth/server.ts#L284-L288`](https://github.com/SoundGuyAI/ImprovCALIL/blob/4f56130b9e21467bac3229c683ab8ae13b6010e8/src/lib/auth/server.ts#L284-L288)

</details>

<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmFjYWY0ZDg5LTc1ZDktNGVmMC1iYmRhLWFkOTgyMTUxZWRhNSIsImVuY3J5cHRpb25LZXkiOiJGRWZjYl9pdEFRbVBvZFJzcUFKd1Zqc18xV19OTUV4YkJSNUd3ZDdGbmJjIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmFjYWY0ZDg5LTc1ZDktNGVmMC1iYmRhLWFkOTgyMTUxZWRhNSIsImVuY3J5cHRpb25LZXkiOiJGRWZjYl9pdEFRbVBvZFJzcUFKd1Zqc18xV19OTUV4YkJSNUd3ZDdGbmJjIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNGY1NjEzMGI5ZTIxNDY3YmFjMzIyOWM2ODNhYjhhZTEzYjYwMTBlOCIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 4f56130b9e21467bac3229c683ab8ae13b6010e8. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 12

- **ID**: 3374246131
- **Path**: src/lib/auth/server.ts
- **Line**: 241

<!-- CURSOR_AUTOMATION_ID: 04e2daec-03e4-4452-a690-a8ff569be0cb | RUN_ID: bc-152340df-daef-4a59-94ff-3f2fb8cd3577 -->

**Important — partial deletion + account resurrection**

`deleteCurrentAccount` commits the Firestore batch (orphan organizers/submissions, scrub profile to `accountStatus: "deleted"`) **before** `auth.deleteUser`.

**Concrete failure scenario:**

1. User confirms deletion → `batch.commit()` succeeds.
2. `auth.deleteUser(uid)` fails (Firebase outage, rate limit, transient error).
3. `DELETE /api/auth/account` returns 400; session cookie is **not** cleared (`route.ts` only clears cookie after full success).
4. User signs in again → `createSessionAndProfile` → `buildUserProfileWrite` always sets `accountStatus: "active"` (`profile.ts:187`), resurrecting a "deleted" account while organizers are already orphaned.

**Minimal fix:** delete the Auth user first; only mutate Firestore after Auth deletion succeeds. Also block `createSessionAndProfile` when existing profile has `accountStatus: "deleted"`.

---

## Comment 13

- **ID**: 3374246138
- **Path**: src/lib/auth/profile.ts
- **Line**: 187

<!-- CURSOR_AUTOMATION_ID: 04e2daec-03e4-4452-a690-a8ff569be0cb | RUN_ID: bc-152340df-daef-4a59-94ff-3f2fb8cd3577 -->

Related to account-deletion bug: `buildUserProfileWrite` unconditionally sets `accountStatus: "active"`, which reactivates a profile that was soft-deleted if `auth.deleteUser` failed after the Firestore batch committed. Preserve `existingProfile?.accountStatus === "deleted"` and reject session creation for deleted accounts.

---

## Comment 14

- **ID**: 3374482675
- **Path**: src/lib/auth/profile.ts
- **Line**: null

### Profile locale overwritten on sync

**Medium Severity**

<!-- DESCRIPTION START -->

`buildUserProfileWrite` always persists `locale` from the current page locale passed into session creation, instead of keeping an existing stored locale. `AuthProvider` calls that on Firebase auth restore, so a user’s profile locale can change when they open the site under another language.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: 1a617df7-06ee-4baf-90e6-a091eca8b736 -->

<!-- LOCATIONS START
src/lib/auth/profile.ts#L184-L185
src/components/auth/AuthProvider.tsx#L128-L129
LOCATIONS END -->
<details>
<summary>Additional Locations (1)</summary>

- [`src/components/auth/AuthProvider.tsx#L128-L129`](https://github.com/SoundGuyAI/ImprovCALIL/blob/6325c3cc254dc0ad3db939a389fe30d36f177299/src/components/auth/AuthProvider.tsx#L128-L129)

</details>

<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjZjYWFmZTM0LThlNTItNDdjNS1iYzRlLTMwNzk0ZGYyODFhZiIsImVuY3J5cHRpb25LZXkiOiJFdW1acmdycDkycjhfazI0SXBzcDN4YTZXWk1RaDh1bmpqd2lYRC1MQnpNIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjZjYWFmZTM0LThlNTItNDdjNS1iYzRlLTMwNzk0ZGYyODFhZiIsImVuY3J5cHRpb25LZXkiOiJFdW1acmdycDkycjhfazI0SXBzcDN4YTZXWk1RaDh1bmpqd2lYRC1MQnpNIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNjMyNWMzY2MyNTRkYzBhZDNkYjkzOWEzODlmZTMwZDM2ZjE3NzI5OSIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 6325c3cc254dc0ad3db939a389fe30d36f177299. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 15

- **ID**: 3374482684
- **Path**: src/components/auth/ProfileEditForm.tsx
- **Line**: 31

### Profile edit redirect missing locale

**Medium Severity**

<!-- DESCRIPTION START -->

After save or skip, `ProfileEditForm` navigates to the default `nextPath` of `/profile` via full-page assign. Routes live under `[locale]`, so that path omits the required locale prefix and can 404 or leave the localized app.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: 9f315a4a-80ba-45b6-bc0a-ac3165ffbb0a -->

<!-- LOCATIONS START
src/components/auth/ProfileEditForm.tsx#L29-L30
src/components/auth/ProfileEditForm.tsx#L104-L105
LOCATIONS END -->
<details>
<summary>Additional Locations (1)</summary>

- [`src/components/auth/ProfileEditForm.tsx#L104-L105`](https://github.com/SoundGuyAI/ImprovCALIL/blob/6325c3cc254dc0ad3db939a389fe30d36f177299/src/components/auth/ProfileEditForm.tsx#L104-L105)

</details>

<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmQ1YjU1OTU3LTdkN2ItNDU3My1hMTA1LWE4M2RkYTRkNTI5ZiIsImVuY3J5cHRpb25LZXkiOiJVaFZVX2R6aUM0T3c3M1ppZkhoVWE1WUlqUFpGRkFYQXJ0OWNJaFFwbmJBIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OmQ1YjU1OTU3LTdkN2ItNDU3My1hMTA1LWE4M2RkYTRkNTI5ZiIsImVuY3J5cHRpb25LZXkiOiJVaFZVX2R6aUM0T3c3M1ppZkhoVWE1WUlqUFpGRkFYQXJ0OWNJaFFwbmJBIiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNjMyNWMzY2MyNTRkYzBhZDNkYjkzOWEzODlmZTMwZDM2ZjE3NzI5OSIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 6325c3cc254dc0ad3db939a389fe30d36f177299. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---

## Comment 16

- **ID**: 3374482693
- **Path**: src/app/[locale]/admin/page.tsx
- **Line**: null

### Edit queue diff never appears

**Medium Severity**

<!-- DESCRIPTION START -->

The moderation diff UI only renders when `sub.targetDocumentId` is set, but public submit flows never populate that field (they only set flags like `isUpdateProposal` inside `data`). Edit-request submissions therefore never show the side-by-side comparison this tab adds.

<!-- DESCRIPTION END -->

<!-- BUGBOT_BUG_ID: 169cf22a-c449-4090-ace9-00b58ec62a64 -->

<!-- LOCATIONS START
src/app/[locale]/admin/page.tsx#L413-L414
LOCATIONS END -->
<div><a href="https://cursor.com/open?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9DVVJTT1IiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjU1OTc5NDQ4LTFjZTQtNDFlYS04OTE5LTU1ZjI5YTlhMjQ0YyIsImVuY3J5cHRpb25LZXkiOiJ2SU1RTlFjSVZwOHR4a0RQSHktT3dDZ0FjNzRkQVRHSmJlQlRyOWtUUFd3IiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCJ9fQ" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-cursor-light.png"><img alt="Fix in Cursor" width="115" height="28" src="https://cursor.com/assets/images/fix-in-cursor-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/agents?link=eyJ2ZXJzaW9uIjoxLCJ0eXBlIjoiQlVHQk9UX0ZJWF9JTl9XRUIiLCJkYXRhIjp7InJlZGlzS2V5IjoiYnVnYm90OjU1OTc5NDQ4LTFjZTQtNDFlYS04OTE5LTU1ZjI5YTlhMjQ0YyIsImVuY3J5cHRpb25LZXkiOiJ2SU1RTlFjSVZwOHR4a0RQSHktT3dDZ0FjNzRkQVRHSmJlQlRyOWtUUFd3IiwiYnJhbmNoIjoiZmVhdHVyZS9pbXBjYWwtNDIiLCJyZXBvT3duZXIiOiJTb3VuZEd1eUFJIiwicmVwb05hbWUiOiJJbXByb3ZDQUxJTCIsInByTnVtYmVyIjo0OCwiY29tbWl0U2hhIjoiNjMyNWMzY2MyNTRkYzBhZDNkYjkzOWEzODlmZTMwZDM2ZjE3NzI5OSIsInByb3ZpZGVyIjoiZ2l0aHViIn19" target="_blank" rel="noopener noreferrer"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/fix-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/fix-in-web-light.png"><img alt="Fix in Web" width="99" height="28" src="https://cursor.com/assets/images/fix-in-web-dark.png"></picture></a></div>

<sup>Reviewed by [Cursor Bugbot](https://cursor.com/bugbot) for commit 6325c3cc254dc0ad3db939a389fe30d36f177299. Configure [here](https://www.cursor.com/dashboard/bugbot).</sup>

---
