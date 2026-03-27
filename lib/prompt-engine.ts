import { SYSTEM_PROMPT } from "./prompts/notebook-system-prompt";
import { buildUserPrompt } from "./prompts/notebook-user-prompt";
import { randomBytes } from "crypto";

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Generates a random boundary token for prompt delimiters.
 * Uses crypto.randomBytes for unpredictability.
 */
function generateBoundaryToken(): string {
  return "PAPER_BOUNDARY_" + randomBytes(8).toString("hex");
}

export function buildPrompt(paperText: string): PromptResult {
  if (!paperText || paperText.trim().length === 0) {
    throw new Error("Paper text cannot be empty");
  }

  const boundaryToken = generateBoundaryToken();

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(paperText, boundaryToken),
  };
}
