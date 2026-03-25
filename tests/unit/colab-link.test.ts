import { describe, it, expect } from "vitest";
import { generateColabUrl } from "@/lib/colab-link";

describe("generateColabUrl", () => {
  it("returns a colab URL with base64-encoded notebook", () => {
    const notebookJson = JSON.stringify({ nbformat: 4, cells: [] });
    const url = generateColabUrl(notebookJson);
    expect(url).toContain("colab.research.google.com");
  });

  it("throws for empty input", () => {
    expect(() => generateColabUrl("")).toThrow();
  });

  it("returns a valid URL string", () => {
    const notebookJson = JSON.stringify({ nbformat: 4, cells: [] });
    const url = generateColabUrl(notebookJson);
    expect(() => new URL(url)).not.toThrow();
  });
});
