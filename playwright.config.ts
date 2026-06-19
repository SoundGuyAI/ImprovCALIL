import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || "3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000, // 60 seconds timeout per test to prevent slow VM flakiness
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "line",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      process.env.PLAYWRIGHT_START_PROD === "true"
        ? `npx next start -p ${PORT}`
        : PORT === "3000"
          ? "npm run dev"
          : `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_ADMIN_DEV_UID: "admin-test",
      ALLOW_DEV_BYPASS: "true",
      IS_LOCAL_TEST_ENV: "true",
    },
  },
});
