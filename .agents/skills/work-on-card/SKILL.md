---
name: work-on-card
description: Works on a card in the impcal repo, starts a git worktree, creates a branch off main, works on the task until completion, test, verify, fix issues, commits, pushes, opens a PR, and notifies the user on Telegram if done, failed, or if needs anything from the user.
metadata:
  author: SoundGuyAI
  version: "1.0.0"
---

# Work on Card (ImprovCALIL)

Automate the lifecycle of picking up, implementing, verifying, committing, and notifying the developer for a card from the `ImprovCALIL` (`impcal`) repository.

This skill automates setting up detached Git worktrees, handling feature branch routing, local verification, draft PR creation via GitHub CLI, and developer notifications via Telegram.

When selecting candidate cards to implement, ensure they are in the **Agent Todo** state (not the general unstarted "Todo" state).

---

## 🛠️ Step 1: Environment Setup & Pre-requisites

Ensure the following are set up on the host system:
1. **Telegram Config**: The Telegram Bot credentials should be configured in `C:/UnityProj/symphony/.env` or inside your current environment.
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
2. **GitHub CLI (`gh`)**: Ensure the `gh` tool is installed and authenticated (`gh auth status`) to allow creating draft Pull Requests automatically.

---

## 🚀 Step 2: Initialize Card Workspace (Setup Phase)

To start working on a ticket, invoke the setup script with the Ticket Identifier (e.g., `IMPCAL-74`).

Run the setup command from the repository's skill folder:
```bash
node c:/UnityProj/ImprovCALIL/.agents/skills/work-on-card/scripts/setup.js <CARD_ID>
```

### What the Setup Phase does:
1. Resolves the card workspace `C:/UnityProj/ImprovCALIL`.
2. Creates/updates a dedicated Git worktree under your configured worktree directory (e.g., `<home>/.gemini/antigravity/worktrees/<CARD_ID>`) to ensure the agent has permission access.
3. Copies the repository's `.env.local` to the new worktree root.
4. Checks out/creates the branch `feature/<card-id-lowercase>`.
5. Runs `npm install` inside the worktree workspace to ensure dependencies are resolved.

---

## 💻 Step 3: Implement the Task (Development Phase)

Once setup completes, **switch your working directory context** to the new worktree workspace:
```bash
# Example (check the setup script output for the exact path):
cd <path_to_worktree>/<CARD_ID>
```

Work on the codebase inside the worktree to implement the ticket's requested changes. Follow project conventions, maintain documentation integrity, and make sure that you write appropriate tests (unit, e2e, etc.) to cover your changes.

**Critical Workflow & Persistence Rules:**
1. **Issue Tracking**: When you begin work, use the `linear-mcp-server` to transition the ticket status to **In Progress**.
2. **Agent State Persistence**: As mandated by `AGENTS.md`, you MUST save your todo list and implementation plan in an `.agents/work/<branch_name>/` folder inside your worktree workspace (the setup script creates this for you). These files must be checked in with your branch so another agent can seamlessly take over if you stop.
3. **Review `WORKFLOW.md`**: Read and adhere to the project's `WORKFLOW.md`. Pay special attention to the **Screenshot & Verification Policies**.
4. **Screenshot Evidence**: If your changes involve UI or E2E testing, you must capture visual verification. Save screenshots under `.screenshots/<CARD_ID>/attempt-<number>/` using the helper at `e2e/helpers/screenshots.ts` (e.g., `captureScreenshot(page, filename)`). **Make sure to add and commit these screenshot files yourself** alongside your other changes.

---

## 📸 Step 4: Request Developer Attention / Notify Blockers

If you get stuck, hit a sandbox restriction, require credentials, or need clarification from the developer:
1. Trigger an attention alert via Telegram by running:
   ```bash
   node c:/UnityProj/ImprovCALIL/.agents/skills/work-on-card/scripts/notify.js "⚠️ [work-on-card] Needs attention on <CARD_ID>: <Explain the blocker or request clearly>"
   ```
2. Report a clear summary of your progress and halt execution. Do not waste tokens looping.

---

## 🏁 Step 5: Test, Verify, & Submit (Submission Phase)

Once implementation is complete, run the submit script to verify, format, commit, push, create a draft PR, and notify the developer on Telegram.

Run the submit script from the repository's skill directory:
```bash
node c:/UnityProj/ImprovCALIL/.agents/skills/work-on-card/scripts/submit.js <CARD_ID> --msg "<COMMIT_MESSAGE>" --title "<PR_TITLE>" --url "<LINEAR_URL>"
```

### Parameters:
- `<CARD_ID>`: (Required) e.g., `IMPCAL-74`
- `--msg` / `-m`: (Required) The Git commit message (e.g., `"fix: solve SSR auth page compilation"`)
- `--title`: (Required) The title for the GitHub Pull Request (e.g., `"Fix SSR Auth Page"`)
- `--url`: (Optional) The Linear ticket URL to link in the PR description

### What the Submission Phase does:
1. Executes the workspace-specific verification suite: `node scripts/verify-harness.js`
2. Formats modified files using Prettier/Formatting configurations.
3. Stages and commits changes using standard commit formats.
4. Pushes the branch to remote origin.
5. Invokes `gh pr create` to open a draft PR linking back to the ticket URL.
6. Dispatches a Telegram notification summarizing completion status along with a link to the PR/branch.
7. If verification or pushing fails, it automatically notifies the developer on Telegram with details of the failure.
