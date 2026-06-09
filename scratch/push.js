const { execSync } = require("child_process");

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error("Error: No GITHUB_TOKEN or GH_TOKEN found in environment.");
  process.exit(1);
}

const originalRemote = "https://github.com/SoundGuyAI/ImprovCALIL.git";
const authenticatedRemote = `https://x-access-token:${token}@github.com/SoundGuyAI/ImprovCALIL.git`;

try {
  console.log("Setting remote URL to authenticated URL...");
  execSync(`git remote set-url origin "${authenticatedRemote}"`);

  console.log("Pushing feature/impcal-13 branch...");
  execSync("git push -u origin feature/impcal-13", { stdio: "inherit" });
  console.log("Push completed successfully!");
} catch (err) {
  console.error("Push failed:", err.message);
} finally {
  console.log("Restoring remote URL to original URL...");
  try {
    execSync(`git remote set-url origin "${originalRemote}"`);
    console.log("Remote URL successfully restored.");
  } catch (err) {
    console.error("Failed to restore remote URL:", err.message);
  }
}
process.exit(0);
