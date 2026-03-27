"use client";

import * as React from "react";
import { ApiKeyInput } from "@/components/api-key-input";
import { PdfUpload } from "@/components/pdf-upload";
import { GenerateButton } from "@/components/generate-button";
import { ProgressDisplay } from "@/components/progress-display";
import { DownloadSection } from "@/components/download-section";
import { DemoButton } from "@/components/demo-button";
import { SecurityWarnings } from "@/components/security-warnings";
import { HistoryPanel } from "@/components/history-panel";
import { useGenerate, GenerateStep } from "@/lib/hooks/use-generate";
import { X } from "lucide-react";

export default function Home() {
  const [apiKey, setApiKey] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const { step, error, notebookJson, warnings, generate, reset } =
    useGenerate();

  const isProcessing =
    step !== GenerateStep.IDLE &&
    step !== GenerateStep.DONE &&
    step !== GenerateStep.ERROR;
  const canGenerate =
    apiKey.trim().length > 0 && file !== null && !isProcessing;

  const handleGenerate = async () => {
    if (!file || !apiKey.trim()) return;
    await generate(apiKey, file);
  };

  const handleDismissError = () => {
    reset();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1
            data-testid="app-title"
            className="text-4xl font-bold tracking-tight"
          >
            Paper2Notebook
          </h1>
          <p
            data-testid="app-description"
            className="text-lg text-muted-foreground"
          >
            Upload a research paper PDF and generate a production-quality
            Jupyter notebook that implements the paper&apos;s core algorithms.
          </p>
        </div>

        <div className="space-y-6">
          <ApiKeyInput value={apiKey} onChange={setApiKey} />
          <PdfUpload file={file} onFileChange={setFile} />
          <DemoButton
            disabled={isProcessing}
            onLoadSample={setFile}
          />
          <GenerateButton
            disabled={!canGenerate}
            loading={isProcessing}
            onClick={handleGenerate}
          />

          {(isProcessing || step === GenerateStep.DONE) && (
            <ProgressDisplay step={step} />
          )}

          {step === GenerateStep.DONE && warnings.length > 0 && (
            <SecurityWarnings warnings={warnings} />
          )}

          {step === GenerateStep.DONE && notebookJson && (
            <DownloadSection notebookJson={notebookJson} />
          )}

          <HistoryPanel />

          {error && (
            <div
              data-testid="error-toast"
              className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <p className="flex-1">{error}</p>
              <button
                onClick={handleDismissError}
                className="shrink-0 text-destructive/70 hover:text-destructive"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
