#!/usr/bin/env node
/* eslint-disable */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const cardIdInput = args.find(arg => !arg.startsWith('-'));

if (!cardIdInput) {
  console.error('Usage: node setup.js <CARD_ID> [--branch <custom_branch>]');
  console.error('Example: node setup.js IMPCAL-74');
  process.exit(1);
}

const cardId = cardIdInput.toUpperCase().trim();
if (!cardId.startsWith('IMPCAL')) {
  console.error('Error: Card ID must start with IMPCAL');
  process.exit(1);
}

const sourceRepoPath = path.resolve('C:/UnityProj/ImprovCALIL');
const workspacesDir = path.resolve('C:/UnityProj/symphony_workspaces');
const targetWorktreePath = path.join(workspacesDir, cardId);

console.log(`Setting up worktree for card: ${cardId}`);
console.log(`Source Repo Path: ${sourceRepoPath}`);
console.log(`Target Worktree Path: ${targetWorktreePath}`);

// Helper to run shell commands in specific directory
function runCmd(cmd, cwd = sourceRepoPath) {
  console.log(`> Run: ${cmd} (in ${cwd})`);
  try {
    return execSync(cmd, { cwd, stdio: 'inherit' });
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
}

// Helper to get command output
function getCmdOutput(cmd, cwd = sourceRepoPath) {
  try {
    return execSync(cmd, { cwd, stdio: 'pipe' }).toString().trim();
  } catch (err) {
    return '';
  }
}

// 1. Ensure git repo exists
if (!fs.existsSync(sourceRepoPath)) {
  console.error(`Error: Source repository not found at ${sourceRepoPath}`);
  process.exit(1);
}

// 2. Fetch origin and prune worktrees
console.log('\nFetching origin and pruning old worktrees...');
runCmd('git fetch origin main');
runCmd('git worktree prune');

// 3. Remove worktree path if empty directory exists
if (fs.existsSync(targetWorktreePath)) {
  console.log(`Warning: Target directory ${targetWorktreePath} already exists.`);
  // Check if it's already a git worktree
  const isWorktree = fs.existsSync(path.join(targetWorktreePath, '.git'));
  if (isWorktree) {
    console.log('It is already a registered worktree. Skipping worktree creation.');
  } else {
    console.log('It is a non-git directory. Removing it to allow worktree creation...');
    fs.rmSync(targetWorktreePath, { recursive: true, force: true });
  }
}

// 4. Create worktree if not already present
const isWorktree = fs.existsSync(path.join(targetWorktreePath, '.git'));
if (!isWorktree) {
  console.log('\nCreating new Git worktree...');
  runCmd(`git worktree add "${targetWorktreePath}" origin/main --detach --force`);
}

// 5. Copy .env.local to target worktree
const envSource = path.join(sourceRepoPath, '.env.local');
const envTarget = path.join(targetWorktreePath, '.env.local');
if (fs.existsSync(envSource)) {
  console.log(`\nCopying .env.local from ${envSource} to ${envTarget}`);
  fs.copyFileSync(envSource, envTarget);
} else {
  console.warn(`Warning: .env.local not found in source repo ${sourceRepoPath}`);
}

// 6. Branch creation / checkout
console.log('\nSetting up branch...');
const branchName = `feature/${cardId.toLowerCase()}`;

// Check if branch exists locally
const localBranches = getCmdOutput('git branch --format="%(refname:short)"', targetWorktreePath).split('\n');
const branchExistsLocally = localBranches.includes(branchName);

// Check if branch exists remotely
const remoteBranches = getCmdOutput('git branch -r --format="%(refname:short)"', targetWorktreePath).split('\n');
const branchExistsRemotely = remoteBranches.includes(`origin/${branchName}`);

if (branchExistsLocally) {
  console.log(`Branch '${branchName}' already exists locally. Checking it out...`);
  runCmd(`git checkout "${branchName}"`, targetWorktreePath);
} else if (branchExistsRemotely) {
  console.log(`Branch '${branchName}' exists on remote origin. Tracking and checking it out...`);
  runCmd(`git checkout -b "${branchName}" --track "origin/${branchName}"`, targetWorktreePath);
} else {
  console.log(`Creating and checking out new feature branch '${branchName}' off main...`);
  // Make sure we are detached on origin/main first, then branch off
  runCmd(`git checkout --detach origin/main`, targetWorktreePath);
  runCmd(`git checkout -b "${branchName}"`, targetWorktreePath);
}

// 7. Install dependencies
console.log('\nInstalling npm dependencies in worktree...');
runCmd('npm install', targetWorktreePath);

console.log('\n=========================================');
console.log(`🎉 SETUP COMPLETED FOR ${cardId}!`);
console.log(`Worktree is ready at: ${targetWorktreePath}`);
console.log(`Active Branch: ${branchName}`);
console.log('=========================================\n');
