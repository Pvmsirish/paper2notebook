"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface GenerateButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function GenerateButton({ disabled, onClick }: GenerateButtonProps) {
  return (
    <Button
      data-testid="generate-button"
      size="lg"
      disabled={disabled}
      onClick={onClick}
      className="w-full"
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Generate Notebook
    </Button>
  );
}
