import OpenAI from "openai";
import { buildPrompt } from "./prompt-engine";

export function createOpenAIClient(apiKey: string): OpenAI {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("API key is required");
  }
  return new OpenAI({ apiKey: apiKey.trim() });
}

export interface GenerateOptions {
  apiKey: string;
  paperText: string;
}

export async function generateNotebook({
  apiKey,
  paperText,
}: GenerateOptions): Promise<string> {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("API key is required");
  }
  if (!paperText || paperText.trim().length === 0) {
    throw new Error("Paper text is required");
  }

  const client = createOpenAIClient(apiKey);
  const { systemPrompt, userPrompt } = buildPrompt(paperText);

  const response = await client.chat.completions.create({
    model: "gpt-5.4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_completion_tokens: 16000,
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response generated from the model");
  }

  return content;
}
