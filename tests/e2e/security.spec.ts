import { test, expect } from "@playwright/test";

test.describe("Security Features", () => {
  test("security headers are present on page responses", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();
    const headers = response!.headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["content-security-policy"]).toContain("default-src");

    await page.screenshot({
      path: "tests/screenshots/task10-01-security-headers.png",
    });
  });

  test("security headers are present on API responses", async ({ request }) => {
    const response = await request.post("/api/parse-pdf");
    const headers = response.headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
  });

  test("rate limit returns 429 after repeated requests", async ({
    request,
  }) => {
    // /api/generate has a limit of 5 requests/minute
    let got429 = false;

    for (let i = 0; i < 7; i++) {
      const response = await request.post("/api/generate", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk-test-fake-key",
        },
        data: { paperText: "test paper text" },
      });

      if (response.status() === 429) {
        got429 = true;
        const body = await response.json();
        expect(body.error).toBe(
          "Too many requests. Please try again later."
        );
        expect(response.headers()["retry-after"]).toBeDefined();
        break;
      }
    }

    expect(got429).toBe(true);
  });

  test("warning banner appears when output contains flagged patterns", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Mock the parse-pdf API to return text
    await page.route("**/api/parse-pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ text: "Sample paper about neural networks" }),
      });
    });

    // Mock the generate API to return content with warnings
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: "# Notebook\nimport os\nos.system('echo hello')",
          warnings: [
            'Dangerous pattern detected: "os.system" found (line 3)',
          ],
        }),
      });
    });

    // Fill in API key
    await page.getByTestId("api-key-input").fill("sk-test-key-12345");

    // Use demo button to load a file (bypasses hidden file input issues)
    await page.getByTestId("demo-button").click();

    // Wait for button to enable (file loaded via demo button)
    const generateBtn = page.getByTestId("generate-button");
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();

    // Wait for the security warnings banner to appear
    const warnings = page.getByTestId("security-warnings");
    await expect(warnings).toBeVisible({ timeout: 10000 });
    await expect(warnings).toContainText("os.system");

    await page.screenshot({
      path: "tests/screenshots/task10-02-security-warnings-banner.png",
    });
  });

  test("download warning text is visible after generation", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Mock APIs
    await page.route("**/api/parse-pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ text: "Sample paper text" }),
      });
    });

    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: "# Clean notebook\nprint('hello')",
          warnings: [],
        }),
      });
    });

    // Fill in API key and load sample file
    await page.getByTestId("api-key-input").fill("sk-test-key-12345");
    await page.getByTestId("demo-button").click();

    const generateBtn = page.getByTestId("generate-button");
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();

    // Wait for download section
    const downloadSection = page.getByTestId("download-section");
    await expect(downloadSection).toBeVisible({ timeout: 10000 });

    // Check review warning is visible
    const reviewWarning = page.getByTestId("review-warning");
    await expect(reviewWarning).toBeVisible();
    await expect(reviewWarning).toContainText("Review generated code before running");

    await page.screenshot({
      path: "tests/screenshots/task10-03-download-warning.png",
    });
  });
});
