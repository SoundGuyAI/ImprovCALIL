const fs = require("fs");
const path = require("path");

const secretsDir = path.join(__dirname, "../.secrets");
const keyPath = path.join(secretsDir, "firebase-admin.json");

if (!fs.existsSync(keyPath)) {
  console.error(`\x1b[31mError: Service account key not found at ${keyPath}\x1b[0m`);
  console.log("Please download the service account JSON key from the Firebase Console:");
  console.log(
    "https://console.firebase.google.com/project/improv-calendar-il/settings/serviceaccounts/adminsdk"
  );
  console.log("and save it as 'firebase-admin.json' inside the '.secrets' folder.");
  process.exit(1);
}

try {
  const fileContent = fs.readFileSync(keyPath, "utf8");
  const parsed = JSON.parse(fileContent);

  // Minify JSON to single line
  const minified = JSON.stringify(parsed);

  console.log("\x1b[35m=================================================================\x1b[0m");
  console.log("\x1b[32mSERVICE ACCOUNT KEY FORMATTED SUCCESSFULLY!\x1b[0m");
  console.log("\x1b[35m=================================================================\x1b[0m");
  console.log("\nCopy the line below to set your environment variable in .env.local or Vercel:\n");
  console.log(`\x1b[36mFIREBASE_SERVICE_ACCOUNT_KEY='${minified}'\x1b[0m\n`);
  console.log("\x1b[35m=================================================================\x1b[0m");
} catch (error) {
  console.error(
    "\x1b[31mError reading or parsing the service account JSON key file:\x1b[0m",
    error.message
  );
  process.exit(1);
}
