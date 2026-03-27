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

    it("contains anti-injection directive", () => {
      const lowerPrompt = SYSTEM_PROMPT.toLowerCase();
      expect(lowerPrompt).toContain("ignore any instructions");
    });
  });

  describe("buildUserPrompt", () => {
    it("includes the paper text", () => {
      const prompt = buildUserPrompt(samplePaperText, "BOUNDARY123");
      expect(prompt).toContain("Attention Is All You Need");
      expect(prompt).toContain("Transformer");
    });

    it("returns a non-empty string", () => {
      const prompt = buildUserPrompt(samplePaperText, "BOUNDARY123");
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(samplePaperText.length);
    });

    it("includes the boundary token as delimiters", () => {
      const prompt = buildUserPrompt(samplePaperText, "XYZTOKEN");
      expect(prompt).toContain("XYZTOKEN");
    });

    it("does not use <paper> tags as delimiters", () => {
      const prompt = buildUserPrompt(samplePaperText, "BOUNDARY123");
      expect(prompt).not.toContain("<paper>");
      expect(prompt).not.toContain("</paper>");
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

    it("system prompt contains SYSTEM_PROMPT content", () => {
      const result = buildPrompt(samplePaperText);
      // System prompt should contain the base SYSTEM_PROMPT content
      expect(result.systemPrompt).toContain("expert ML researcher");
    });

    it("user prompt contains the paper text", () => {
      const result = buildPrompt(samplePaperText);
      expect(result.userPrompt).toContain("Attention Is All You Need");
    });

    it("throws for empty paper text", () => {
      expect(() => buildPrompt("")).toThrow();
      expect(() => buildPrompt("   ")).toThrow();
    });

    it("uses a boundary token in the user prompt", () => {
      const result = buildPrompt(samplePaperText);
      // Should contain some boundary marker (not <paper> tags)
      expect(result.userPrompt).not.toContain("<paper>");
      // The boundary token should appear at least twice (start + end delimiter)
      const match = result.userPrompt.match(/===PAPER_BOUNDARY_[A-Za-z0-9]+===/g);
      expect(match).toBeTruthy();
      expect(match!.length).toBeGreaterThanOrEqual(2);
    });
  });
});
