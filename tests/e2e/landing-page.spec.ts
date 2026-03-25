import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows app title and description", async ({ page }) => {
    await expect(page.getByTestId("app-title")).toHaveText("Paper2Notebook");
    await expect(page.getByTestId("app-description")).toBeVisible();
    await page.screenshot({
      path: "tests/screenshots/task2-01-landing-page.png",
    });
  });

  test("has a masked API key input field", async ({ page }) => {
    const input = page.getByTestId("api-key-input");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "password");

    // Type a key and verify it's masked
    await input.fill("sk-test-key-12345");
    await expect(input).toHaveValue("sk-test-key-12345");
    await page.screenshot({
      path: "tests/screenshots/task2-02-api-key-filled.png",
    });
  });

  test("has a toggle to show/hide API key", async ({ page }) => {
    const input = page.getByTestId("api-key-input");
    const toggle = page.getByTestId("api-key-toggle");

    await input.fill("sk-test-key-12345");
    await expect(input).toHaveAttribute("type", "password");

    await toggle.click();
    await expect(input).toHaveAttribute("type", "text");

    await toggle.click();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("has a PDF upload dropzone that accepts only .pdf files", async ({
    page,
  }) => {
    const dropzone = page.getByTestId("pdf-upload");
    await expect(dropzone).toBeVisible();

    const fileInput = page.getByTestId("pdf-file-input");
    await expect(fileInput).toHaveAttribute("accept", ".pdf");
    await page.screenshot({
      path: "tests/screenshots/task2-03-upload-area.png",
    });
  });

  test("has a Generate Notebook button", async ({ page }) => {
    const button = page.getByTestId("generate-button");
    await expect(button).toBeVisible();
    await expect(button).toHaveText(/Generate Notebook/);
    await page.screenshot({
      path: "tests/screenshots/task2-04-generate-button.png",
    });
  });

  test("Generate button is disabled when no API key or file", async ({
    page,
  }) => {
    const button = page.getByTestId("generate-button");
    await expect(button).toBeDisabled();
  });

  test("Generate button is disabled when only API key is provided", async ({
    page,
  }) => {
    await page.getByTestId("api-key-input").fill("sk-test-key");
    const button = page.getByTestId("generate-button");
    await expect(button).toBeDisabled();
  });

  test("shows selected filename after PDF upload", async ({ page }) => {
    const fileInput = page.getByTestId("pdf-file-input");

    // Create a fake PDF file buffer
    const buffer = Buffer.from("%PDF-1.4 fake pdf content");
    await fileInput.setInputFiles({
      name: "test-paper.pdf",
      mimeType: "application/pdf",
      buffer,
    });

    await expect(page.getByTestId("pdf-filename")).toHaveText("test-paper.pdf");
    await page.screenshot({
      path: "tests/screenshots/task2-05-file-selected.png",
    });
  });

  test("Generate button enables when both API key and file are provided", async ({
    page,
  }) => {
    await page.getByTestId("api-key-input").fill("sk-test-key");

    const fileInput = page.getByTestId("pdf-file-input");
    const buffer = Buffer.from("%PDF-1.4 fake pdf content");
    await fileInput.setInputFiles({
      name: "test-paper.pdf",
      mimeType: "application/pdf",
      buffer,
    });

    const button = page.getByTestId("generate-button");
    await expect(button).toBeEnabled();
    await page.screenshot({
      path: "tests/screenshots/task2-06-ready-to-generate.png",
    });
  });
});
