import { describe, it, expect } from "vitest";
import { buildPrompt } from "@/lib/prompt-engine";
import { SYSTEM_PROMPT } from "@/lib/prompts/notebook-system-prompt";
import { buildUserPrompt } from "@/lib/prompts/notebook-user-prompt";

const samplePaperText = `
Title: Attention Is All You Need
Authors: Vaswani et al.
Abstract: The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...
We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.
`;

describe("Prompt Engine", () => {
  describe("SYSTEM_PROMPT", () => {
    it("is a non-empty string", () => {
      expect(typeof SYSTEM_PROMPT).toBe("string");
      expect(SYSTEM_PROMPT.length).toBeGreaterThan(100);
    });

    it("mentions all 9 notebook sections", () => {
      const sections = [
        "metadata",
        "contributions",
        "prerequisites",
        "math",
        "implementation",
        "synthetic data",
        "experiments",
        "ablation",
        "reproducibility",
      ];
      const lowerPrompt = SYSTEM_PROMPT.toLowerCase();
      for (const section of sections) {
        expect(lowerPrompt).toContain(section);
      }
    });
  });

  describe("buildUserPrompt", () => {
    it("includes the paper text", () => {
      const prompt = buildUserPrompt(samplePaperText);
      expect(prompt).toContain("Attention Is All You Need");
      expect(prompt).toContain("Transformer");
    });

    it("returns a non-empty string", () => {
      const prompt = buildUserPrompt(samplePaperText);
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(samplePaperText.length);
    });
  });

  describe("buildPrompt", () => {
    it("returns system and user messages", () => {
      const result = buildPrompt(samplePaperText);
      expect(result).toHaveProperty("systemPrompt");
      expect(result).toHaveProperty("userPrompt");
      expect(typeof result.systemPrompt).toBe("string");
      expect(typeof result.userPrompt).toBe("string");
    });

    it("system prompt matches SYSTEM_PROMPT constant", () => {
      const result = buildPrompt(samplePaperText);
      expect(result.systemPrompt).toBe(SYSTEM_PROMPT);
    });

    it("user prompt contains the paper text", () => {
      const result = buildPrompt(samplePaperText);
      expect(result.userPrompt).toContain("Attention Is All You Need");
    });

    it("throws for empty paper text", () => {
      expect(() => buildPrompt("")).toThrow();
      expect(() => buildPrompt("   ")).toThrow();
    });
  });
});
