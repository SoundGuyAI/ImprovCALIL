/**
 * ImprovIL Agent Verification Harness
 * 
 * This script automates the full verification suite (Lint -> Unit Test -> Build -> E2E)
 * as prescribed in the project guidelines. If a step fails, it captures the output,
 * maps the failure to the appropriate architectural `.cursor/rules/*.mdc` rule, and
 * generates an agent-legible markdown/JSON error report in `.agents/reports/`.
 * 
 * Usage: node scripts/verify-harness.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '..', '.agents', 'reports');
const REPORT_JSON = path.join(REPORT_DIR, 'failures.json');
const REPORT_MD = path.join(REPORT_DIR, 'failures.md');

function safeWriteFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
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

// Map commands to their description and governing Cursor rules
const STEPS = [
  {
    name: 'Linting',
    command: 'npm',
    args: ['run', 'lint'],
    rules: ['.cursor/rules/javascript-typescript-code-quality.mdc', '.cursor/rules/code-style-consistency.mdc'],
    errorDescription: 'Javascript/TypeScript style violations or rule breaches.'
  },
  {
    name: 'Unit Tests',
    command: 'npm',
    args: ['test'],
    rules: ['.cursor/rules/vitest-unit-testing.mdc'],
    errorDescription: 'Vitest unit tests failed to pass.'
  },
  {
    name: 'Production Build',
    command: 'npm',
    args: ['run', 'build'],
    rules: ['.cursor/rules/nextjs-app-router.mdc', '.cursor/rules/nextjs15-react19-tailwind.mdc', '.cursor/rules/anti-overengineering.mdc'],
    errorDescription: 'Next.js build compilation failed. This usually indicates TypeScript syntax, bad imports, or SSR errors.'
  },
  {
    name: 'End-to-End Tests',
    command: 'npm',
    args: ['run', 'test:e2e'],
    rules: ['.cursor/rules/playwright-e2e-testing.mdc', '.cursor/rules/playwright-accessibility-testing.mdc'],
    errorDescription: 'Playwright E2E browser tests failed.'
  }
];

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Helper to run a command with real-time output streaming
function runCommand(step) {
  return new Promise((resolve, reject) => {
    console.log(`\n==================================================`);
    console.log(`🚀 RUNNING: ${step.name} (${step.command} ${step.args.join(' ')})`);
    console.log(`==================================================\n`);

    const proc = spawn(step.command, step.args, {
      shell: true,
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, FORCE_COLOR: 'true' }
    });

    let stdoutBuffer = '';
    let stderrBuffer = '';

    proc.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdoutBuffer += chunk;
      process.stdout.write(data);
    });

    proc.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderrBuffer += chunk;
      process.stderr.write(data);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ SUCCESS: ${step.name} passed.`);
        resolve();
      } else {
        const rawOutput = (stdoutBuffer + '\n' + stderrBuffer).trim();
        const failureDetails = {
          stepName: step.name,
          command: `${step.command} ${step.args.join(' ')}`,
          exitCode: code,
          governingRules: step.rules,
          description: step.errorDescription,
          outputSnippet: rawOutput.split('\n').slice(-40).join('\n') // Get last 40 lines of log
        };
        reject(failureDetails);
      }
    });
  });
}

// Write error reports for agents to consume
function writeFailuresReport(failure) {
  // 1. Write JSON Report
  const wroteJson = safeWriteFile(REPORT_JSON, JSON.stringify(failure, null, 2));

  // 2. Write Markdown Report
  const ruleLinks = failure.governingRules
    .map(rule => `- [${path.basename(rule)}](file:///${path.resolve(path.join(__dirname, '..', rule))})`)
    .join('\n');

  const mdContent = `# ❌ Harness Verification Failure: ${failure.stepName}

The autonomous verification suite encountered a failure during the **${failure.stepName}** step.

### Diagnostic Summary
* **Command Executed**: \`${failure.command}\`
* **Exit Code**: \`${failure.exitCode}\`
* **Type of Error**: ${failure.description}

### Governing Architectural Rules
Please review and adhere to the following rules configured for this project to resolve the issue:
${ruleLinks}

### Error Output Snippet (Last 40 Lines)
\`\`\`text
${failure.outputSnippet}
\`\`\`

---
*Generated automatically by ImprovIL Agent Verification Harness.*
`;

  const wroteMarkdown = safeWriteFile(REPORT_MD, mdContent);
  console.log(`\n==================================================`);
  console.log(`❌ FAILURE REPORT WRITTEN TO:`);
  if (wroteJson) console.log(`   JSON: ${REPORT_JSON}`);
  if (wroteMarkdown) console.log(`   Markdown: ${REPORT_MD}`);
  console.log(`==================================================\n`);
}

// Main runner loop
async function main() {
  const start = Date.now();
  
  // Clean up any stale failure reports
  safeUnlink(REPORT_JSON);
  safeUnlink(REPORT_MD);

  try {
    for (const step of STEPS) {
      await runCommand(step);
    }
    
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n==================================================`);
    console.log(`🎉 ALL VERIFICATIONS PASSED IN ${duration}s!`);
    console.log(`Your branch is perfectly stable and ready for merge.`);
    console.log(`==================================================\n`);
    
    // Write success indicators
    safeWriteFile(REPORT_JSON, JSON.stringify({ status: 'SUCCESS', duration: `${duration}s` }, null, 2));
    safeWriteFile(REPORT_MD, `# ✅ Verification Passed\nAll checks passed in ${duration}s.`);
    
    process.exit(0);
  } catch (error) {
    writeFailuresReport(error);
    process.exit(error.exitCode || 1);
  }
}

main();
