---
name: pull-merge-this-PR
description: Check workspace status, merge target branch, resolve conflicts using subagents, verify, run code review/bug hunt subagents, commit/push, read PR comments, fix bugs, reply to PR comments with confirmation, create Linear cards for unresolved bugs, and babysit status checks using GitHub & Linear MCP servers. Avoids terminal permission prompts.
metadata:
  author: Antigravity
  version: "1.4.0"
---

# Pull, Merge, Resolve, Verify, and Babysit PR Checks (pull-merge-this-PR)

You are an autonomous coding agent supervisor with **ABSOLUTE GOAL INITIATIVE**. Your task is to orchestrate and execute the complete integration and validation workflow for any feature branch or Pull Request associated with a task/Linear card.

To comply with permissions and sandboxing, **you must use MCP tools and the `schedule` tool** instead of local terminal commands/scripts wherever possible.

---

## 📋 Pre-requisites & Inputs
Before starting, identify the context:
- **Feature Branch**: e.g., `feature/impcal-51` (defaults to current branch if unspecified)
- **Target/Base Branch**: e.g., `master` or `main` (defaults to the PR's target branch or `master`)
- **PR Number**: The GitHub Pull Request number (must be retrieved/detected)
- **Repository**: `SoundGuyAI/ImprovCALIL` (owner: `SoundGuyAI`, repo: `ImprovCALIL`)

---

## 🚀 Step 1: Pre-flight Check & Workspace Verification
1. Run `git status` via terminal command to check for any unstaged, modified, or untracked changes in the current workspace directory.
2. If there are any unstaged/modified/untracked files:
   - **Do NOT** proceed to merge directly.
   - Define and invoke a developer subagent to resolve, format, test, stage, commit, and push these changes to the remote branch of the PR.

---

## 🔄 Step 2: Merge the Base Branch
1. Determine the target/base branch (e.g. `master`).
2. Fetch and merge the target/base branch into the current feature branch:
   ```bash
   git fetch origin <target-branch>
   git merge origin/<target-branch>
   ```
3. If the merge completes cleanly without conflicts, skip to **Step 4**.

---

## ⚡ Step 3: Resolve Merge Conflicts
1. If merge conflicts arise:
   - Identify the conflicting files.
   - Define and call a developer subagent specifically tasked to resolve the conflicts cleanly.
   - Instruct the subagent to preserve both the feature logic in the branch and the new changes from the base branch.
   - Once resolved, stage the conflict-free files.

---

## 🧪 Step 4: Iterative Local Verification
1. Run local verification/tests iteratively to ensure everything builds, format passes, and all tests run successfully:
   ```bash
   node scripts/verify-harness.js
   ```
2. If any verification checks (lint, typescript check, unit tests, E2E tests, or build) fail:
   - Call a developer subagent to fix the errors.
   - Re-run `node scripts/verify-harness.js`.
   - Repeat until the verification harness passes cleanly.

---

## 🕵️ Step 5: Code Review & Bug Hunting Cycles
1. Launch two concurrent subagents:
   - **Subagent A (Code Reviewer)**: Tasks include reviewing all resolved conflicts and new changes to ensure proper architecture, internationalization, styling, and code quality.
   - **Subagent B (Bug Hunter)**: Tasks include searching for edge cases, SSR/auth errors, or logic regressions.
2. If either subagent reports issues or suggests improvements:
   - Invoke developer subagents to fix them.
   - Run the local verification harness (`node scripts/verify-harness.js`) again.
   - Run both reviewers again on the new changes.
   - Repeat this cycle iteratively until all reviews are clear and approved.

---

## 💬 Step 6: Read PR Comments, Resolve Feedback, & Reply
A successful PR requires addressing all developer/reviewer feedback. You must read all reviews and comments on the Pull Request, resolve the bugs/issues, and reply to inform the reviewer.

1. **Fetch PR Comments and Reviews**:
   Invoke the GitHub MCP tools:
   - `get_pull_request_comments`: To get all line-level review comments.
   - `get_pull_request_reviews`: To get all review bodies and overall statuses.
2. **Compile feedback checklist**: Identify all bugs, requested changes, or improvements mentioned in the comments.
3. **Fix the Bugs**:
   - For each bug or requested change, invoke a developer subagent to make the fix.
   - Run local verification (`node scripts/verify-harness.js`) to ensure no regressions.
4. **Reply to Comments**:
   - For every fixed issue/comment, reply to confirm it has been resolved.
   - Use the `add_issue_comment` MCP tool to comment on the PR conversation timeline, summarizing the resolved items clearly (e.g., "Resolved: Fixed the language switcher SSR bug mentioned in review...").
   - Alternatively, if thread-level replies are required and terminal command permissions are granted, you may run `gh api` or `gh pr comment` to reply directly to specific comment threads.
5. **Handle Unresolved/Complex Bugs**:
   - If there are bugs or issues that cannot be resolved in the scope of this PR (e.g. requires external credentials, is a separate feature request, is too complex, or requires clarification from the user after attempting a fix):
     - **You must create a new Linear issue** for each unresolved item.
     - Call the `linear-mcp-server` tool `save_issue`:
       - **title**: A descriptive title of the unresolved bug (e.g., "[IMPCAL] Bug name - Ported Language Switcher")
       - **team**: The Linear team name or ID (e.g., `IMPCAL` or retrieve it using `list_teams`).
       - **description**: Detailed markdown describing the bug, why it couldn't be resolved now, and a reference/link to the PR comment where it was raised.
6. **Commit and Push resolved issues**:
   - Stage and commit all fixed changes.
   - Push to the remote branch:
     ```bash
     git push origin <feature-branch>
     ```

---

## 📤 Step 7: Final Commit and Push
1. After all merge conflicts, reviews, and PR comment feedback are addressed:
   - Commit the final merge:
     ```bash
     git commit -m "Merge <target-branch> into <feature-branch>, resolve conflicts, and address PR comments"
     ```
   - Push changes back to the remote PR branch:
     ```bash
     git push origin <feature-branch>
     ```
2. Verify that the push succeeds.

---

## 🕒 Step 8: Babysit CI/CD Status Checks (Pure MCP & Scheduler)
To avoid terminal command execution prompts, **do not run local shell scripts to poll checks**. Instead, use the GitHub MCP server and the system's one-shot timer (`schedule` tool).

1. **Retrieve the PR Status** using the GitHub MCP tool `get_pull_request_status`:
   - **ServerName**: `github`
   - **ToolName**: `get_pull_request_status`
   - **Arguments**:
     ```json
     {
       "owner": "SoundGuyAI",
       "repo": "ImprovCALIL",
       "pull_number": <pr_number>
     }
     ```

2. **Parse the Status Check Rollup**:
   - **Pending/In Progress**: If checks are not yet complete, schedule a reminder to check again in **60 seconds** using the `schedule` tool:
     - **DurationSeconds**: `60`
     - **Prompt**: `Status checks for PR #<pr_number> are still running. Call get_pull_request_status to check again.`
     - Go idle and wait for the notification.
   - **Failure**: If any check fails:
     - Investigate the failures.
     - Call a developer subagent to fix the root cause.
     - Verify locally, commit, push, and restart the Babysitting process (Step 8.1).
   - **Success**: If all checks are `COMPLETED` and have a `SUCCESS` conclusion, exit successfully.
