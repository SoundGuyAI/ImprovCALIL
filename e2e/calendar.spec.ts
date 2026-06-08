import { test, expect } from "@playwright/test";

test.describe("Calendar Views E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to localized home page
    await page.goto("/en");
    // Ensure page is loaded
    await expect(page.locator("text=ImprovIL")).toBeVisible();
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

    // Find the week view event button
    const eventCard = page.locator("#week-view-grid button:has-text('Grand Improv Night')").first();
    await expect(eventCard).toBeVisible();

    // Click event to open detail modal
    await eventCard.click();

    // Verify modal is open
    const modalTitle = page.locator("h3:has-text('Grand Improv Night')");
    await expect(modalTitle).toBeVisible();

    // Close modal
    const closeModalBtn = page.locator("button:has(svg.rotate-90)").first();
    await closeModalBtn.click();
    await expect(modalTitle).not.toBeVisible();

    // Click "Next" week button
    await page.locator("#cal-next-btn").click();

    // "Carmel Improv Festival 2026" (8 days out) should be in the next week view
    const nextWeekEvent = page.locator("#week-view-grid button:has-text('Carmel Improv')").first();
    await expect(nextWeekEvent).toBeVisible();

    // Click "Today" to return
    await page.locator("#cal-today-btn").click();
    await expect(eventCard).toBeVisible();
  });

  test("should navigate and interact with Month View", async ({ page }) => {
    // Switch to Month View
    await page.locator("#view-mode-month").click();
    await expect(page.locator("#month-view-grid")).toBeVisible();

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
