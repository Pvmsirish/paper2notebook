import { describe, it, expect } from "vitest";
import {
  buildNotebook,
  parseResponseToCells,
} from "@/lib/notebook-builder";
import type { NotebookCell, Notebook } from "@/lib/types/notebook";

const sampleResponse = `\`\`\`markdown
# Paper Metadata
Title: Attention Is All You Need
Authors: Vaswani et al.
\`\`\`

\`\`\`python
import torch
import torch.nn as nn
\`\`\`

\`\`\`markdown
## Key Contributions
- Introduced the Transformer architecture
- Self-attention mechanism
\`\`\`

\`\`\`python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
\`\`\`

Some text outside code blocks should be treated as markdown.

\`\`\`python
x = torch.randn(2, 3)
print(x)
\`\`\``;

describe("parseResponseToCells", () => {
  it("parses markdown fenced blocks into cells", () => {
    const cells = parseResponseToCells(sampleResponse);
    expect(cells.length).toBeGreaterThanOrEqual(5);
  });

  it("correctly identifies markdown cells", () => {
    const cells = parseResponseToCells(sampleResponse);
    const markdownCells = cells.filter((c) => c.cell_type === "markdown");
    expect(markdownCells.length).toBeGreaterThanOrEqual(2);
  });

  it("correctly identifies code cells", () => {
    const cells = parseResponseToCells(sampleResponse);
    const codeCells = cells.filter((c) => c.cell_type === "code");
    expect(codeCells.length).toBeGreaterThanOrEqual(3);
  });

  it("preserves cell content", () => {
    const cells = parseResponseToCells(sampleResponse);
    const codeCells = cells.filter((c) => c.cell_type === "code");
    const hasImport = codeCells.some((c) =>
      c.source.some((line) => line.includes("import torch"))
    );
    expect(hasImport).toBe(true);
  });

  it("source lines end with newline except the last", () => {
    const cells = parseResponseToCells(sampleResponse);
    for (const cell of cells) {
      if (cell.source.length > 1) {
        for (let i = 0; i < cell.source.length - 1; i++) {
          expect(cell.source[i]).toMatch(/\n$/);
        }
      }
    }
  });

  it("handles empty input", () => {
    const cells = parseResponseToCells("");
    expect(cells).toEqual([]);
  });
});

describe("buildNotebook", () => {
  it("returns a valid nbformat v4 notebook", () => {
    const notebook = buildNotebook(sampleResponse);
    expect(notebook.nbformat).toBe(4);
    expect(notebook.nbformat_minor).toBeGreaterThanOrEqual(0);
  });

  it("has metadata with python kernel", () => {
    const notebook = buildNotebook(sampleResponse);
    expect(notebook.metadata.kernelspec.language).toBe("python");
    expect(notebook.metadata.kernelspec.name).toBe("python3");
  });

  it("has cells array", () => {
    const notebook = buildNotebook(sampleResponse);
    expect(Array.isArray(notebook.cells)).toBe(true);
    expect(notebook.cells.length).toBeGreaterThan(0);
  });

  it("code cells have execution_count and outputs", () => {
    const notebook = buildNotebook(sampleResponse);
    const codeCells = notebook.cells.filter(
      (c: NotebookCell) => c.cell_type === "code"
    );
    for (const cell of codeCells) {
      expect(cell).toHaveProperty("execution_count", null);
      expect(cell).toHaveProperty("outputs");
      expect(Array.isArray(cell.outputs)).toBe(true);
    }
  });

  it("markdown cells do not have execution_count", () => {
    const notebook = buildNotebook(sampleResponse);
    const mdCells = notebook.cells.filter(
      (c: NotebookCell) => c.cell_type === "markdown"
    );
    for (const cell of mdCells) {
      expect(cell).not.toHaveProperty("execution_count");
      expect(cell).not.toHaveProperty("outputs");
    }
  });

  it("produces valid JSON", () => {
    const notebook = buildNotebook(sampleResponse);
    const json = JSON.stringify(notebook);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("throws for empty response", () => {
    expect(() => buildNotebook("")).toThrow();
  });
});
