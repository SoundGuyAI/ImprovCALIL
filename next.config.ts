import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import createNextIntlPlugin from "next-intl/plugin";
import versionData from "./version.json";

const withNextIntl = createNextIntlPlugin();

function resolveBuildCommit(): string {
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (vercelSha) return vercelSha.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: versionData.version,
    NEXT_PUBLIC_BUILD_COMMIT: resolveBuildCommit(),
  },
  // Ensure Firebase & other client packages render correctly in next router
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV !== "production",
  },
};

export default withNextIntl(nextConfig);
