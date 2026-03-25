import { describe, it, expect } from "vitest";
import { parsePdf, PdfParseError } from "@/lib/pdf-parser";
import fs from "fs";
import path from "path";

// Integration tests for the parse-pdf API logic
// We test the core parsing logic that the API route delegates to,
// since NextRequest.formData() doesn't work in vitest/jsdom

describe("PDF parse API logic", () => {
  it("returns text and page count for a valid PDF", async () => {
    const testPdfPath = path.join(
      process.cwd(),
      "node_modules",
      "pdf-parse",
      "test",
      "data",
      "05-versions-space.pdf"
    );

    if (!fs.existsSync(testPdfPath)) {
      return;
    }

    const buffer = fs.readFileSync(testPdfPath);
    const result = await parsePdf(buffer);

    expect(result.text).toBeTruthy();
    expect(result.numPages).toBeGreaterThanOrEqual(1);
  });

  it("rejects empty input", async () => {
    await expect(parsePdf(Buffer.from(""))).rejects.toThrow(PdfParseError);
  });

  it("rejects non-PDF content", async () => {
    await expect(parsePdf(Buffer.from("hello world"))).rejects.toThrow(
      PdfParseError
    );
  });

  it("rejects oversized files", async () => {
    const oversized = Buffer.alloc(20 * 1024 * 1024 + 1);
    await expect(parsePdf(oversized)).rejects.toThrow(/too large/i);
  });

  it("PdfParseError has correct name", () => {
    const err = new PdfParseError("test");
    expect(err.name).toBe("PdfParseError");
    expect(err.message).toBe("test");
    expect(err instanceof Error).toBe(true);
  });
});
