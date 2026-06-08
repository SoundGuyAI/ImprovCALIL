import pkg from "../../package.json";

export const APP_VERSION = pkg.version;

export const BUILD_COMMIT = process.env.NEXT_PUBLIC_BUILD_COMMIT?.trim() || "unknown";

export function formatAppVersionLabel(
  version: string = APP_VERSION,
  commit: string = BUILD_COMMIT
): string {
  const commitSuffix = commit && commit !== "unknown" ? ` (${commit})` : "";
  return `v${version}${commitSuffix}`;
}
