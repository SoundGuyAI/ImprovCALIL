#!/usr/bin/env bash
# Install Cursor rules & skills from upstream GitHub repos
# Run from the TARGET project root: ./docs/cursor-agent-setup/install-from-sources.sh

set -euo pipefail

PROJECT_ROOT="$(pwd)"
TMP_DIR="$PROJECT_ROOT/.tmp-cursor-setup"
RULES_SRC="$TMP_DIR/awesome-cursorrules/rules"
SKILLS_SRC="$TMP_DIR/awesome-cursor-skills/resources"
RULES_DST="$PROJECT_ROOT/.cursor/rules"
SKILLS_DST="$PROJECT_ROOT/.cursor/skills"

echo "Installing Cursor agent setup into: $PROJECT_ROOT"

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
git clone --depth 1 https://github.com/PatrickJS/awesome-cursorrules.git "$TMP_DIR/awesome-cursorrules"
git clone --depth 1 https://github.com/spencerpauly/awesome-cursor-skills.git "$TMP_DIR/awesome-cursor-skills"

mkdir -p "$RULES_DST" "$SKILLS_DST"

declare -A RULE_MAP=(
  ["nextjs15-react19-vercelai-tailwind-cursorrules-prompt-file.mdc"]="nextjs15-react19-tailwind.mdc"
  ["tailwind-react-firebase-cursorrules-prompt-file.mdc"]="tailwind-react-firebase.mdc"
  ["rtl-right-to-left-i18n-cursorrules-prompt-file.mdc"]="rtl-i18n.mdc"
  ["nextjs-app-router-cursorrules-prompt-file.mdc"]="nextjs-app-router.mdc"
  ["anti-overengineering.mdc"]="anti-overengineering.mdc"
  ["anti-sycophancy-code-discipline-cursorrules-prompt-file.mdc"]="anti-sycophancy-code-discipline.mdc"
  ["typescript-code-convention-cursorrules-prompt-file.mdc"]="typescript-code-convention.mdc"
  ["javascript-typescript-code-quality-cursorrules-pro.mdc"]="javascript-typescript-code-quality.mdc"
  ["code-style-consistency-cursorrules-prompt-file.mdc"]="code-style-consistency.mdc"
  ["vitest-unit-testing-cursorrules-prompt-file.mdc"]="vitest-unit-testing.mdc"
  ["playwright-e2e-testing-cursorrules-prompt-file.mdc"]="playwright-e2e-testing.mdc"
  ["playwright-accessibility-testing-cursorrules-prompt-file.mdc"]="playwright-accessibility-testing.mdc"
  ["pr-review-cursorrules-prompt-file.mdc"]="pr-review.mdc"
  ["security-devsecops-ssdls-appsec.mdc"]="devsecops-appsec.mdc"
  ["vercel-deployment-cursorrules-prompt-file.mdc"]="vercel-deployment.mdc"
)

for src in "${!RULE_MAP[@]}"; do
  cp "$RULES_SRC/$src" "$RULES_DST/${RULE_MAP[$src]}"
  echo "  rule: ${RULE_MAP[$src]}"
done

SKILL_DIRS=(
  adding-e2e-tests writing-tests recording-browser-flow-as-test setting-up-ci
  finding-dev-server-url visual-qa-testing verifying-in-browser accessibility-auditing
  responsive-testing suggesting-cursor-rules suggesting-cursor-hooks auto-type-checking
  grinding-until-pass systematic-debugging babysitting-pr parallel-test-fixing
  auditing-security auditing-performance reviewing-code api-smoke-testing
  adding-analytics adding-feature-flags adding-error-tracking seo-auditing
  building-skills-from-patterns
)

for dir in "${SKILL_DIRS[@]}"; do
  cp -r "$SKILLS_SRC/$dir" "$SKILLS_DST/"
  echo "  skill: $dir"
done

rm -rf "$TMP_DIR"

echo ""
echo "Done. Installed ${#RULE_MAP[@]} rules and ${#SKILL_DIRS[@]} skills."
echo "Add custom files manually: next-intl-project.mdc, rtl-locale-testing skill"
echo "See docs/cursor-agent-setup/MANIFEST.md for the full inventory."
