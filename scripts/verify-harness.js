/**
 * ImprovIL Agent Verification Harness
 *
 * This script automates the full verification suite (Prettier -> Lint -> TypeScript -> Unit Test -> Build -> E2E)
 * as prescribed in the project guidelines. If a step fails, it captures the output,
 * maps the failure to the appropriate architectural `.cursor/rules/*.mdc` rule, and
 * generates an agent-legible markdown/JSON error report in `.agents/reports/`.
 *
 * Usage: node scripts/verify-harness.js
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");

const REPORT_DIR = path.join(__dirname, "..", ".agents", "reports");
const REPORT_JSON = path.join(REPORT_DIR, "failures.json");
const REPORT_MD = path.join(REPORT_DIR, "failures.md");

// ANSI color stripping helper
function stripAnsi(str) {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}

// Dynamic port finder for E2E testing
async function getAvailablePort(start, end) {
  for (let port = start; port <= end; port++) {
    const available = await new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close(() => resolve(true));
      });
      server.listen(port, "127.0.0.1");
    });
    if (available) return port;
  }
  throw new Error(`No available ports found in range ${start}-${end}`);
}

// Detailed rule mapping configuration
const RULE_MAPPING = {
  "Prettier Formatting Check": {
    rules: [
      {
        file: ".cursor/rules/code-style-consistency.mdc",
        purpose: "Prettier formatting guidelines for code style and consistency.",
      },
    ],
    description: "Validates code style formatting across the repository.",
    suggestions: [
      "Run `npm run format` (which executes `prettier --write .`) to automatically format all files in the repository.",
      "Check your editor configuration to ensure format-on-save is enabled using Prettier.",
    ],
  },
  "ESLint Code Linting": {
    rules: [
      {
        file: ".cursor/rules/javascript-typescript-code-quality.mdc",
        purpose: "Syntax standard and ESLint patterns.",
      },
      {
        file: ".cursor/rules/typescript-code-convention.mdc",
        purpose: "TypeScript coding conventions.",
      },
      {
        file: "AGENTS.md",
        purpose:
          "Harness guidelines on dynamic styling, non-hardcoded strings, and Firestore rules.",
      },
    ],
    description: "Validates JavaScript and TypeScript rules, custom lints, and patterns.",
    suggestions: [
      "Run `npm run lint -- --fix` to automatically correct autofixable ESLint errors.",
      "Verify that you are not using any forbidden syntax or hardcoded UI strings (all UI text must use next-intl).",
      "Ensure all imported hooks and types conform to the rules set in ESLint configuration.",
    ],
  },
  "TypeScript Compilation Safety (Type check)": {
    rules: [
      {
        file: ".cursor/rules/typescript-code-convention.mdc",
        purpose: "Strict type constraints and coding rules.",
      },
      {
        file: "AGENTS.md",
        purpose: "General environment types and rules.",
      },
    ],
    description: "Ensures there are no TypeScript compilation errors or type mismatches.",
    suggestions: [
      "Review the compilation errors above and ensure proper type safety is observed.",
      "Avoid using `any` types; declare robust custom types or interfaces instead.",
      "Check that you are properly importing dynamic routing parameters (Next.js 15 requires awaiting searchParams and params).",
    ],
  },
  "Vitest Unit & Integration Tests": {
    rules: [
      {
        file: ".cursor/rules/vitest-unit-testing.mdc",
        purpose: "Vitest config, standard setup, and Mocking.",
      },
    ],
    description: "Runs all unit and integration tests across components, utilities, and states.",
    suggestions: [
      "Run `npm run test` or `npm run test:watch` locally to interactively debug failing unit tests.",
      "Verify that your mock data, component mounts, or state assertions are valid and up-to-date.",
      "Ensure components are fully tested in isolation using jsdom environment.",
    ],
  },
  "Next.js Production Build": {
    rules: [
      {
        file: ".cursor/rules/nextjs-app-router.mdc",
        purpose: "Next.js 15 routing architecture rules.",
      },
      {
        file: ".cursor/rules/nextjs15-react19-tailwind.mdc",
        purpose: "Tailwind CSS integration and React 19 rules.",
      },
      {
        file: ".cursor/rules/next-intl-project.mdc",
        purpose: "locale-aware and multilingual pages.",
      },
      {
        file: ".cursor/rules/anti-overengineering.mdc",
        purpose: "Preventing unnecessary complexity in build artifacts.",
      },
    ],
    description:
      "Compiles the Next.js application to check for production-readiness, optimization, and SSR issues.",
    suggestions: [
      "Verify that all dynamic pages handle searchParams/params as Promises in Next.js 15.",
      "Check for any server-side rendering (SSR) issues, missing imports, or build-time crashes.",
      "Ensure build-time Firebase database calls are properly mocked so static page compilation does not hang or fail.",
    ],
  },
  "End-to-End Tests": {
    rules: [
      {
        file: ".cursor/rules/playwright-e2e-testing.mdc",
        purpose: "E2E testing guidelines, specs, and timing rules.",
      },
      {
        file: ".cursor/rules/playwright-accessibility-testing.mdc",
        purpose: "A11y automated testing patterns.",
      },
      {
        file: ".cursor/rules/rtl-i18n.mdc",
        purpose: "Bi-directional text and language switcher E2E verification.",
      },
    ],
    description: "Executes browser automation sanity tests using Playwright Chromium.",
    suggestions: [
      "Run `npx playwright install --with-deps chromium` locally if Playwright browser dependencies are missing.",
      "Ensure your Next.js dev server or Playwright webServer starts correctly on the selected PORT (default 3000, verify may choose 9010-9050).",
      "Use robust E2E timing: await `Promise.all([page.waitForURL(...), element.click()])` with a 15-second timeout on navigation steps to prevent flakiness.",
      "Inspect the generated HTML report locally with `npx playwright show-report` to see step-by-step failures and visual diffs.",
    ],
  },
};

const STEPS = [
  {
    name: "Prettier Formatting Check",
    command: "npx",
    args: ["prettier", "--check", "."],
    rules: [".cursor/rules/code-style-consistency.mdc"],
  },
  {
    name: "ESLint Code Linting",
    command: "npm",
    args: ["run", "lint"],
    rules: [
      ".cursor/rules/javascript-typescript-code-quality.mdc",
      ".cursor/rules/typescript-code-convention.mdc",
    ],
  },
  {
    name: "TypeScript Compilation Safety (Type check)",
    command: "npx",
    args: ["tsc", "--noEmit"],
    rules: [".cursor/rules/typescript-code-convention.mdc"],
  },
  {
    name: "Vitest Unit & Integration Tests",
    command: "npm",
    args: ["run", "test"],
    rules: [".cursor/rules/vitest-unit-testing.mdc"],
  },
  {
    name: "Next.js Production Build",
    command: "npm",
    args: ["run", "build"],
    rules: [
      ".cursor/rules/nextjs-app-router.mdc",
      ".cursor/rules/nextjs15-react19-tailwind.mdc",
      ".cursor/rules/next-intl-project.mdc",
      ".cursor/rules/anti-overengineering.mdc",
    ],
  },
  {
    name: "End-to-End Tests",
    command: "npx",
    args: ["playwright", "test", "--project=chromium"],
    rules: [
      ".cursor/rules/playwright-e2e-testing.mdc",
      ".cursor/rules/playwright-accessibility-testing.mdc",
      ".cursor/rules/rtl-i18n.mdc",
    ],
  },
];

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function safeWriteFile(filePath, content) {
  try {
    ensureReportDir();
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  } catch (error) {
    console.warn(`Warning: Unable to write report file ${filePath}: ${error.message}`);
    return false;
  }
}

function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.warn(`Warning: Unable to remove stale report file ${filePath}: ${error.message}`);
  }
}

// Helper to run a command with real-time output streaming
function runCommand(step) {
  return new Promise((resolve, reject) => {
    console.log(`\n==================================================`);
    console.log(`🚀 RUNNING: ${step.name} (${step.command} ${step.args.join(" ")})`);
    console.log(`==================================================\n`);

    const proc = spawn(step.command, step.args, {
      shell: true,
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, FORCE_COLOR: "true" },
    });

    let stdoutBuffer = "";
    let stderrBuffer = "";

    proc.stdout.on("data", (data) => {
      const chunk = data.toString();
      stdoutBuffer += chunk;
      process.stdout.write(data);
    });

    proc.stderr.on("data", (data) => {
      const chunk = data.toString();
      stderrBuffer += chunk;
      process.stderr.write(data);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`\n✅ SUCCESS: ${step.name} passed.`);
        resolve();
      } else {
        const rawOutput = (stdoutBuffer + "\n" + stderrBuffer).trim();
        const cleanOutput = stripAnsi(rawOutput);
        const failureDetails = {
          stepName: step.name,
          command: `${step.command} ${step.args.join(" ")}`,
          exitCode: code,
          outputSnippet: cleanOutput,
        };
        reject(failureDetails);
      }
    });
  });
}

function formatFailuresReportMarkdown(failure) {
  const mapping = RULE_MAPPING[failure.stepName] || {
    rules: [{ file: ".cursorrules", purpose: "General project standards." }],
    description: "General project compilation or verification check.",
    suggestions: ["Review standard error logs above and correct failures accordingly."],
  };

  const mappedRules = mapping.rules.map((rule) => {
    const absPath = path.resolve(__dirname, "..", rule.file).replace(/\\/g, "/");
    return {
      ruleFile: rule.file,
      absolutePath: `file:///${absPath}`,
      purpose: rule.purpose,
    };
  });

  let ruleLinks = mappedRules
    .map(
      (rule) =>
        `- **Rule File:** [${rule.ruleFile}](${rule.absolutePath})\n  - *Purpose:* ${rule.purpose}`
    )
    .join("\n");

  let suggestionsText = "";
  mappedRules.forEach((rule, idx) => {
    suggestionsText += `${idx + 1}. **Consult Guidelines:** Open [${rule.ruleFile}](${rule.absolutePath}) to understand constraints.\n`;
  });
  mapping.suggestions.forEach((s, idx) => {
    suggestionsText += `${mappedRules.length + idx + 1}. **Suggested Fix:** ${s}\n`;
  });

  return `# 🚨 Agent Verification Failure Report

The local verification harness encountered a failure at **${failure.stepName}**.

## 🔍 Failure Context
- **Step:** ${failure.stepName}
- **Command:** \`${failure.command}\`
- **Exit Code:** ${failure.exitCode}

## 📝 Mapped Project Architectural Rules
This failure directly relates to or violates the following project guidelines:

${ruleLinks}

## 💡 Actionable Self-Correction Instructions
${suggestionsText}

## 📋 Standard Error Log Output (Stripped ANSI)
\`\`\`text
${failure.outputSnippet}
\`\`\`

---
*Generated automatically by ImprovIL Agent Verification Harness.*
`;
}

function writeFailuresReport(failure) {
  const mapping = RULE_MAPPING[failure.stepName] || {
    rules: [{ file: ".cursorrules", purpose: "General project standards." }],
    description: "General project compilation or verification check.",
    suggestions: ["Review standard error logs above and correct failures accordingly."],
  };

  const mappedRules = mapping.rules.map((rule) => {
    const absPath = path.resolve(__dirname, "..", rule.file).replace(/\\/g, "/");
    return {
      ruleFile: rule.file,
      absolutePath: `file:///${absPath}`,
      purpose: rule.purpose,
    };
  });

  const failuresJson = {
    timestamp: new Date().toISOString(),
    failedStep: failure.stepName,
    command: failure.command,
    exitCode: failure.exitCode,
    description: mapping.description,
    mappedRules,
    suggestions: mapping.suggestions,
    logs: failure.outputSnippet,
  };

  const wroteJson = safeWriteFile(REPORT_JSON, JSON.stringify(failuresJson, null, 2));
  const wroteMarkdown = safeWriteFile(REPORT_MD, formatFailuresReportMarkdown(failure));

  console.log(`\n==================================================`);
  console.log(`❌ FAILURE REPORT WRITTEN TO:`);
  if (wroteJson) console.log(`   JSON: ${REPORT_JSON}`);
  if (wroteMarkdown) console.log(`   Markdown: ${REPORT_MD}`);
  console.log(`==================================================\n`);
}

async function main() {
  const start = Date.now();

  // Clean up any stale failure reports
  safeUnlink(REPORT_JSON);
  safeUnlink(REPORT_MD);

  // Use production server for E2E tests in the harness to avoid lazy compilation timeouts
  process.env.PLAYWRIGHT_START_PROD = "true";
  process.env.NEXT_PUBLIC_ADMIN_DEV_UID = "admin-test";
  process.env.ALLOW_DEV_BYPASS = "true";

  // Dynamic port allocation for E2E testing
  if (!process.env.PORT) {
    try {
      const port = await getAvailablePort(9010, 9050);
      process.env.PORT = port.toString();
      console.log(`📡 Selected dynamic E2E port: ${process.env.PORT}`);
    } catch (err) {
      console.log(
        `⚠️ Failed to find available port in range 9010-9050: ${err.message}. Falling back to 3000.`
      );
      process.env.PORT = "3000";
    }
  } else {
    console.log(`📡 Using pre-configured E2E port from environment: ${process.env.PORT}`);
  }

  const { execSync } = require("child_process");
  function runScript(scriptRelativePath) {
    console.log(`\n⚙️ Running database helper: ${scriptRelativePath}...`);
    execSync(`node ${path.join(__dirname, "..", scriptRelativePath)}`, {
      stdio: "inherit",
      env: process.env,
    });
  }

  try {
    for (const step of STEPS) {
      if (step.name === "End-to-End Tests") {
        try {
          runScript("scripts/seed.js");
        } catch (err) {
          console.error("Failed to seed database for E2E tests:", err.message);
        }
      }

      await runCommand(step);
    }

    // Restore database to clean user state with only Tuesday Night Improv
    try {
      runScript("scripts/clear-db.js");
      runScript("scripts/seed-tuesday-improv.js");
    } catch (err) {
      console.error("Failed to restore Tuesday Night Improv:", err.message);
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n==================================================`);
    console.log(`🎉 ALL VERIFICATIONS PASSED IN ${duration}s!`);
    console.log(`Your branch is perfectly stable and ready for merge.`);
    console.log(`==================================================\n`);

    safeWriteFile(
      REPORT_JSON,
      JSON.stringify({ status: "SUCCESS", duration: `${duration}s` }, null, 2)
    );
    safeWriteFile(REPORT_MD, `# ✅ Verification Passed\nAll checks passed in ${duration}s.`);

    process.exit(0);
  } catch (error) {
    // Restore database to clean user state with only Tuesday Night Improv even on test failure
    try {
      runScript("scripts/clear-db.js");
      runScript("scripts/seed-tuesday-improv.js");
    } catch (err) {
      console.error("Failed to restore Tuesday Night Improv on failure:", err.message);
    }

    writeFailuresReport(error);
    process.exit(error.exitCode || 1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  STEPS,
  ensureReportDir,
  formatFailuresReportMarkdown,
  main,
  runCommand,
  writeFailuresReport,
};
