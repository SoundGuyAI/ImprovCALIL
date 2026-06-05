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
- Before running verification, check whether Node dependencies are installed in the current issue workspace/worktree. If local `node_modules` is missing, package binaries are missing, imports such as `vitest/config` cannot be resolved, or Node appears to be falling back to a parent directory's `node_modules`, run `npm install` in the issue workspace first, then rerun verification. CI-style checks require workspace-local npm dependencies, so do not report a code/test failure until dependencies have been installed successfully or installation itself is clearly blocked.

## 📸 Telegram Notifications & Human Attention Requests
If you require manual input, approval, hit a sandbox restriction, or cannot proceed due to blocked dependencies/credentials:
- Trigger a Telegram notification to the developer by executing:
  `node c:/UnityProj/symphony/scripts/notify.js "[{{ agent_name }}] requires attention on {{ issue.identifier }}: <State the blocker or help request clearly>"`
- Do not loop or consume tokens waiting. Output a clear summary of what you tried and state that you are waiting for human attention.

