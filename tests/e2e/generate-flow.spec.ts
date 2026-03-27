import { test, expect } from "@playwright/test";

test.describe("Generate Flow UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows progress display when generating", async ({ page }) => {
    // Fill in API key and upload file
    await page.getByTestId("api-key-input").fill("sk-test-key-12345");

    const fileInput = page.getByTestId("pdf-file-input");
    const buffer = Buffer.from("%PDF-1.4 fake pdf content for testing");
    await fileInput.setInputFiles({
      name: "test-paper.pdf",
      mimeType: "application/pdf",
      buffer,
    });

    // Click generate
    const generateBtn = page.getByTestId("generate-button");
    await expect(generateBtn).toBeEnabled();

    await page.screenshot({
      path: "tests/screenshots/task7-01-before-generate.png",
    });

    await generateBtn.click();

    // Should see progress display appear
    const progressDisplay = page.getByTestId("progress-display");
    await expect(progressDisplay).toBeVisible({ timeout: 2000 });

    await page.screenshot({
      path: "tests/screenshots/task7-02-progress-visible.png",
    });

  });

  test("progress display shows step labels", async ({ page }) => {
    await page.getByTestId("api-key-input").fill("sk-test-key-12345");

    const fileInput = page.getByTestId("pdf-file-input");
    const buffer = Buffer.from("%PDF-1.4 fake pdf content for testing");
    await fileInput.setInputFiles({
      name: "test-paper.pdf",
      mimeType: "application/pdf",
      buffer,
    });

    await page.getByTestId("generate-button").click();

    // Should see at least the first step label
    const progressDisplay = page.getByTestId("progress-display");
    await expect(progressDisplay).toBeVisible({ timeout: 2000 });

    // Should contain step text (first step is "Parsing PDF...")
    await expect(progressDisplay).toContainText(/Parsing PDF|Analyzing|Generating|Building/);

    await page.screenshot({
      path: "tests/screenshots/task7-03-step-label.png",
    });
  });

  test("shows error toast on failure", async ({ page }) => {
    await page.getByTestId("api-key-input").fill("sk-invalid-key");

    const fileInput = page.getByTestId("pdf-file-input");
    const buffer = Buffer.from("%PDF-1.4 fake pdf content for testing");
    await fileInput.setInputFiles({
      name: "test-paper.pdf",
      mimeType: "application/pdf",
      buffer,
    });

    await page.getByTestId("generate-button").click();

    // Should eventually show an error (parsing will fail since it's not a real PDF)
    const errorDisplay = page.getByTestId("error-toast");
    await expect(errorDisplay).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: "tests/screenshots/task7-04-error-toast.png",
    });
  });
});
