"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface DemoButtonProps {
  disabled?: boolean;
  onLoadSample: (file: File) => void;
}

export function DemoButton({ disabled = false, onLoadSample }: DemoButtonProps) {
  const handleClick = async () => {
    try {
      const response = await fetch("/samples/sample-paper.pdf");
      const blob = await response.blob();
      const file = new File([blob], "sample-paper.pdf", {
        type: "application/pdf",
      });
      onLoadSample(file);
    } catch {
      // Silently fail — the sample is a convenience feature
    }
  };

  return (
    <Button
      data-testid="demo-button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={handleClick}
      className="w-full text-muted-foreground"
    >
      <FileText className="mr-2 h-4 w-4" />
      Try with sample paper
    </Button>
  );
}
