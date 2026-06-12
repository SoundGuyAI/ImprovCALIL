---
name: pull-merge-this-PR
description: Check workspace status, merge target branch, resolve conflicts using subagents, verify, run code review/bug hunt subagents, commit/push, read PR comments, fix bugs, reply to PR comments with confirmation, create Linear cards for unresolved bugs, and babysit status checks using GitHub & Linear MCP servers. Avoids terminal permission prompts.
metadata:
  author: Antigravity
  version: "1.6.0"
---

# Pull, Merge, Resolve, Verify, and Babysit PR Checks (pull-merge-this-PR)

You are an autonomous coding agent supervisor with **ABSOLUTE GOAL INITIATIVE**. Your task is to orchestrate and execute the complete integration and validation workflow for any feature branch or Pull Request associated with a task/Linear card.

To comply with permissions and sandboxing, **you must use MCP tools and the `schedule` tool** instead of local terminal commands/scripts wherever possible.

---

## 📋 Pre-requisites, Inputs & Linear Card Context
Before starting, identify the context:
- **Feature Branch**: e.g., `feature/impcal-51` (defaults to current branch if unspecified)
- **Target/Base Branch**: e.g., `master` or `main` (defaults to the PR's target branch or `master`/`main`)
- **PR Number**: The GitHub Pull Request number (must be retrieved/detected)
- **Repository**: `SoundGuyAI/ImprovCALIL` or `SoundGuyAI/ImprovDashboard` (owner: `SoundGuyAI`, repo: `<repo>`)
- **Linear Issue ID**: Extracted from the branch name (e.g., `IMPCAL-51`).

### 🔑 Retrieve Original Feature Requirements
Before making any changes or resolving conflicts:
1. Extract the Linear Issue ID from the branch name.
2. Call the `linear-mcp-server` tool `get_issue` with the issue ID:
   - **ServerName**: `linear-mcp-server`
   - **ToolName**: `get_issue`
   - **Arguments**: `{ "id": "<issue_id>" }`
3. Read the description, acceptance criteria, and notes inside the Linear card.
4. **All subsequent changes (conflict resolutions, bug fixes, code updates, and reviewer responses) MUST respect, preserve, and align with these original feature requirements.**

---

## 🚀 Step 1: Pre-flight Check & Workspace Verification
1. Run `git status` via terminal command to check for any unstaged, modified, or untracked changes in the current workspace directory.
2. If there are any unstaged/modified/untracked files:
   - **Do NOT** proceed to merge directly.
   - Define and invoke a developer subagent to resolve, format, and stage these changes.
   - **CRITICAL**: Before pushing these changes, you must run the local verification harness (`node scripts/verify-harness.js`) and launch both reviewer subagents (Code Reviewer and Bug Hunter).
   - Only after both reviewers approve and the harness passes, commit and push these pre-flight changes to the remote branch of the PR.

---

## 🔄 Step 2: Merge the Base Branch
1. Determine the target/base branch (e.g. `master` or `main`).
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
   - **CRITICAL**: Instruct the subagent to preserve the core feature logic of the branch as requested in the Linear card description, while integrating new changes from the base branch. Do not let base branch changes overwrite or discard the feature's custom features/logic.
   - Once resolved, stage the conflict-free files.
   - **CRITICAL**: **Do NOT commit or push yet!** All changes must undergo the verification and review cycle (Step 5) locally first.

---

## 💬 Step 4: Read PR Comments & Resolve Feedback
Read all reviews and comments on the Pull Request, resolve the bugs/issues locally first. **Do not push yet.**

1. **Fetch PR Comments and Reviews**:
   Invoke the GitHub MCP tools:
   - `get_pull_request_comments`: To get all line-level review comments.
   - `get_pull_request_reviews`: To get all review bodies and overall statuses.
2. **Compile feedback checklist**: Identify all bugs, requested changes, or improvements mentioned in the comments.
3. **Fix the Bugs locally**:
   - For each bug or requested change, invoke a developer subagent to make the fix.
   - Ensure the fixes align with the original requirements in the Linear card.
4. **Handle Unresolved/Complex Bugs**:
   - If there are bugs or issues that cannot be resolved in the scope of this PR (e.g. requires external credentials, is a separate feature request, is too complex):
     - **You must create a new Linear issue** for each unresolved item.
     - Call the `linear-mcp-server` tool `save_issue`:
       - **title**: A descriptive title of the unresolved bug (e.g., "[IMPCAL] Bug name - Ported Language Switcher")
       - **team**: The Linear team name or ID (e.g., `IMPCAL` or retrieve it using `list_teams`).
       - **description**: Detailed markdown describing the bug, why it couldn't be resolved now, and a reference/link to the PR comment where it was raised.

## ⚠️ Step 5: Iterative Local Verification & Review Cycle (Harness + Reviewers)
**CRITICAL CONSTRAINT**: Under no circumstances should you run any `git push` command before this step has completed with all-green verification and approval from both reviewers. Pushing before verification is completely forbidden because it wastes CI runner quota and money if the build fails. You must run the `verify-harness.js` script and BOTH reviewer subagents (Code Reviewer and Bug Hunter) BEFORE pushing. Running verification or reviewers *after* pushing is a serious violation.

1. **Run Local Verification**:
   Run the local verification harness to ensure the project builds, format passes, and all tests run successfully:
   ```bash
   node scripts/verify-harness.js
   ```
   If it fails:
   - Call a developer subagent to fix the errors.
   - Re-run `node scripts/verify-harness.js`.
   - Repeat until the harness passes cleanly.

2. **Run Reviewers**:
   Once the harness passes, launch two concurrent subagents:
   - **Subagent A (Code Reviewer)**: Tasks include reviewing all resolved conflicts and new changes to ensure proper architecture, internationalization, styling, and code quality.
   - **Subagent B (Bug Hunter)**: Tasks include searching for edge cases, SSR/auth errors, or logic regressions.

3. **Iterate if Issues Found (Strict Reviewer-Fix Loop)**:
   - If either reviewer identifies any new bugs, quality issues, or regressions:
     - Invoke a developer subagent to fix them.
     - **REQUIRED**: After the developer subagent completes its fixes, you **MUST** run the local verification harness (`node scripts/verify-harness.js`) again, and then launch both reviewer subagents (Code Reviewer and Bug Hunter) to review the new changes.
     - **Do NOT bypass or skip re-running the reviewers after developer fixes.** Every fix must be audited by both reviewers.
     - **CRITICAL RULE**: You MUST call the two reviewer subagents (one for code review and one for bug finding) after EVERY single developer subagent run, without exception.
     - **Repeat this loop until both reviewers explicitly approve the changes and the harness is 100% green.**

---

## 📤 Step 6: Commit, Push, and Reply to PR Comments
Once and only once the local verification and review cycle (Step 5) is completely green and approved:

1. **Commit and Push**:
   - Stage all resolved and fixed files.
   - Commit the changes:
     ```bash
     git commit -m "Merge <target-branch> into <feature-branch>, resolve conflicts, and address PR comments"
     ```
   - Push to the remote branch (remembering to bypass the credential lock if needed):
     ```bash
     git push origin <feature-branch>
     ```
2. **Reply to Comments**:
   - For every fixed issue/comment, reply to confirm it has been resolved.
   - Use the `add_issue_comment` MCP tool to comment on the PR conversation timeline, summarizing the resolved items clearly (e.g., "Resolved: Fixed the language switcher SSR bug mentioned in review...").
   - Alternatively, if thread-level replies are required and terminal command permissions are granted, you may run `gh api` or `gh pr comment` to reply directly to specific comment threads.

---

## 🕒 Step 7: Babysit CI/CD Status Checks & Check for New PR Comments (Pure MCP & Scheduler)
To avoid terminal command execution prompts, **do not run local shell scripts to poll checks**. Instead, use the GitHub MCP server and the system's one-shot timer (`schedule` tool).

1. **Retrieve the PR Status** using the GitHub MCP tool `get_pull_request_status`:
   - **ServerName**: `github`
   - **ToolName**: `get_pull_request_status`
   - **Arguments**:
     ```json
     {
       "owner": "SoundGuyAI",
       "repo": "<repo>",
       "pull_number": <pr_number>
     }
     ```

2. **Parse the Status Check Rollup & Run Status**:
   - **Pending/In Progress**: If any status checks or runners are not yet complete, schedule a reminder to check again in **60 seconds** using the `schedule` tool:
     - **DurationSeconds**: `60`
     - **Prompt**: `Status checks for PR #<pr_number> are still running. Call get_pull_request_status to check again.`
     - Go idle and wait for the notification. Do not start the dev server or notify the user yet.
   - **Failure**: If any check fails:
     - Investigate the failures.
     - Call a developer subagent to fix the root cause.
     - **REQUIRED**: Run the local verification and reviewer cycle (Step 5) to completion before pushing again.
     - Push the updates and restart the Babysitting process (Step 7.1).
   - **Success (Checks Green)**: If all status checks and runners have completed with a success conclusion, proceed to Step 7.3.

3. **Check for New Comments and Reviews**:
   - You must wait until ALL checks and runners have completely finished executing (not just passed initially, but reached a terminal completion state).
   - Only *after* all runners have finished, fetch the latest PR comments and reviews using GitHub MCP tools `get_pull_request_comments` and `get_pull_request_reviews`.
   - Carefully review them to ensure no new issues, bugs, or requests have been raised by reviewers while the runners were executing or since your last push.
   - If there are new comments or issues:
     - Go back to **Step 4** (Read PR Comments & Resolve Feedback) to resolve them locally.
     - **Step 5** (Iterative Local Verification & Review Cycle) must be fully executed, verified, and approved before pushing again.
   - If there are no new comments, all previous feedback has been addressed, and all checks are green, then the integration is complete.

---

## 🚀 Step 8: Finalize and Notify
Once the PR is completely clean, all checks have passed, and no new comments exist:
1. Start the dev server locally using the terminal (e.g., `npm run dev` or the specified dev command like `npm run dev3`).
2. Send a message using the Telegram tool (if available) or output to the user indicating they should go check the dev server.
