"use client";

import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { downloadNotebook, generateColabUrl } from "@/lib/colab-link";

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

  const handleOpenColab = () => {
    const url = generateColabUrl(notebookJson);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div data-testid="download-section" className="w-full space-y-3">
      <p className="text-sm font-medium text-center text-green-600">
        Notebook generated successfully!
      </p>
      <div className="flex gap-3">
        <Button
          data-testid="download-button"
          onClick={handleDownload}
          className="flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Download .ipynb
        </Button>
        <Button
          data-testid="colab-button"
          variant="outline"
          onClick={handleOpenColab}
          className="flex-1"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Colab
        </Button>
      </div>
    </div>
  );
}
