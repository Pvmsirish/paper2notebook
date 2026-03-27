"use client";

import { useState, useCallback } from "react";

export enum GenerateStep {
  IDLE = "idle",
  PARSING = "parsing",
  ANALYZING = "analyzing",
  GENERATING = "generating",
  BUILDING = "building",
  DONE = "done",
  ERROR = "error",
}

export const STEP_LABELS: Record<string, string> = {
  [GenerateStep.PARSING]: "Parsing PDF...",
  [GenerateStep.ANALYZING]: "Analyzing paper...",
  [GenerateStep.GENERATING]: "Generating notebook...",
  [GenerateStep.BUILDING]: "Building .ipynb...",
  [GenerateStep.DONE]: "Done!",
};

export interface UseGenerateResult {
  step: GenerateStep;
  error: string | null;
  notebookJson: string | null;
  warnings: string[];
  generate: (apiKey: string, file: File) => Promise<void>;
  reset: () => void;
}

export function useGenerate(): UseGenerateResult {
  const [step, setStep] = useState<GenerateStep>(GenerateStep.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [notebookJson, setNotebookJson] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const reset = useCallback(() => {
    setStep(GenerateStep.IDLE);
    setError(null);
    setNotebookJson(null);
    setWarnings([]);
  }, []);

  const generate = useCallback(async (apiKey: string, file: File) => {
    try {
      setError(null);
      setNotebookJson(null);
      setWarnings([]);

      // Step 1: Parse PDF
      setStep(GenerateStep.PARSING);
      const formData = new FormData();
      formData.append("file", file);
      const parseRes = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!parseRes.ok) {
        const text = await parseRes.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.error || "Failed to parse PDF");
        } catch (e) {
          if (e instanceof SyntaxError) {
            throw new Error("Failed to parse PDF — server returned an unexpected response");
          }
          throw e;
        }
      }

      const { text: paperText } = await parseRes.json();

      // Step 2: Analyze (sent to generate endpoint)
      setStep(GenerateStep.ANALYZING);

      // Step 3: Generate notebook via OpenAI
      setStep(GenerateStep.GENERATING);
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ paperText }),
      });

      if (!generateRes.ok) {
        const text = await generateRes.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.error || "Failed to generate notebook");
        } catch (e) {
          if (e instanceof SyntaxError) {
            throw new Error("Failed to generate notebook — server returned an unexpected response");
          }
          throw e;
        }
      }

      const { content, warnings: apiWarnings } = await generateRes.json();

      // Step 4: Build .ipynb
      setStep(GenerateStep.BUILDING);

      // Import dynamically to keep the hook file small
      const { buildNotebook } = await import("@/lib/notebook-builder");
      const notebook = buildNotebook(content);
      const json = JSON.stringify(notebook, null, 2);

      const finalWarnings = apiWarnings || [];
      setNotebookJson(json);
      setWarnings(finalWarnings);
      setStep(GenerateStep.DONE);

      // Save to history (fire and forget — don't block on IndexedDB)
      import("@/lib/history-store").then(({ createHistoryEntry, saveHistoryEntry }) => {
        const entry = createHistoryEntry({
          fileName: file.name,
          paperText: paperText,
          notebookJson: json,
          warnings: finalWarnings,
        });
        saveHistoryEntry(entry).catch(() => {
          // IndexedDB save failed — non-critical
        });
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setStep(GenerateStep.ERROR);
    }
  }, []);

  return { step, error, notebookJson, warnings, generate, reset };
}
