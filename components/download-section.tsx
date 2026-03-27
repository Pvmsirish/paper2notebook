"use client";

import { Button } from "@/components/ui/button";
import { Download, ShieldAlert } from "lucide-react";
import { downloadNotebook } from "@/lib/colab-link";

interface DownloadSectionProps {
  notebookJson: string;
  filename?: string;
}

export function DownloadSection({
  notebookJson,
  filename = "paper2notebook.ipynb",
}: DownloadSectionProps) {
  const handleDownload = () => {
    downloadNotebook(notebookJson, filename);
  };

  return (
    <div data-testid="download-section" className="w-full space-y-3">
      <p className="text-sm font-medium text-center text-green-600">
        Notebook generated successfully!
      </p>
      <div
        data-testid="review-warning"
        className="flex items-center gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground"
      >
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>Review generated code before running. AI-generated notebooks may contain errors or unexpected behavior.</span>
      </div>
      <Button
        data-testid="download-button"
        onClick={handleDownload}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        Download .ipynb
      </Button>
    </div>
  );
}
