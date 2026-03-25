import { describe, it, expect } from "vitest";
import { generateNotebook } from "@/lib/openai-client";

describe("OpenAI Client", () => {
  describe("generateNotebook input validation", () => {
    it("throws for empty paper text", async () => {
      await expect(
        generateNotebook({ apiKey: "sk-test", paperText: "" })
      ).rejects.toThrow(/paper text/i);
    });

    it("throws for whitespace-only paper text", async () => {
      await expect(
        generateNotebook({ apiKey: "sk-test", paperText: "   " })
      ).rejects.toThrow(/paper text/i);
    });

    it("throws for empty API key", async () => {
      await expect(
        generateNotebook({ apiKey: "", paperText: "some paper text" })
      ).rejects.toThrow(/api key/i);
    });

    it("throws for whitespace-only API key", async () => {
      await expect(
        generateNotebook({ apiKey: "   ", paperText: "some paper text" })
      ).rejects.toThrow(/api key/i);
    });
  });
});
