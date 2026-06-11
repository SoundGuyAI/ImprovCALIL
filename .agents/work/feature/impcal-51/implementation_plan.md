# Implementation Plan - Merge master and Verify PR #77

This plan outlines the steps to resolve unstaged/untracked changes on branch `feature/impcal-51`, pull/merge the base branch (`master`), resolve any conflicts, run code reviews and bugs checks using subagents, verify everything builds and passes, and push to remote.

## Proposed Steps

1. **Resolve and Commit Unstaged/Untracked Files**:
   - Check status and discard line-ending-only changes to `eslint.config.mjs`.
   - Stage and commit the screenshot/manifest updates on `feature/impcal-51`.
   - Push these resolved files to the remote branch `origin/feature/impcal-51`.
   
2. **Merge master into feature/impcal-51**:
   - Fetch the latest from `origin/master`.
   - Pull/merge `master` into the current `feature/impcal-51` branch.
   - If there are conflicts, resolve them carefully (using a developer subagent).

3. **Verify, Review, and Fix (Iterative Cycles)**:
   - Run the verification harness (`node scripts/verify-harness.js`) iteratively.
   - Run two concurrent reviewer subagents:
     - **Subagent A (Code Reviewer)**: Audits code for modern aesthetics, premium UX, and localization correctness.
     - **Subagent B (Bug Hunter)**: Finds functional regressions, SSR, auth, or logic issues.
   - **Rule**: Whenever a developer subagent is invoked (including during conflict resolution, bug fixing, or addressing PR comments), always run the verification harness and the two reviewer subagents to verify the fixes. Repeat this cycle (Verify -> Review -> Fix -> Re-Verify -> Re-Review) iteratively until both reviewers approve the changes and the harness passes.


4. **Push, Monitor CI/CD, and Address PR Comments**:
   - Stage, commit the merge (and any fixes), and push to the remote branch.
   - Monitor remote checks using GitHub API (with the `github` MCP server) until all runners and status checks have fully finished.
   - Retrieve and review all PR comments and reviews (`get_pull_request_comments`, `get_pull_request_reviews`) to ensure no new issues or comments are raised.
   - If there are new comments or check failures:
     - Invoke developer subagents to fix them.
     - Verify locally, commit, push, and restart the monitoring/comment review process.
   - Repeat this cycle iteratively until all status checks are fully green and all comment feedback is resolved/addressed. Only then proceed to step 5.


5. **Start dev3 Server and Notify on Telegram**:
   - Run `npm run dev3` to start the Next.js development server on port 3002.
   - Use the Telegram notification script at `node c:/UnityProj/ImprovCALIL/.agents/skills/work-on-card/scripts/notify.js` to alert the user that the dev3 server is running and the PR is ready to check.

## Verification Plan

### Automated Tests
- Run `node scripts/verify-harness.js` which performs Prettier, ESLint, TypeScript check, unit tests, build, and Playwright E2E tests.

### Manual Verification
- Review changes, review subagent logs, verify that status checks pass, and verify that the dev3 server starts up and is accessible on port 3002.

