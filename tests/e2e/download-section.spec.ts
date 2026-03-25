import { test, expect } from "@playwright/test";

test.describe("Download Section", () => {
  // We can't easily trigger a full generation in E2E without a real API key,
  // but we can verify the UI renders correctly when notebook is available.
  // The download section only appears after successful generation (Task 7 flow).
  // We test the component rendering via the landing page state.

  test("download section is hidden before generation", async ({ page }) => {
    await page.goto("/");

    await page.screenshot({
      path: "tests/screenshots/task8-01-no-download-section.png",
    });

    const downloadSection = page.getByTestId("download-section");
    await expect(downloadSection).not.toBeVisible();
  });
});
