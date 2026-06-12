import fs from "fs";
import path from "path";
import type { Page } from "@playwright/test";

const MANIFEST_FILENAME = "manifest.json";

type ScreenshotSource = "browser" | "playwright" | "e2e" | "unknown";

interface RunScreenshotEntry {
  filename: string;
  relative_path: string;
  label?: string;
  source?: ScreenshotSource;
  captured_at?: string;
}

interface RunScreenshotManifest {
  issue_identifier: string;
  attempt: number;
  updated_at: string;
  screenshots: RunScreenshotEntry[];
}

export function getScreenshotRunDir(): string {
  const fromEnv = process.env.SYMPHONY_SCREENSHOT_DIR?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const issueId = process.env.SYMPHONY_ISSUE_ID?.trim();
  if (!issueId) {
    throw new Error(
      "Set SYMPHONY_ISSUE_ID or SYMPHONY_SCREENSHOT_DIR before capturing screenshots."
    );
  }

  const attempt = process.env.SYMPHONY_ATTEMPT?.trim() || "1";
  return path.join(".screenshots", issueId.toUpperCase(), `attempt-${attempt}`);
}

function getIssueIdentifierFromRunDir(runDir: string): string {
  const parts = runDir.split(/[\\/]/);
  const screenshotsIndex = parts.lastIndexOf(".screenshots");
  if (screenshotsIndex >= 0 && parts[screenshotsIndex + 1]) {
    return parts[screenshotsIndex + 1];
  }

  return process.env.SYMPHONY_ISSUE_ID?.trim().toUpperCase() || "UNKNOWN";
}

function getAttemptFromRunDir(runDir: string): number {
  const folder = path.basename(runDir);
  const match = /^attempt-(\d+)$/.exec(folder);
  if (match) {
    return Number(match[1]);
  }

  const fromEnv = Number(process.env.SYMPHONY_ATTEMPT?.trim() || "1");
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 1;
}

function readRunManifest(manifestPath: string): RunScreenshotManifest | null {
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as RunScreenshotManifest;
  } catch {
    return null;
  }
}

export function registerScreenshotEntry(
  runDir: string,
  filename: string,
  label?: string,
  source: ScreenshotSource = "playwright"
): void {
  const manifestPath = path.join(runDir, MANIFEST_FILENAME);
  const issueIdentifier = getIssueIdentifierFromRunDir(runDir);
  const attempt = getAttemptFromRunDir(runDir);
  const relativePath = path.join(runDir, filename).split(path.sep).join("/");
  const existing = readRunManifest(manifestPath);
  const screenshots = [...(existing?.screenshots || [])];
  const index = screenshots.findIndex((entry) => entry.filename === filename);

  const entry: RunScreenshotEntry = {
    filename,
    relative_path: relativePath,
    label,
    source,
    captured_at: new Date().toISOString(),
  };

  if (index >= 0) {
    screenshots[index] = { ...screenshots[index], ...entry };
  } else {
    screenshots.push(entry);
  }

  const manifest: RunScreenshotManifest = {
    issue_identifier: issueIdentifier,
    attempt,
    updated_at: new Date().toISOString(),
    screenshots,
  };

  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export async function captureScreenshot(
  page: Page,
  filename: string,
  label?: string
): Promise<string> {
  const issueId = process.env.SYMPHONY_ISSUE_ID?.trim();
  const screenshotDir = process.env.SYMPHONY_SCREENSHOT_DIR?.trim();
  if (!issueId && !screenshotDir) {
    console.warn(
      `Skipping screenshot capture for ${filename} because SYMPHONY_ISSUE_ID and SYMPHONY_SCREENSHOT_DIR are not set.`
    );
    return "";
  }
  const runDir = getScreenshotRunDir();
  fs.mkdirSync(runDir, { recursive: true });
  const filePath = path.join(runDir, filename);
  await page.screenshot({ path: filePath });
  registerScreenshotEntry(runDir, filename, label, "playwright");
  return filePath;
}
