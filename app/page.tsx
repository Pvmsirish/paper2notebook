"use client";

import * as React from "react";
import { ApiKeyInput } from "@/components/api-key-input";
import { PdfUpload } from "@/components/pdf-upload";
import { GenerateButton } from "@/components/generate-button";

export default function Home() {
  const [apiKey, setApiKey] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  const canGenerate = apiKey.trim().length > 0 && file !== null;

  const handleGenerate = () => {
    // Will be wired up in Task 7
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
          <GenerateButton disabled={!canGenerate} onClick={handleGenerate} />
        </div>
      </div>
    </main>
  );
}
