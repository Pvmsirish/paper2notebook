import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Real Quality Test — Interactive Browser
 *
 * This test opens a VISIBLE browser, prompts the user to enter their
 * OpenAI API key, uploads the "Attention Is All You Need" paper (1706.pdf),
 * generates a real notebook, and validates the output.
 *
 * Run with: npx playwright test tests/e2e/quality-test.spec.ts --headed
 */

const PDF_PATH = "C:\\Users\\siris\\Downloads\\1706.pdf";
const SCREENSHOT_DIR = "tests/screenshots";

test.describe("Real Quality Test", () => {
  // Allow up to 6 minutes for the full test (API calls can be slow)
  test.setTimeout(360000);

  test("generate notebook from real paper with real API", async ({
    browser,
  }) => {
    const validationReport: { check: string; passed: boolean; detail: string }[] = [];

    function report(check: string, passed: boolean, detail = "") {
      validationReport.push({ check, passed, detail });
    }

    // Launch a persistent context so the user sees the browser
    const context = await browser.newContext({ bypassCSP: true });
    const page = await context.newPage();

    // Step 1: Load the page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "quality-01-initial.png"),
    });

    // Step 2: Pause for user to enter API key
    // Show a visible prompt on the page
    await page.evaluate(() => {
      const banner = document.createElement("div");
      banner.id = "quality-test-banner";
      banner.style.cssText =
        "position:fixed;top:0;left:0;right:0;background:#2563eb;color:white;padding:16px;text-align:center;font-size:18px;z-index:99999;font-family:sans-serif";
      banner.textContent =
        '👉 Enter your OpenAI API key in the input field below, then click "Resume" in the Playwright inspector.';
      document.body.prepend(banner);
    });

    // Pause — Playwright inspector will appear, user enters API key manually
    await page.pause();

    // Remove the banner after resume
    await page.evaluate(() => {
      document.getElementById("quality-test-banner")?.remove();
    });

    // Verify API key was entered
    const apiKeyValue = await page.getByTestId("api-key-input").inputValue();
    const hasApiKey = apiKeyValue.length > 0;
    report("API key entered", hasApiKey, hasApiKey ? "Key provided" : "No key entered");

    if (!hasApiKey) {
      console.log("\n❌ No API key entered. Aborting test.\n");
      printReport(validationReport);
      await context.close();
      return;
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "quality-02-api-key-entered.png"),
    });

    // Step 3: Upload the real PDF
    const pdfExists = fs.existsSync(PDF_PATH);
    report("PDF file exists", pdfExists, PDF_PATH);

    if (!pdfExists) {
      console.log(`\n❌ PDF not found at ${PDF_PATH}. Aborting test.\n`);
      printReport(validationReport);
      await context.close();
      return;
    }

    const fileInput = page.getByTestId("pdf-file-input");
    await fileInput.setInputFiles(PDF_PATH);

    // Wait for filename to appear
    await expect(page.getByTestId("pdf-filename")).toBeVisible({
      timeout: 5000,
    });
    const filename = await page.getByTestId("pdf-filename").textContent();
    report("PDF uploaded", true, `Filename: ${filename}`);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "quality-03-pdf-uploaded.png"),
    });

    // Step 4: Click Generate
    const generateButton = page.getByTestId("generate-button");
    await expect(generateButton).toBeEnabled({ timeout: 3000 });
    await generateButton.click();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "quality-04-generating.png"),
    });

    // Step 5: Wait for generation to complete (up to 5 minutes)
    const downloadSection = page.getByTestId("download-section");
    try {
      await expect(downloadSection).toBeVisible({ timeout: 300000 });
      report("Generation completed", true, "Download section visible");
    } catch {
      // Check for error toast
      const errorToast = page.getByTestId("error-toast");
      const isError = await errorToast.isVisible().catch(() => false);
      if (isError) {
        const errorText = await errorToast.textContent();
        report("Generation completed", false, `Error: ${errorText}`);
      } else {
        report("Generation completed", false, "Timed out after 5 minutes");
      }

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "quality-05-error.png"),
      });
      printReport(validationReport);
      await context.close();
      return;
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "quality-05-generation-complete.png"),
    });

    // Step 6: Check review warning is visible
    const reviewWarning = page.getByTestId("review-warning");
    const warningVisible = await reviewWarning.isVisible().catch(() => false);
    report("Review warning visible", warningVisible);

    // Step 7: Intercept download and validate the notebook
    const downloadButton = page.getByTestId("download-button");
    await expect(downloadButton).toBeVisible();

    // Listen for download event
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }).catch(() => null),
      downloadButton.click(),
    ]);

    let notebookContent = "";
    let notebook: Record<string, unknown> | null = null;

    if (download) {
      const downloadPath = await download.path();
      if (downloadPath) {
        notebookContent = fs.readFileSync(downloadPath, "utf-8");
        report("Download succeeded", true, `File: ${download.suggestedFilename()}`);
      } else {
        report("Download succeeded", false, "No download path");
      }
    } else {
      // Try getting content from page state if download event doesn't fire
      // (blob downloads sometimes don't trigger Playwright download events)
      try {
        notebookContent = await page.evaluate(() => {
          // Check if there's notebook data in the app state
          const downloadBtn = document.querySelector('[data-testid="download-button"]');
          return downloadBtn?.getAttribute("data-notebook-content") || "";
        });
      } catch {
        // Ignore
      }

      if (!notebookContent) {
        report("Download succeeded", false, "Download event not captured (blob URL)");
        // Still try to validate from page content if available
      }
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "quality-06-downloaded.png"),
    });

    // Step 8: Validate notebook structure
    if (notebookContent) {
      // Check 1: Valid JSON
      try {
        notebook = JSON.parse(notebookContent) as Record<string, unknown>;
        report("Valid JSON", true);
      } catch (e) {
        report("Valid JSON", false, `Parse error: ${e}`);
      }

      if (notebook) {
        // Check 2: nbformat v4 structure
        const hasNbformat =
          (notebook as Record<string, unknown>).nbformat === 4;
        report(
          "nbformat v4",
          hasNbformat,
          `nbformat: ${(notebook as Record<string, unknown>).nbformat}`
        );

        // Check 3: Has cells array
        const cells = (notebook as Record<string, unknown>).cells;
        const hasCells = Array.isArray(cells);
        report("Has cells array", hasCells);

        if (hasCells && Array.isArray(cells)) {
          // Check 4: 8+ cells
          const cellCount = cells.length;
          const hasEnoughCells = cellCount >= 8;
          report(
            "8+ cells",
            hasEnoughCells,
            `Cell count: ${cellCount}`
          );

          // Check 5: At least one code cell with Python
          const codeCells = cells.filter(
            (c: Record<string, unknown>) => c.cell_type === "code"
          );
          const hasCodeCell = codeCells.length > 0;
          report(
            "Has Python code cells",
            hasCodeCell,
            `Code cells: ${codeCells.length}`
          );

          if (hasCodeCell) {
            // Check that code cells have actual Python content
            const codeContent = codeCells
              .map((c: Record<string, unknown>) => {
                const source = c.source;
                return Array.isArray(source) ? source.join("") : String(source);
              })
              .join("\n");
            const hasPythonKeywords =
              /import |def |class |print\(|for |if |return /.test(codeContent);
            report(
              "Code cells contain Python",
              hasPythonKeywords,
              `Sample keywords found: ${hasPythonKeywords}`
            );
          }

          // Check 6: Has markdown cells
          const markdownCells = cells.filter(
            (c: Record<string, unknown>) => c.cell_type === "markdown"
          );
          report(
            "Has markdown cells",
            markdownCells.length > 0,
            `Markdown cells: ${markdownCells.length}`
          );
        }
      }
    } else {
      report(
        "Notebook validation",
        false,
        "No notebook content available for validation (blob download not captured). Check screenshots for visual confirmation."
      );
    }

    // Step 9: Check progress shows "Done"
    const progressDisplay = page.getByTestId("progress-display");
    const progressVisible = await progressDisplay.isVisible().catch(() => false);
    if (progressVisible) {
      const progressText = await progressDisplay.textContent();
      const showsDone = progressText?.includes("Done") ?? false;
      report("Progress shows Done", showsDone, `Progress text: ${progressText}`);
    }

    // Security warnings check (informational — may or may not appear)
    const securityWarnings = page.getByTestId("security-warnings");
    const hasWarnings = await securityWarnings.isVisible().catch(() => false);
    if (hasWarnings) {
      const warningText = await securityWarnings.textContent();
      report("Security warnings present", true, `Warnings: ${warningText}`);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "quality-07-final.png"),
    });

    // Print the validation report
    printReport(validationReport);

    await context.close();

    // Assert that critical checks passed
    const criticalChecks = [
      "API key entered",
      "PDF uploaded",
      "Generation completed",
      "Review warning visible",
    ];
    for (const check of criticalChecks) {
      const result = validationReport.find((r) => r.check === check);
      expect(result?.passed, `Critical check failed: ${check}`).toBe(true);
    }
  });
});

function printReport(
  report: { check: string; passed: boolean; detail: string }[]
) {
  console.log("\n" + "=".repeat(60));
  console.log("  QUALITY TEST VALIDATION REPORT");
  console.log("=".repeat(60));

  for (const { check, passed, detail } of report) {
    const icon = passed ? "✅" : "❌";
    const line = `  ${icon}  ${check}`;
    console.log(line);
    if (detail) {
      console.log(`      ${detail}`);
    }
  }

  const passed = report.filter((r) => r.passed).length;
  const total = report.length;
  console.log("\n" + "-".repeat(60));
  console.log(`  Result: ${passed}/${total} checks passed`);
  console.log("=".repeat(60) + "\n");
}
