# Install Cursor rules & skills from upstream GitHub repos
# Run from the TARGET project root: .\docs\cursor-agent-setup\install-from-sources.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = (Get-Location).Path
$TmpDir = Join-Path $ProjectRoot ".tmp-cursor-setup"
$RulesSrc = Join-Path $TmpDir "awesome-cursorrules\rules"
$SkillsSrc = Join-Path $TmpDir "awesome-cursor-skills\resources"
$RulesDst = Join-Path $ProjectRoot ".cursor\rules"
$SkillsDst = Join-Path $ProjectRoot ".cursor\skills"

Write-Host "Installing Cursor agent setup into: $ProjectRoot"

# Clone upstream repos
if (Test-Path $TmpDir) { Remove-Item $TmpDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null
git clone --depth 1 https://github.com/PatrickJS/awesome-cursorrules.git (Join-Path $TmpDir "awesome-cursorrules")
git clone --depth 1 https://github.com/spencerpauly/awesome-cursor-skills.git (Join-Path $TmpDir "awesome-cursor-skills")

New-Item -ItemType Directory -Force -Path $RulesDst | Out-Null
New-Item -ItemType Directory -Force -Path $SkillsDst | Out-Null

$ruleMap = @{
  "nextjs15-react19-vercelai-tailwind-cursorrules-prompt-file.mdc" = "nextjs15-react19-tailwind.mdc"
  "tailwind-react-firebase-cursorrules-prompt-file.mdc" = "tailwind-react-firebase.mdc"
  "rtl-right-to-left-i18n-cursorrules-prompt-file.mdc" = "rtl-i18n.mdc"
  "nextjs-app-router-cursorrules-prompt-file.mdc" = "nextjs-app-router.mdc"
  "anti-overengineering.mdc" = "anti-overengineering.mdc"
  "anti-sycophancy-code-discipline-cursorrules-prompt-file.mdc" = "anti-sycophancy-code-discipline.mdc"
  "typescript-code-convention-cursorrules-prompt-file.mdc" = "typescript-code-convention.mdc"
  "javascript-typescript-code-quality-cursorrules-pro.mdc" = "javascript-typescript-code-quality.mdc"
  "code-style-consistency-cursorrules-prompt-file.mdc" = "code-style-consistency.mdc"
  "vitest-unit-testing-cursorrules-prompt-file.mdc" = "vitest-unit-testing.mdc"
  "playwright-e2e-testing-cursorrules-prompt-file.mdc" = "playwright-e2e-testing.mdc"
  "playwright-accessibility-testing-cursorrules-prompt-file.mdc" = "playwright-accessibility-testing.mdc"
  "pr-review-cursorrules-prompt-file.mdc" = "pr-review.mdc"
  "security-devsecops-ssdls-appsec.mdc" = "devsecops-appsec.mdc"
  "vercel-deployment-cursorrules-prompt-file.mdc" = "vercel-deployment.mdc"
}

foreach ($entry in $ruleMap.GetEnumerator()) {
  Copy-Item (Join-Path $RulesSrc $entry.Key) (Join-Path $RulesDst $entry.Value) -Force
  Write-Host "  rule: $($entry.Value)"
}

$skillDirs = @(
  "adding-e2e-tests","writing-tests","recording-browser-flow-as-test","setting-up-ci",
  "finding-dev-server-url","visual-qa-testing","verifying-in-browser","accessibility-auditing",
  "responsive-testing","suggesting-cursor-rules","suggesting-cursor-hooks","auto-type-checking",
  "grinding-until-pass","systematic-debugging","babysitting-pr","parallel-test-fixing",
  "auditing-security","auditing-performance","reviewing-code","api-smoke-testing",
  "adding-analytics","adding-feature-flags","adding-error-tracking","seo-auditing",
  "building-skills-from-patterns"
)

foreach ($dir in $skillDirs) {
  Copy-Item (Join-Path $SkillsSrc $dir) (Join-Path $SkillsDst $dir) -Recurse -Force
  Write-Host "  skill: $dir"
}

Remove-Item $TmpDir -Recurse -Force

Write-Host ""
Write-Host "Done. Installed $($ruleMap.Count) rules and $($skillDirs.Count) skills."
Write-Host "Add custom files manually: next-intl-project.mdc, rtl-locale-testing skill"
Write-Host "See docs/cursor-agent-setup/MANIFEST.md for the full inventory."
