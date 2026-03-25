"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface GenerateButtonProps {
  disabled: boolean;
  loading?: boolean;
  onClick: () => void;
}

export function GenerateButton({
  disabled,
  loading = false,
  onClick,
}: GenerateButtonProps) {
  return (
    <Button
      data-testid="generate-button"
      size="lg"
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {loading ? "Generating..." : "Generate Notebook"}
    </Button>
  );
}
