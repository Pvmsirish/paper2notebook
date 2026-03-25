"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, X } from "lucide-react";

interface PdfUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function PdfUpload({ file, onFileChange }: PdfUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      onFileChange(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    onFileChange(selectedFile);
  };

  const handleRemove = () => {
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="text-sm font-medium leading-none text-left block">
        Research Paper (PDF)
      </label>
      <div
        data-testid="pdf-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/50 hover:bg-accent/50",
          file && "border-primary/30 bg-primary/5"
        )}
      >
        {file ? (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-5 w-5 text-primary" />
            <span data-testid="pdf-filename" className="font-medium">
              {file.name}
            </span>
            <button
              type="button"
              data-testid="pdf-remove"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="text-muted-foreground hover:text-destructive p-1"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p className="text-sm">
              <span className="font-medium text-primary">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-xs">PDF files only (max 20MB)</p>
          </div>
        )}
        <input
          ref={inputRef}
          data-testid="pdf-file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
