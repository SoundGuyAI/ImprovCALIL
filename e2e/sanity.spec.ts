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

test("localization - switch language to Hebrew and verify RTL", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en/);

  // Locate the language switcher button (it should show "עברית" while in English)
  const langButton = page.locator("button:has-text('עברית')");
  await expect(langButton).toBeVisible();

  // Click the switcher to toggle English -> Hebrew
  await langButton.click();

  // Check URL redirect to Hebrew /he
  await expect(page).toHaveURL(/\/he/);

  // Verify that the HTML element has dir="rtl" and lang="he"
  const html = page.locator("html");
  await expect(html).toHaveAttribute("dir", "rtl");
  await expect(html).toHaveAttribute("lang", "he");

  // Verify that the language button now shows "English" for toggling back
  const toggleBackBtn = page.locator("button:has-text('English')");
  await expect(toggleBackBtn).toBeVisible();

  // Logo must use the same locale-aware routing as nav (home link), not a plain next/link href
  await page.goto("/he/organizers");
  const logoLink = page.locator("header > div a.group").first();
  const homeNavLink = page.locator("nav a[href='/he']").first();
  await expect(homeNavLink).toBeVisible();
  await expect(logoLink).toHaveAttribute("data-locale", "he");
  await expect(logoLink).toHaveAttribute("href", "/he");
  await expect(homeNavLink).toHaveAttribute("href", "/he");

  await Promise.all([page.waitForURL(/\/he\/?$/), logoLink.click()]);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "he");

  // After locale switch, logo href must track context (would fail if hardcoded /he)
  await page.goto("/he/organizers");
  await page.locator("button:has-text('English')").click();
  await expect(page).toHaveURL(/\/en\/organizers/);
  const logoLinkEn = page.locator("header > div a.group").first();
  const homeNavLinkEn = page.locator("nav a[href='/en']").first();
  await expect(logoLinkEn).toHaveAttribute("data-locale", "en");
  await expect(logoLinkEn).toHaveAttribute("href", "/en");
  await expect(homeNavLinkEn).toHaveAttribute("href", "/en");
});

test("navigation - verify routing across main pages", async ({ page }) => {
  await page.goto("/en");

  // Verify that the Header navigation exists
  const nav = page.locator("nav");
  await expect(nav).toBeVisible();

  // 1. Navigate to Organizers (next-intl Link renders locale-prefixed hrefs)
  const organizersLink = page.locator("nav a[href='/en/organizers']");
  await expect(organizersLink).toBeVisible();
  await organizersLink.click();
  await expect(page).toHaveURL(/\/en\/organizers/);

  // 2. Navigate to Submit Event
  const submitLink = page.locator("nav a[href='/en/submit']");
  await expect(submitLink).toBeVisible();
  await submitLink.click();
  await expect(page).toHaveURL(/\/en\/submit/);
});
