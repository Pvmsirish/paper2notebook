import { describe, it, expect, beforeEach } from "vitest";

/**
 * Tests for history store logic.
 * Since IndexedDB isn't available in jsdom, we test the
 * extraction and data-shaping logic separately.
 */
describe("History Store utilities", () => {
  it("extractPaperTitle returns first non-empty line", async () => {
    const { extractPaperTitle } = await import("@/lib/history-store");
    expect(extractPaperTitle("Attention Is All You Need\nAuthors: Vaswani")).toBe(
      "Attention Is All You Need"
    );
  });

  it("extractPaperTitle trims whitespace", async () => {
    const { extractPaperTitle } = await import("@/lib/history-store");
    expect(extractPaperTitle("  Title with spaces  \nLine 2")).toBe(
      "Title with spaces"
    );
  });

  it("extractPaperTitle skips empty lines", async () => {
    const { extractPaperTitle } = await import("@/lib/history-store");
    expect(extractPaperTitle("\n\n\nActual Title\nOther")).toBe("Actual Title");
  });

  it("extractPaperTitle returns fallback for empty text", async () => {
    const { extractPaperTitle } = await import("@/lib/history-store");
    expect(extractPaperTitle("")).toBe("Untitled Paper");
    expect(extractPaperTitle("   \n  \n  ")).toBe("Untitled Paper");
  });

  it("extractPaperTitle truncates long titles", async () => {
    const { extractPaperTitle } = await import("@/lib/history-store");
    const longTitle = "A".repeat(200);
    const result = extractPaperTitle(longTitle);
    expect(result.length).toBeLessThanOrEqual(103); // 100 + "..."
  });

  it("MAX_HISTORY_ENTRIES is 50", async () => {
    const { MAX_HISTORY_ENTRIES } = await import("@/lib/history-store");
    expect(MAX_HISTORY_ENTRIES).toBe(50);
  });

  it("HistoryEntry interface shape is correct", async () => {
    const { createHistoryEntry } = await import("@/lib/history-store");
    const entry = createHistoryEntry({
      fileName: "paper.pdf",
      paperText: "My Paper Title\nAbstract...",
      notebookJson: '{"nbformat": 4}',
      warnings: ["warning1"],
    });

    expect(entry).toHaveProperty("id");
    expect(entry).toHaveProperty("createdAt");
    expect(entry).toHaveProperty("paperTitle");
    expect(entry).toHaveProperty("fileName");
    expect(entry).toHaveProperty("notebookJson");
    expect(entry).toHaveProperty("warnings");

    expect(entry.id).toBeTruthy();
    expect(entry.paperTitle).toBe("My Paper Title");
    expect(entry.fileName).toBe("paper.pdf");
    expect(entry.notebookJson).toBe('{"nbformat": 4}');
    expect(entry.warnings).toEqual(["warning1"]);
    expect(new Date(entry.createdAt).getTime()).not.toBeNaN();
  });
});
