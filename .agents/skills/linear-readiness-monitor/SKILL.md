---
name: linear-readiness-monitor
description: >-
  Reviews Linear cards in Idea, Backlog, or Todo status for AI-agent work readiness,
  rewriting ready issues into structured agent tasks and marking incomplete issues
  as HUMAN with clarification comments. Supports IMPDASH and IMPCAL.
---

# Linear Agent-Readiness Monitor Workflow

This skill automates the process of auditing, reviewing, and mutating Linear cards to prepare them for AI-agent execution. It supports both **Improv Dashboard (`IMPDASH`)** and **Israeli Improv Calendar (`IMPCAL`)**.

## 1. Context Gathering

Before analyzing or mutating any cards, read the repository context:
-   **Dashboard (IMPDASH)**: Read `AGENTS.md`, `WORKFLOW.md`, `docs/IMPROV_DASHBOARD.md`, `docs/database_schema.md`, `docs/oded-todos.md`, and any plan docs under `docs/plans/`.
-   **Calendar (IMPCAL)**: Read `AGENTS.md`, `WORKFLOW.md`, and matching schema/architecture documents under `docs/` in the `C:\UnityProj\ImprovCALIL` workspace.
-   **Memory**: Always read the automation memory file at `C:\Users\Oded\.codex\automations\impdash-linear-agent-readiness-monitor\memory.md` to see previous runs.

## 2. Run Preflight Queries

Execute the generic preflight script with escalated permissions to retrieve candidate issues (Idea, Backlog, or Todo status; lacking both `Agent-Ready` and `HUMAN` labels).

For **Improv Dashboard (IMPDASH)**:
```powershell
powershell -ExecutionPolicy Bypass -File C:\UnityProj\symphony\scripts\linear-readiness-preflight.ps1 -TeamKey IMPDASH -OutDir C:\UnityProj\ImprovDashboard\.linear-readiness-preflight
```

For **Israeli Improv Calendar (IMPCAL)**:
```powershell
powershell -ExecutionPolicy Bypass -File C:\UnityProj\symphony\scripts\linear-readiness-preflight.ps1 -TeamKey IMPCAL -OutDir C:\UnityProj\ImprovCALIL\.linear-readiness-preflight
```

## 3. Retrieve Candidate Details

To avoid network/transport hangs from the generic `linear-graphql.ps1` script or the Linear MCP server, write and run a targeted PowerShell script in the active project directory. This script should perform `Invoke-RestMethod` calls using the token loaded from `C:\UnityProj\symphony\.env` and the embedded GraphQL query:

```graphql
query IssueDetails($id: String!) {
  issue(id: $id) {
    id
    identifier
    title
    description
    url
    state { name type }
    labels { nodes { id name } }
    parent { id identifier title description url state { name type } labels { nodes { id name } } }
    comments(first: 50) { nodes { id body createdAt user { name } } }
  }
}
```

## 4. Determine Readiness and Mutate Issues

### Readiness Rules

*   **Agent-Ready**: Mark as ready **ONLY** when a coding agent can implement the task without inventing major product, design, or database schema decisions. The rewritten description must start exactly with `## Agent task` and include:
    *   `## Desired behavior`
    *   `## Product/model guidance`
    *   `## Implementation guidance`
    *   `## Acceptance criteria`
*   **HUMAN**: Mark as human when exact copy, screen flow, database schema, payment, business models, visibility, or broad epic slicing choices are still required. Add **one concise clarification comment** listing the open questions.

### Mutation Execution

Run a targeted PowerShell script utilizing `Invoke-RestMethod` with the `LINEAR_API_KEY` from `C:\UnityProj\symphony\.env` to apply the updates:
-   **Mutation for Issue Update**:
    ```graphql
    mutation IssueUpdate($id: String!, $description: String!, $labelIds: [String!]) {
      issueUpdate(id: $id, input: { description: $description, labelIds: $labelIds }) { success }
    }
    ```
-   **Mutation for Creating Comments** (on HUMAN issues):
    ```graphql
    mutation CommentCreate($issueId: String!, $body: String!) {
      commentCreate(input: { issueId: $issueId, body: $body }) { success }
    }
    ```

*Note: Use the UUID for mutations. Retrieve Label IDs from the preflight summary output (`agentReadyId` and `humanId` fields).*

## 5. Verify & Document

1.  Re-run the candidate details query to confirm that the description, labels, and comments were successfully modified.
2.  Append a concise summary of the run to the automation memory file at `C:\Users\Oded\.codex\automations\impdash-linear-agent-readiness-monitor\memory.md` showing:
    *   The run timestamp.
    *   The processed candidate issue numbers (categorized by Agent-Ready vs HUMAN).
    *   Any skipped issues or errors encountered.
