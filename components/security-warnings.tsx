"use client";

import { AlertTriangle } from "lucide-react";

interface SecurityWarningsProps {
  warnings: string[];
}

export function SecurityWarnings({ warnings }: SecurityWarningsProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div
      data-testid="security-warnings"
      className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm"
    >
      <div className="flex items-center gap-2 font-medium text-yellow-700 dark:text-yellow-400 mb-2">
        <AlertTriangle className="h-4 w-4" />
        Security warnings ({warnings.length})
      </div>
      <p className="text-yellow-700/80 dark:text-yellow-400/80 mb-2">
        The generated notebook contains potentially dangerous code patterns.
        Review carefully before running.
      </p>
      <ul className="list-disc list-inside space-y-1 text-yellow-700/70 dark:text-yellow-400/70 text-xs">
        {warnings.map((warning, i) => (
          <li key={i}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}
