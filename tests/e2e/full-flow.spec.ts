import { test, expect } from "@playwright/test";

test.describe("Full User Flow", () => {
  test("complete flow: load → API key → sample PDF → generate → download", async ({
    page,
  }) => {
    // Step 1: Load the page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("app-title")).toHaveText("Paper2Notebook");
    await expect(page.getByTestId("generate-button")).toBeDisabled();

    await page.screenshot({
      path: "tests/screenshots/v3task2-01-page-loaded.png",
    });

    // Step 2: Enter API key
    const apiKeyInput = page.getByTestId("api-key-input");
    await apiKeyInput.fill("sk-test-key-for-e2e-flow");
    await expect(apiKeyInput).toHaveValue("sk-test-key-for-e2e-flow");

    // Button should still be disabled (no file yet)
    await expect(page.getByTestId("generate-button")).toBeDisabled();

    await page.screenshot({
      path: "tests/screenshots/v3task2-02-api-key-entered.png",
    });

    // Step 3: Mock the APIs before triggering network requests
    await page.route("**/api/parse-pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          text: "Attention Is All You Need\nWe propose a new architecture called the Transformer...",
        }),
      });
    });

    await page.route("**/api/generate", async (route) => {
      // Simulate a short delay like a real API
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: [
            "```markdown",
            "# Paper Metadata",
            "Title: Attention Is All You Need",
            "```",
            "",
            "```python",
            "import torch",
            "import torch.nn as nn",
            "```",
            "",
            "```markdown",
            "# Key Contributions",
            "The Transformer architecture replaces recurrence with self-attention.",
            "```",
            "",
            "```python",
            "class MultiHeadAttention(nn.Module):",
            "    def __init__(self, d_model, num_heads):",
            "        super().__init__()",
            "        self.d_model = d_model",
            "```",
          ].join("\n"),
          warnings: [],
        }),
      });
    });

    // Step 4: Click "Try with sample paper" to load a file
    await page.getByTestId("demo-button").click();
    await expect(page.getByTestId("pdf-filename")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("pdf-filename")).toHaveText("sample-paper.pdf");

    // Generate button should now be enabled
    await expect(page.getByTestId("generate-button")).toBeEnabled();

    await page.screenshot({
      path: "tests/screenshots/v3task2-03-sample-pdf-loaded.png",
    });

    // Step 5: Click Generate and observe progress
    await page.getByTestId("generate-button").click();

    // Should see progress display appear
    const progressDisplay = page.getByTestId("progress-display");
    await expect(progressDisplay).toBeVisible({ timeout: 3000 });

    // Generate button should be disabled during processing
    await expect(page.getByTestId("generate-button")).toBeDisabled();

    await page.screenshot({
      path: "tests/screenshots/v3task2-04-generating.png",
    });

    // Step 6: Wait for generation to complete — download section appears
    const downloadSection = page.getByTestId("download-section");
    await expect(downloadSection).toBeVisible({ timeout: 15000 });

    // Review warning should be visible
    const reviewWarning = page.getByTestId("review-warning");
    await expect(reviewWarning).toBeVisible();
    await expect(reviewWarning).toContainText(
      "Review generated code before running"
    );

    // Download button should be visible
    const downloadButton = page.getByTestId("download-button");
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toContainText("Download .ipynb");

    await page.screenshot({
      path: "tests/screenshots/v3task2-05-generation-complete.png",
    });

    // Step 7: Verify progress shows "Done!"
    await expect(progressDisplay).toContainText("Done");

    await page.screenshot({
      path: "tests/screenshots/v3task2-06-done-state.png",
    });
  });

  test("full flow with security warnings", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Mock APIs — this time with warnings in the response
    await page.route("**/api/parse-pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ text: "Some paper text" }),
      });
    });

    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: "```python\nimport os\nos.system('echo pwned')\n```",
          warnings: [
            'Flagged: os.system() — shell command execution — "os.system(\'echo pwned\')"',
          ],
        }),
      });
    });

    // Fill API key + load sample
    await page.getByTestId("api-key-input").fill("sk-test-key");
    await page.getByTestId("demo-button").click();
    await expect(page.getByTestId("generate-button")).toBeEnabled({
      timeout: 5000,
    });

    // Generate
    await page.getByTestId("generate-button").click();

    // Wait for completion
    await expect(page.getByTestId("download-section")).toBeVisible({
      timeout: 15000,
    });

    // Security warnings should be visible
    const securityWarnings = page.getByTestId("security-warnings");
    await expect(securityWarnings).toBeVisible();
    await expect(securityWarnings).toContainText("os.system");

    await page.screenshot({
      path: "tests/screenshots/v3task2-07-security-warnings.png",
    });
  });

  test("full flow shows error on API failure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Mock parse-pdf to fail
    await page.route("**/api/parse-pdf", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to parse PDF" }),
      });
    });

    // Fill API key + load sample
    await page.getByTestId("api-key-input").fill("sk-test-key");
    await page.getByTestId("demo-button").click();
    await expect(page.getByTestId("generate-button")).toBeEnabled({
      timeout: 5000,
    });

    // Generate — should fail
    await page.getByTestId("generate-button").click();

    // Error toast should appear
    const errorToast = page.getByTestId("error-toast");
    await expect(errorToast).toBeVisible({ timeout: 10000 });
    await expect(errorToast).toContainText("Failed to parse PDF");

    await page.screenshot({
      path: "tests/screenshots/v3task2-08-error-state.png",
    });

    // Dismiss error
    await errorToast.locator('button[aria-label="Dismiss error"]').click();
    await expect(errorToast).not.toBeVisible();

    await page.screenshot({
      path: "tests/screenshots/v3task2-09-error-dismissed.png",
    });
  });
});
