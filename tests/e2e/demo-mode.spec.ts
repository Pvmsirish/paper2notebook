import { test, expect } from "@playwright/test";

test.describe("Demo Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows a Try with sample paper button", async ({ page }) => {
    const demoButton = page.getByTestId("demo-button");
    await expect(demoButton).toBeVisible();
    await expect(demoButton).toContainText(/sample/i);

    await page.screenshot({
      path: "tests/screenshots/task10-01-demo-button.png",
    });
  });

  test("clicking demo button loads sample paper and fills form", async ({
    page,
  }) => {
    const demoButton = page.getByTestId("demo-button");
    await demoButton.click();

    // Should show a filename in the upload area
    const filename = page.getByTestId("pdf-filename");
    await expect(filename).toBeVisible({ timeout: 5000 });
    await expect(filename).toContainText(/sample/i);

    await page.screenshot({
      path: "tests/screenshots/task10-02-demo-loaded.png",
    });
  });

  test("demo button is disabled when processing", async ({ page }) => {
    // Fill API key and click demo
    await page.getByTestId("api-key-input").fill("sk-test-key");
    await page.getByTestId("demo-button").click();

    // Wait for file to load
    await expect(page.getByTestId("pdf-filename")).toBeVisible({ timeout: 5000 });

    // Click generate
    await page.getByTestId("generate-button").click();

    // Demo button should be disabled during processing
    await expect(page.getByTestId("demo-button")).toBeDisabled();

    await page.screenshot({
      path: "tests/screenshots/task10-03-demo-disabled.png",
    });
  });
});
