#!/usr/bin/env node
/* eslint-disable */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const cardIdInput = args.find(arg => !arg.startsWith('-'));

if (!cardIdInput) {
  console.error('Usage: node submit.js <CARD_ID> --msg "<commit_message>" --title "<PR_title>" [--url "<Linear_URL>"]');
  console.error('Example: node submit.js IMPCAL-74 --msg "fix: resolve SSR auth issue" --title "Fix SSR Auth Issue"');
  process.exit(1);
}

const cardId = cardIdInput.toUpperCase().trim();
if (!cardId.startsWith('IMPCAL')) {
  console.error('Error: Card ID must start with IMPCAL');
  process.exit(1);
}

const workspacesDir = process.env.WORKTREE_DIR || path.resolve('C:/Users/Oded/.gemini/antigravity/worktrees');
const targetWorktreePath = path.join(workspacesDir, cardId);

// Parse options
const getArgVal = (name) => {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const commitMsg = getArgVal('--msg') || getArgVal('-m') || `feat(${cardId.toLowerCase()}): implement card solutions`;
const prTitle = getArgVal('--title') || `[${cardId}] Implement card solutions`;
const ticketUrl = getArgVal('--url') || '';

console.log(`Submitting card: ${cardId}`);
console.log(`Worktree Path: ${targetWorktreePath}`);
console.log(`Commit Message: ${commitMsg}`);
console.log(`PR Title: ${prTitle}`);

// Helper to run shell commands in worktree
function runCmd(cmd, cwd = targetWorktreePath, ignoreError = false) {
  console.log(`> Run: ${cmd}`);
  try {
    return execSync(cmd, { cwd, stdio: 'inherit' });
  } catch (err) {
    if (ignoreError) {
      console.warn(`Command failed (ignored): ${cmd}`);
      return null;
    }
    console.error(`Command failed: ${cmd}`);
    throw err;
  }
}

// Helper to get command output
function getCmdOutput(cmd, cwd = targetWorktreePath) {
  try {
    return execSync(cmd, { cwd, stdio: 'pipe' }).toString().trim();
  } catch (err) {
    return '';
  }
}

// Helper to send telegram notification
function sendNotification(message) {
  try {
    const notifyScript = path.resolve(__dirname, 'notify.js');
    execSync(`node "${notifyScript}" "${message}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to trigger Telegram notification:', e.message);
  }
}

// 1. Verify worktree exists
if (!fs.existsSync(targetWorktreePath)) {
  console.error(`Error: Worktree path not found: ${targetWorktreePath}`);
  process.exit(1);
}

// 2. Identify and execute verification command
const verifyCmd = 'node scripts/verify-harness.js';
console.log(`\n--- Running verification command: ${verifyCmd} ---`);

try {
  runCmd(verifyCmd);
  console.log('✅ Verification passed!');
} catch (err) {
  console.error('❌ Verification failed!');
  sendNotification(`❌ [work-on-card] Verification failed on ${cardId}. Please fix compilation, linting, or test failures.`);
  process.exit(1);
}

// 3. Format files if format script is available
console.log('\nFormatting code...');
const packageJson = JSON.parse(fs.readFileSync(path.join(targetWorktreePath, 'package.json'), 'utf8'));
if (packageJson.scripts && packageJson.scripts.format) {
  runCmd('npm run format', targetWorktreePath, true);
} else {
  runCmd('npx prettier --write .', targetWorktreePath, true);
}

// 4. Git status check
const gitStatus = getCmdOutput('git status --porcelain', targetWorktreePath);
if (!gitStatus) {
  console.log('No modifications detected. Nothing to commit.');
  sendNotification(`ℹ️ [work-on-card] No modifications detected to commit/push for ${cardId}.`);
  process.exit(0);
}

const currentBranch = getCmdOutput('git branch --show-current', targetWorktreePath);

try {
  // 5. Git commit and push
  console.log(`\nStaging, committing, and pushing changes to branch: ${currentBranch}...`);
  runCmd('git add .');
  runCmd(`git commit -m "${commitMsg}"`);
  runCmd(`git push -u origin "${currentBranch}"`);

  // 6. Open draft PR using gh CLI
  console.log('\nCreating draft Pull Request...');
  const remoteUrl = getCmdOutput('git remote get-url origin', targetWorktreePath);
  let prUrl = '';
  try {
    const prBody = ticketUrl ? `Resolves ${ticketUrl}` : 'Draft PR created automatically by agent.';
    const prOutput = execSync(`gh pr create --title "${prTitle}" --body "${prBody}" --draft`, { cwd: targetWorktreePath, stdio: 'pipe' }).toString().trim();
    if (prOutput.startsWith('http')) {
      prUrl = prOutput;
    }
  } catch (prErr) {
    console.warn('Could not create Pull Request using GitHub CLI (it might not be authenticated or gh is missing):', prErr.message);
  }

  // Determine branch URL fallback
  if (!prUrl) {
    let cleanRemote = remoteUrl.replace('.git', '');
    if (cleanRemote.startsWith('git@github.com:')) {
      cleanRemote = cleanRemote.replace('git@github.com:', 'https://github.com/');
    }
    prUrl = `${cleanRemote}/tree/${currentBranch}`;
  }

  console.log('\n=========================================');
  console.log(`🎉 SUBMISSION COMPLETED SUCCESSFULLY FOR ${cardId}!`);
  console.log(`Branch pushed: ${currentBranch}`);
  console.log(`URL: ${prUrl}`);
  console.log('=========================================\n');

  sendNotification(`✅ [work-on-card] Completed card ${cardId} successfully!\nPR / Branch Link: ${prUrl}`);

} catch (err) {
  console.error('❌ Submission flow failed:', err.message);
  sendNotification(`❌ [work-on-card] Failed during commit/push/PR phase on ${cardId}: ${err.message}`);
  process.exit(1);
}
