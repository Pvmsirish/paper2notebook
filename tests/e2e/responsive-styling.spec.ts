import { test, expect } from "@playwright/test";

test.describe("Responsive styling and error states", () => {
  test("page renders correctly on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await expect(page.getByTestId("app-title")).toBeVisible();
    await expect(page.getByTestId("api-key-input")).toBeVisible();
    await expect(page.getByTestId("pdf-upload")).toBeVisible();
    await expect(page.getByTestId("generate-button")).toBeVisible();

    await page.screenshot({
      path: "tests/screenshots/task9-01-desktop.png",
    });
  });

  test("page renders correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.getByTestId("app-title")).toBeVisible();
    await expect(page.getByTestId("api-key-input")).toBeVisible();
    await expect(page.getByTestId("pdf-upload")).toBeVisible();
    await expect(page.getByTestId("generate-button")).toBeVisible();

    await page.screenshot({
      path: "tests/screenshots/task9-02-mobile.png",
    });
  });

  test("error toast displays and can be dismissed", async ({ page }) => {
    await page.goto("/");

    // Fill form and trigger generation with fake data to get error
    await page.getByTestId("api-key-input").fill("sk-test-key");
    const fileInput = page.getByTestId("pdf-file-input");
    const buffer = Buffer.from("%PDF-1.4 fake");
    await fileInput.setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer,
    });

    await page.getByTestId("generate-button").click();

    // Wait for error toast
    const toast = page.getByTestId("error-toast");
    await expect(toast).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: "tests/screenshots/task9-03-error-state.png",
    });

    // Dismiss error
    await toast.locator('button[aria-label="Dismiss error"]').click();
    await expect(toast).not.toBeVisible();

    await page.screenshot({
      path: "tests/screenshots/task9-04-error-dismissed.png",
    });
  });

  test("generate button shows loading state when processing", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("api-key-input").fill("sk-test-key");
    const fileInput = page.getByTestId("pdf-file-input");
    const buffer = Buffer.from("%PDF-1.4 fake");
    await fileInput.setInputFiles({
      name: "test.pdf",
      mimeType: "application/pdf",
      buffer,
    });

    await page.getByTestId("generate-button").click();

    // Button should be disabled during processing
    await expect(page.getByTestId("generate-button")).toBeDisabled();

    await page.screenshot({
      path: "tests/screenshots/task9-05-loading-state.png",
    });
  });
});
