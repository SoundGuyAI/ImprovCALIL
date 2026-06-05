---
tracker:
  kind: linear
  team_key: IMPCAL
  api_key: $LINEAR_API_KEY
  active_states:
    - Agent Todo
    - In Progress
  terminal_states:
    - Closed
    - Cancelled
    - Canceled
    - Duplicate
    - Done
polling:
  interval_ms: 30000
workspace:
  root: c:\UnityProj\symphony_workspaces
hooks:
  after_create: git -C C:\UnityProj\ImprovCALIL  fetch origin main && git -C C:\UnityProj\ImprovCALIL  worktree prune && git -C C:\UnityProj\ImprovCALIL  worktree add %CD% origin/main --detach --force && copy /y C:\UnityProj\ImprovCALIL\.env.local .env.local
  before_remove: cd C:\UnityProj && git -C C:\UnityProj\ImprovCALIL  worktree remove --force %CD%
  timeout_ms: 60000
agent:
  max_concurrent_agents: 5
  max_turns: 20
codex:
  command: agy
  approval_policy: auto-approve
  thread_sandbox: enabled
  turn_sandbox_policy: restrictive
  stall_timeout_ms: 300000
---

You are working on an issue from Linear.

Ticket Reference: {{ issue.identifier }}
Title: {{ issue.title }}
Description:
{{ issue.description }}

Please analyze the codebase, implement a complete solution resolving the issue, run automated verification to ensure code correctness, and write back standard exit signals!

## Preflight & Context Gathering Checks

- Note that when starting a new worktree, the `.env.local` file is automatically copied from the source folder (`C:\UnityProj\ImprovCALIL`) into the worktree root to support running proper E2E tests.
- FIRST check existing comments on the Linear issue (using your Linear MCP `list_comments` tool) to review what previous agents tried, their findings, and why they succeeded or failed. Build upon their insights.
- Linear credentials for the Symphony orchestrator are stored in `..\symphony\.env` as `LINEAR_API_KEY`. Use the variable reference already configured above; never print or commit the secret value.
- Check if a local or remote Git branch already exists for this issue (e.g. `feature/{{ issue.identifier }}` or `bugfix/{{ issue.identifier }}`). If so, switch to/use it immediately. Otherwise, create a new branch named `feature/{{ issue.identifier }}` in lowercase (e.g., `git checkout -b feature/impcal-74`).
- Check if an open or merged Pull Request (PR) already exists for this branch/issue (using git, GitHub CLI `gh pr list`, or web tools).
- Before running verification, check whether Node dependencies are installed in the current issue workspace/worktree. If local `node_modules` is missing, package binaries are missing, imports such as `vitest/config` cannot be resolved, or Node appears to be falling back to a parent directory's `node_modules`, run `npm install` in the issue workspace first, then rerun verification. CI-style checks require workspace-local npm dependencies, so do not report a code/test failure until dependencies have been installed successfully or installation itself is clearly blocked.
- If an open PR already exists:
  - Review the current progress, code changes, and review feedback of the existing PR.
  - If additional fixes are needed, commit and push them directly to the existing branch to update the open PR.
  - If the PR is already complete and successfully addresses the issue, confirm its URL and status, and report completion immediately without making duplicate commits or PRs.
- If no PR exists:
  - Once your changes are verified and complete, stage (`git add .`) and commit them with a descriptive message.
  - Push the branch to the remote origin (`git push -u origin <branch_name>`).
  - Create a new draft Pull Request using the GitHub CLI:
    `gh pr create --title "[{{ issue.identifier }}] {{ issue.title }}" --body "Resolves {{ issue.url }}" --draft`


## 📸 Telegram Notifications & Human Attention Requests
If you require manual input, approval, hit a sandbox restriction, or cannot proceed due to blocked dependencies/credentials:
- Trigger a Telegram notification to the developer by executing:
  `node c:/UnityProj/symphony/scripts/notify.js "[{{ agent_name }}] requires attention on {{ issue.identifier }}: <State the blocker or help request clearly>"`
- Do not loop or consume tokens waiting. Output a clear summary of what you tried and state that you are waiting for human attention.

