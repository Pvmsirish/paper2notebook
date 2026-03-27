"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Clock } from "lucide-react";
import { downloadNotebook } from "@/lib/colab-link";
import {
  getHistoryEntries,
  clearHistory,
  type HistoryEntry,
} from "@/lib/history-store";

export function HistoryPanel() {
  const [entries, setEntries] = React.useState<HistoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadEntries = React.useCallback(async () => {
    try {
      const items = await getHistoryEntries();
      setEntries(items);
    } catch {
      // IndexedDB not available — silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleClear = async () => {
    await clearHistory();
    setEntries([]);
  };

  const handleDownload = (entry: HistoryEntry) => {
    const safeName = entry.paperTitle
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 50);
    downloadNotebook(entry.notebookJson, `${safeName}.ipynb`);
  };

  if (loading) return null;
  if (entries.length === 0) return null;

  return (
    <div data-testid="history-panel" className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          Recent Notebooks ({entries.length})
        </div>
        <Button
          data-testid="clear-history"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-xs text-muted-foreground"
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Clear
        </Button>
      </div>

      <div className="space-y-2">
        {entries.slice(0, 10).map((entry) => (
          <div
            key={entry.id}
            data-testid="history-entry"
            className="flex items-center gap-3 rounded-md border p-3 text-sm"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{entry.paperTitle}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleDateString()} &middot;{" "}
                {entry.fileName}
                {entry.warnings.length > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400 ml-1">
                    ({entry.warnings.length} warning
                    {entry.warnings.length > 1 ? "s" : ""})
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(entry)}
              aria-label={`Download ${entry.paperTitle}`}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
