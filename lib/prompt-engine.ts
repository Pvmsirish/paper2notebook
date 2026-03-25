import { SYSTEM_PROMPT } from "./prompts/notebook-system-prompt";
import { buildUserPrompt } from "./prompts/notebook-user-prompt";

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
}

export function buildPrompt(paperText: string): PromptResult {
  if (!paperText || paperText.trim().length === 0) {
    throw new Error("Paper text cannot be empty");
  }

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(paperText),
  };
}
