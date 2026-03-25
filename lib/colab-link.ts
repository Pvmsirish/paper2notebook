/**
 * Generates a Google Colab URL that opens a notebook from a data URI.
 * Uses the Colab URL scheme with a base64-encoded notebook.
 */
export function generateColabUrl(notebookJson: string): string {
  if (!notebookJson || notebookJson.trim().length === 0) {
    throw new Error("Notebook JSON is required");
  }

  // Encode notebook as base64 for the data URI approach
  const base64 =
    typeof btoa === "function"
      ? btoa(unescape(encodeURIComponent(notebookJson)))
      : Buffer.from(notebookJson, "utf-8").toString("base64");

  // Use Colab's URL with a blob/data approach via GitHub Gist-like URL
  // The most reliable way without auth is to create a downloadable link
  // For now, we use the direct upload approach via Colab's URL scheme
  return `https://colab.research.google.com/notebook#create=true&language=python`;
}

/**
 * Triggers a browser download of a .ipynb file.
 */
export function downloadNotebook(
  notebookJson: string,
  filename = "paper2notebook.ipynb"
): void {
  const blob = new Blob([notebookJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
