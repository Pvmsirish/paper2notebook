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
