"use client";

import { GenerateStep, STEP_LABELS } from "@/lib/hooks/use-generate";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ProgressDisplayProps {
  step: GenerateStep;
}

const ORDERED_STEPS = [
  GenerateStep.PARSING,
  GenerateStep.ANALYZING,
  GenerateStep.GENERATING,
  GenerateStep.BUILDING,
];

export function ProgressDisplay({ step }: ProgressDisplayProps) {
  if (step === GenerateStep.IDLE || step === GenerateStep.ERROR) {
    return null;
  }

  const currentIndex = ORDERED_STEPS.indexOf(step);
  const isDone = step === GenerateStep.DONE;

  return (
    <div data-testid="progress-display" className="w-full space-y-3">
      {ORDERED_STEPS.map((s, i) => {
        const isActive = s === step;
        const isComplete = isDone || i < currentIndex;

        return (
          <div key={s} className="flex items-center gap-3 text-sm">
            {isComplete ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            ) : isActive ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
            )}
            <span
              className={
                isActive
                  ? "text-foreground font-medium"
                  : isComplete
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
              }
            >
              {STEP_LABELS[s]}
            </span>
          </div>
        );
      })}
      {isDone && (
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
          <span className="text-green-600 font-medium">
            {STEP_LABELS[GenerateStep.DONE]}
          </span>
        </div>
      )}
    </div>
  );
}
