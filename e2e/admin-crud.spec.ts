import { test, expect } from "@playwright/test";

test.beforeAll(() => {
  process.env.NEXT_PUBLIC_ADMIN_DEV_UID = "admin-test";
});

test("admin CRUD - add event modal opens and closes", async ({ page }) => {
  // Navigate to admin
  await page.goto("/en/admin");

  // Wait for events tab to be accessible or go directly there
  const eventsTab = page.locator("button:has-text('Event Management')");
  await expect(eventsTab).toBeVisible({ timeout: 15000 });
  await eventsTab.click();

  // Find and click the 'Add Event' button
  const addEventBtn = page.locator("button:has-text('Add Event')");
  await expect(addEventBtn).toBeVisible({ timeout: 20000 });
  await addEventBtn.click();

  // Modal should open
  const modalHeader = page.locator("h2:has-text('Add Event')");
  await expect(modalHeader).toBeVisible();

  // Verify form fields
  await expect(page.locator("input[name='name']")).toBeVisible();
  await expect(page.locator("select[name='organizerId']")).toBeVisible();
  await expect(page.locator("input[name='location']")).toBeVisible();

  // Take a screenshot of the Add Event modal
  await page.screenshot({
    path: ".screenshots/IMPCAL-50/admin-add-event-modal.png",
    fullPage: true,
  });

  // Close the modal
  const closeBtn = page.locator("button").filter({ has: page.locator("svg.lucide-x") });
  await closeBtn.first().click();

  // Modal should be closed
  await expect(modalHeader).toBeHidden();
});

test("admin CRUD - edit event modal populates data", async ({ page }) => {
  await page.goto("/en/admin");

  const eventsTab = page.locator("button:has-text('Event Management')");
  await expect(eventsTab).toBeVisible({ timeout: 15000 });
  await eventsTab.click();

  // Wait for the events table to load and show Edit buttons
  const editBtn = page.locator("button[title='Edit']").first();
  await expect(editBtn).toBeVisible({ timeout: 20000 });
  await editBtn.click();

  // Modal should open with Edit Event
  const modalHeader = page.locator("h2:has-text('Edit Event')");
  await expect(modalHeader).toBeVisible();

  // Name should be populated (not empty)
  const nameInput = page.locator("input[name='name']");
  await expect(nameInput).not.toBeEmpty();

  // Close modal
  const closeBtn = page.locator("button").filter({ has: page.locator("svg.lucide-x") });
  await closeBtn.first().click();
});
