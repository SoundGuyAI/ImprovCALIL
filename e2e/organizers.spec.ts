import { test, expect } from "@playwright/test";

test.describe("Organizers Directory and Details E2E Tests", () => {
  test("should render the organizers list and support filtering and search", async ({ page }) => {
    // Navigate to the organizers page
    await page.goto("/en/organizers");

    // Check directory title
    await expect(page.locator("h1")).toContainText("Improv Organizers Directory");

    // Verify all mock organizers from seed data are visible
    await expect(page.locator("text=Improv Israel School")).toBeVisible();
    await expect(page.locator("text=Jerusalem Improv Troupe")).toBeVisible();
    await expect(page.locator("text=Haifa Improv Theater")).toBeVisible();

    // Test search filter
    const searchInput = page.locator("input[placeholder='Search organizers...']");
    await searchInput.fill("Jerusalem");
    await expect(page.locator("text=Improv Israel School")).not.toBeVisible();
    await expect(page.locator("text=Haifa Improv Theater")).not.toBeVisible();
    await expect(page.locator("text=Jerusalem Improv Troupe")).toBeVisible();

    // Clear search
    await searchInput.fill("");

    // Test Region filter
    // Locate the select dropdown for region
    const regionSelect = page.locator("select").first();
    await regionSelect.selectOption("Jerusalem");
    await expect(page.locator("text=Improv Israel School")).not.toBeVisible();
    await expect(page.locator("text=Haifa Improv Theater")).not.toBeVisible();
    await expect(page.locator("text=Jerusalem Improv Troupe")).toBeVisible();

    // Reset region filter
    await regionSelect.selectOption("all");

    // Test Organizer Type filter
    const typeSelect = page.locator("select").nth(1);
    await typeSelect.selectOption("School");
    await expect(page.locator("text=Improv Israel School")).toBeVisible();
    await expect(page.locator("text=Jerusalem Improv Troupe")).not.toBeVisible();
    await expect(page.locator("text=Haifa Improv Theater")).not.toBeVisible();
  });

  test("should navigate to organizer details and show details and events", async ({ page }) => {
    // Navigate to a specific organizer details page
    await page.goto("/en/organizers/org-improv-school");

    // Check organizer title
    await expect(page.locator("h1")).toContainText("Improv Israel School");

    // Check description
    await expect(
      page.locator("text=The leading improvisation training program in Israel")
    ).toBeVisible();

    // Check language tags
    await expect(page.getByText("he", { exact: true })).toBeVisible();
    await expect(page.getByText("en", { exact: true })).toBeVisible();

    // Check contact links (labels come from LinkTypes translations on /en)
    const websiteLink = page.getByRole("link", { name: "Official Website" });
    await expect(websiteLink).toBeVisible();
    await expect(websiteLink).toHaveAttribute("href", "https://improv-israel.co.il");

    const facebookLink = page.getByRole("link", { name: "Facebook Page" });
    await expect(facebookLink).toBeVisible();
    await expect(facebookLink).toHaveAttribute("href", "https://facebook.com/improvschoolisrael");

    // Check that upcoming events of this organizer are shown
    await expect(page.locator("text=Grand Improv Night - Summer Edition")).toBeVisible();
    await expect(page.locator("text=Open Community Stage & Jam")).toBeVisible();

    // Check that events from OTHER organizers are NOT shown here
    await expect(page.locator("text=Long-form Formats Masterclass")).not.toBeVisible();
  });
});
