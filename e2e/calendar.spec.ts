import { test, expect } from "@playwright/test";
import { captureScreenshot } from "./helpers/screenshots";

test.describe("Calendar Views E2E Tests", () => {
  test.beforeAll(() => {
    process.env.SYMPHONY_ISSUE_ID = "IMPCAL-51";
    process.env.SYMPHONY_ATTEMPT = "1";
  });

  test.beforeEach(async ({ page }) => {
    // Set fixed clock date matching seed database relative times
    await page.clock.setFixedTime(new Date("2026-06-09T10:00:00Z"));
    // Navigate to localized home page
    await page.goto("/en");
    // Ensure page is loaded
    await expect(page.locator("text=ImprovIL")).toBeVisible();
    // Wait for the loading state to finish
    await expect(page.locator("text=Loading...").first()).not.toBeVisible({ timeout: 20000 });
  });

  test("should render view switcher and toggle views", async ({ page }) => {
    const listBtn = page.locator("#view-mode-list");
    const weekBtn = page.locator("#view-mode-week");
    const monthBtn = page.locator("#view-mode-month");

    // All buttons should be visible
    await expect(listBtn).toBeVisible();
    await expect(weekBtn).toBeVisible();
    await expect(monthBtn).toBeVisible();

    // Default mode is List View
    await expect(listBtn).toHaveClass(/bg-indigo-600/);

    // Switch to Week View
    await weekBtn.click();
    await expect(weekBtn).toHaveClass(/bg-indigo-600/);
    await expect(page.locator("#cal-prev-btn")).toBeVisible();

    // Switch to Month View
    await monthBtn.click();
    await expect(monthBtn).toHaveClass(/bg-indigo-600/);
    await expect(page.locator("#month-view-grid")).toBeVisible();
  });

  test("should navigate and interact with Week View", async ({ page }) => {
    // Switch to Week View
    await page.locator("#view-mode-week").click();
    await expect(page.locator("#week-view-grid")).toBeVisible();

    const weekRangeLabel = page.locator("h3.capitalize").first();
    const initialWeekLabel = await weekRangeLabel.textContent();

    // Capture screenshot of Week View
    await captureScreenshot(page, "week-view.png", "Week View");

    const eventCard = page.locator("#week-view-grid button.group").first();
    if (await eventCard.count()) {
      // Click event to open detail modal
      await eventCard.click();

      // Verify modal is open
      const modalTitle = page.locator("div.fixed.inset-0 h3").first();
      await expect(modalTitle).toBeVisible();

      // Capture screenshot of Event Details Modal
      await captureScreenshot(
        page,
        "event-details-modal.png",
        "Event Details Modal from Week View"
      );

      // Close modal
      const closeModalBtn = page.locator("button:has(svg.rotate-90)").first();
      await closeModalBtn.click();
      await expect(modalTitle).not.toBeVisible();
    }

    // Click "Next" week button and verify the displayed week changes
    await page.locator("#cal-next-btn").click();
    await expect(weekRangeLabel).not.toHaveText(initialWeekLabel ?? "");

    // Click "Today" to return to the current week
    await page.locator("#cal-today-btn").click();
    await expect(weekRangeLabel).toHaveText(initialWeekLabel ?? "");
  });

  test("should navigate and interact with Month View", async ({ page }) => {
    // Switch to Month View
    await page.locator("#view-mode-month").click();
    await expect(page.locator("#month-view-grid")).toBeVisible();

    // Capture screenshot of Month View
    await captureScreenshot(page, "month-view.png", "Month View");

    // Verify month grid headers (Sun-Sat) using exact text to avoid matching details
    const sunHeader = page.getByText("Sun", { exact: true });
    await expect(sunHeader).toBeVisible();

    // Click on the button inside the grid to open the modal directly
    const eventTitleBtn = page
      .locator("#month-view-grid button:has-text('Grand Improv Night')")
      .first();
    await expect(eventTitleBtn).toBeVisible();
    await eventTitleBtn.click();

    // Verify modal is open
    await expect(page.locator("h3:has-text('Grand Improv Night')")).toBeVisible();

    // Close modal
    await page.locator("button:has(svg.rotate-90)").first().click();
    await expect(page.locator("h3:has-text('Grand Improv Night')")).not.toBeVisible();

    // Check filter interaction on Month View
    // Select Jerusalem region filter
    const regionSelect = page.locator("select").first();
    await regionSelect.selectOption("Jerusalem");

    // "Grand Improv Night" (Tel-Aviv) should not be visible in Month View anymore
    await expect(
      page.locator("#month-view-grid button:has-text('Grand Improv Night')")
    ).not.toBeVisible();

    // Jerusalem Masterclass should still be visible
    await expect(page.locator("#month-view-grid button:has-text('Masterclass')")).toBeVisible();
  });
});
