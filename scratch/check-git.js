const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (token) {
  console.log("Token found! Length:", token.length);
  console.log("Prefix:", token.substring(0, 4));
} else {
  console.log("No GitHub token found in GITHUB_TOKEN or GH_TOKEN.");
}
process.exit(0);
