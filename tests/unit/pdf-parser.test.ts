import { describe, it, expect } from "vitest";
import { parsePdf, PdfParseError } from "@/lib/pdf-parser";
import fs from "fs";
import path from "path";

// pdf-parse requires a structurally valid PDF, so we test with an actual one if available
// For basic testing, we focus on error handling paths

describe("parsePdf", () => {
  it("throws PdfParseError for empty buffer", async () => {
    const buffer = Buffer.from("");
    await expect(parsePdf(buffer)).rejects.toThrow(PdfParseError);
    await expect(parsePdf(buffer)).rejects.toThrow(/empty/i);
  });

  it("throws PdfParseError for invalid file content", async () => {
    const buffer = Buffer.from("this is not a pdf file at all");
    await expect(parsePdf(buffer)).rejects.toThrow(PdfParseError);
  });

  it("throws PdfParseError for buffer exceeding max size", async () => {
    const maxSize = 20 * 1024 * 1024;
    const buffer = Buffer.alloc(maxSize + 1);
    await expect(parsePdf(buffer)).rejects.toThrow(PdfParseError);
    await expect(parsePdf(buffer)).rejects.toThrow(/too large/i);
  });

  it("returns text and numPages for a valid PDF", async () => {
    // Use pdf-parse's own test PDF if available
    const testPdfPath = path.join(
      process.cwd(),
      "node_modules",
      "pdf-parse",
      "test",
      "data",
      "05-versions-space.pdf"
    );

    if (!fs.existsSync(testPdfPath)) {
      // Skip if test PDF not available
      return;
    }

    const buffer = fs.readFileSync(testPdfPath);
    const result = await parsePdf(buffer);

    expect(result).toHaveProperty("text");
    expect(typeof result.text).toBe("string");
    expect(result.text.length).toBeGreaterThan(0);
    expect(result).toHaveProperty("numPages");
    expect(result.numPages).toBeGreaterThanOrEqual(1);
  });
});
