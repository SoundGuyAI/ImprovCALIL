import { test, expect } from "@playwright/test";
import { captureScreenshot } from "./helpers/screenshots";

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

  // Take screenshot of English home page
  await captureScreenshot(page, "01_english_home.png", "English home page with language switcher");

  // Locate the language switcher button by its aria-haspopup attribute
  const switcherBtn = page.locator("button[aria-haspopup='true']");
  await expect(switcherBtn).toBeVisible();

  // Click the switcher to open dropdown
  await switcherBtn.click();

  // Take screenshot of open dropdown
  await captureScreenshot(page, "02_language_dropdown.png", "Language switcher dropdown open");

  // Click the Hebrew option in the dropdown
  const hebrewOption = page.locator("button[role='menuitem']:has-text('עברית')");
  await expect(hebrewOption).toBeVisible();
  await hebrewOption.click();

  // Check URL redirect to Hebrew /he
  await expect(page).toHaveURL(/\/he/);

  // Take screenshot of Hebrew home page
  await captureScreenshot(
    page,
    "03_hebrew_home.png",
    "Hebrew home page (RTL) with language switcher"
  );

  // Verify that the HTML element has dir="rtl" and lang="he"
  const html = page.locator("html");
  await expect(html).toHaveAttribute("dir", "rtl");
  await expect(html).toHaveAttribute("lang", "he");

  // Verify that the switcher button now has aria-label "בחר שפה"
  const switcherBtnBack = page.locator("button[aria-label='בחר שפה']");
  await expect(switcherBtnBack).toBeVisible();

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

  // Click trigger, then click English
  const switcherBtnHe = page.locator("button[aria-haspopup='true']");
  await switcherBtnHe.click();
  const englishOption = page.locator("button[role='menuitem']:has-text('English')");
  await expect(englishOption).toBeVisible();
  await englishOption.click();

  await expect(page).toHaveURL(/\/en\/organizers/);
  const logoLinkEn = page.locator("header > div a.group").first();
  const homeNavLinkEn = page.locator("nav a[href='/en']").first();
  await expect(logoLinkEn).toHaveAttribute("data-locale", "en");
  await expect(logoLinkEn).toHaveAttribute("href", "/en");
  await expect(homeNavLinkEn).toHaveAttribute("href", "/en");
});

test("app version - verify app version is rendered in footer on all pages", async ({ page }) => {
  await page.goto("/en");

  // Locate the app version element by text matching format "vX.Y.Z"
  const versionText = page.locator("p:has-text('v')").filter({ hasText: /^v\d+\.\d+\.\d+/ });
  await expect(versionText).toBeVisible();

  // Take screenshot of app version footer
  await captureScreenshot(page, "04_app_version_footer.png", "App version rendered in footer");

  // Go to organizers page and verify it's still visible
  await page.goto("/en/organizers");
  await expect(versionText).toBeVisible();
});

test("navigation - verify routing across main pages", async ({ page }) => {
  await page.goto("/en");

  // Verify that the Header navigation exists
  const nav = page.locator("nav");
  await expect(nav).toBeVisible();

  // 1. Navigate to Organizers (next-intl Link renders locale-prefixed hrefs)
  const organizersLink = page.locator("nav a[href='/en/organizers']");
  await expect(organizersLink).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/en\/organizers/, { timeout: 15000 }),
    organizersLink.click(),
  ]);

  // 2. Navigate to Submit Event
  const submitLink = page.locator("nav a[href='/en/submit']");
  await expect(submitLink).toBeVisible();
  await Promise.all([page.waitForURL(/\/en\/submit/, { timeout: 15000 }), submitLink.click()]);
});
