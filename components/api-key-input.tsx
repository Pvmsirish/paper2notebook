"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  const [showKey, setShowKey] = React.useState(false);

  return (
    <div className="space-y-2 w-full">
      <label
        htmlFor="api-key"
        className="text-sm font-medium leading-none text-left block"
      >
        OpenAI API Key
      </label>
      <div className="relative">
        <input
          id="api-key"
          data-testid="api-key-input"
          type={showKey ? "text" : "password"}
          placeholder="sk-..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "pr-10"
          )}
        />
        <button
          type="button"
          data-testid="api-key-toggle"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          aria-label={showKey ? "Hide API key" : "Show API key"}
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-muted-foreground text-left">
        Your key stays in your browser and is never stored on our servers.
      </p>
    </div>
  );
}
