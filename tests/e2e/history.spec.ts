import { test, expect } from "@playwright/test";

test.describe("History Panel", () => {
  test("history panel shows after successful generation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Mock APIs
    await page.route("**/api/parse-pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ text: "A Study on Neural Networks\nThis paper presents..." }),
      });
    });

    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: "# Notebook\nprint('hello world')",
          warnings: [],
        }),
      });
    });

    await page.screenshot({
      path: "tests/screenshots/task10-04-before-generation.png",
    });

    // Fill in API key and load sample file
    await page.getByTestId("api-key-input").fill("sk-test-key-12345");
    await page.getByTestId("demo-button").click();

    const generateBtn = page.getByTestId("generate-button");
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();

    // Wait for done state
    const downloadSection = page.getByTestId("download-section");
    await expect(downloadSection).toBeVisible({ timeout: 10000 });

    // Give IndexedDB save time to complete
    await page.waitForTimeout(1000);

    // Reload the page to see history from IndexedDB
    await page.reload();
    await page.waitForLoadState("networkidle");

    // History panel should now be visible with at least one entry
    const historyPanel = page.getByTestId("history-panel");
    await expect(historyPanel).toBeVisible({ timeout: 5000 });

    const historyEntry = page.getByTestId("history-entry").first();
    await expect(historyEntry).toBeVisible();

    await page.screenshot({
      path: "tests/screenshots/task10-05-history-after-generation.png",
    });
  });

  test("clear history button removes all entries", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Mock APIs
    await page.route("**/api/parse-pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ text: "Test Paper Title\nContent here" }),
      });
    });

    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: "# Notebook\nprint('test')",
          warnings: [],
        }),
      });
    });

    // Generate a notebook to create a history entry
    await page.getByTestId("api-key-input").fill("sk-test-key-12345");
    await page.getByTestId("demo-button").click();

    const generateBtn = page.getByTestId("generate-button");
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();
    await expect(page.getByTestId("download-section")).toBeVisible({
      timeout: 10000,
    });

    // Wait for IndexedDB save
    await page.waitForTimeout(1000);

    // Reload to show history
    await page.reload();
    await page.waitForLoadState("networkidle");

    const historyPanel = page.getByTestId("history-panel");
    await expect(historyPanel).toBeVisible({ timeout: 5000 });

    // Click clear
    await page.getByTestId("clear-history").click();

    // History panel should disappear (no entries left)
    await expect(historyPanel).not.toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: "tests/screenshots/task10-06-history-cleared.png",
    });
  });
});
