import { test, expect } from "@playwright/test";

test("sanity check - home page redirect and title", async ({ page }) => {
  // Navigate to root
  await page.goto("/");
  
  // It should redirect to localized path /en
  await expect(page).toHaveURL(/\/en/);
  
  // Check that the page has the logo or title
  const logo = page.locator("text=ImprovIL");
  await expect(logo).toBeVisible();
});
