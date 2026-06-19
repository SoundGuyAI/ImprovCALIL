import { test, expect } from "@playwright/test";

// Admin dev bypass is controlled by NEXT_PUBLIC_ADMIN_DEV_UID in .env.local (read by the
// Next.js dev server process). Setting process.env here only affects the test runner and
// has no effect on the server — the variable must be pre-configured in .env.local.

test("JSON Submission & Moderation Approval Pipeline E2E Test", async ({ context, page }) => {
  // Set local bypass cookie for admin profile mocking
  await context.addCookies([
    {
      name: "improv_cal_il_logged_in",
      value: "true",
      domain: "localhost",
      path: "/",
    },
  ]);

  // 1. Go to submission page
  await page.goto("/en/submit");

  // 2. Locate and click JSON tab
  const jsonTab = page.locator("button:has-text('JSON')");
  await expect(jsonTab).toBeVisible({ timeout: 15000 });
  await jsonTab.click();

  // 3. Fill the textarea with our bilingual event JSON
  // Use a timestamp 7 days from now so the event always falls within the calendar's
  // 90-day lookahead window regardless of when the test runs.
  const jsonPayload = {
    name: "Bilingual English/Hebrew Improv Jam E2E",
    type: "Jam",
    organizerName: "Bilingual Improv Community",
    description:
      "RSVP for our first English/Hebrew-friendly improv jam on Thursday, June 18th, 20:00, in central Tel-Aviv. All experience levels welcome!",
    time: Date.now() + 7 * 24 * 60 * 60 * 1000,
    recurrence: "one-time",
    location: "Central Tel Aviv",
    region: "Tel-Aviv",
    language: "he/en",
    cost: "Free",
    access: "Open",
    links: [
      {
        url: "https://forms.gle/QoPhEeYXuf1HhAVz7",
        type: "Tickets",
        label: "RSVP / Sign Up",
      },
      {
        url: "https://chat.whatsapp.com/GFc0BNtpSBO4kUVk8dsGAM",
        type: "WhatsApp group",
        label: "WhatsApp Group",
      },
    ],
  };

  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible();
  await textarea.fill(JSON.stringify(jsonPayload, null, 2));

  // 4. Submit the JSON form
  const submitBtn = page.locator("button:has-text('Submit JSON')");
  await expect(submitBtn).toBeVisible();
  await submitBtn.click();

  // 5. Verify submission success feedback banner
  const successBanner = page.locator("text=Submission received successfully");
  await expect(successBanner).toBeVisible({ timeout: 15000 });

  // 6. Navigate to Admin moderation queue
  await page.goto("/en/admin");
  const queueTab = page.locator("button:has-text('Moderation Queue')");
  await expect(queueTab).toBeVisible({ timeout: 15000 });
  await queueTab.click();

  // 7. Locate our pending card and approve it
  const submissionCard = page
    .locator("div.glass-card")
    .filter({ hasText: "Bilingual English/Hebrew Improv Jam E2E" })
    .first();
  await expect(submissionCard).toBeVisible({ timeout: 15000 });

  const approveBtn = submissionCard.locator("button:has-text('Approve')");
  await expect(approveBtn).toBeVisible({ timeout: 15000 });
  await approveBtn.click();

  // Wait for it to disappear from the pending list
  await expect(submissionCard).toBeHidden({ timeout: 15000 });

  // 8. Verify the approved event renders on the public calendar
  await page.goto("/en");

  const eventHeader = page
    .locator("h5")
    .filter({ hasText: "Bilingual English/Hebrew Improv Jam E2E" });
  await expect(eventHeader).toBeVisible({ timeout: 15000 });

  // Verify cost & language badges
  const costBadge = page.locator("span").filter({ hasText: "Free" });
  const langBadge = page.locator("span").filter({ hasText: "HE/EN" });
  await expect(costBadge.first()).toBeVisible();
  await expect(langBadge.first()).toBeVisible();
});
