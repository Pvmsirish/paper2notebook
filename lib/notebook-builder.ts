import type {
  Notebook,
  NotebookCell,
  NotebookCodeCell,
  NotebookMarkdownCell,
} from "./types/notebook";

/**
 * Splits source text into notebook-compatible source array.
 * Each line ends with \n except the last.
 */
function toSourceArray(text: string): string[] {
  if (!text) return [];
  const lines = text.split("\n");
  return lines.map((line, i) => (i < lines.length - 1 ? line + "\n" : line));
}

/**
 * Parses LLM response into notebook cells.
 * Recognizes ```markdown and ```python fenced blocks.
 * Text outside blocks is treated as markdown.
 */
export function parseResponseToCells(
  response: string
): (NotebookCodeCell | NotebookMarkdownCell)[] {
  if (!response || response.trim().length === 0) return [];

  const cells: NotebookCell[] = [];
  const lines = response.split("\n");
  let i = 0;
  let pendingMarkdown = "";

  while (i < lines.length) {
    const line = lines[i];

    // Check for fenced code block start
    const fenceMatch = line.match(/^```(\w+)\s*$/);
    if (fenceMatch) {
      // Flush any pending markdown
      if (pendingMarkdown.trim()) {
        cells.push(createMarkdownCell(pendingMarkdown.trim()));
        pendingMarkdown = "";
      }

      const lang = fenceMatch[1].toLowerCase();
      const blockLines: string[] = [];
      i++;

      // Collect lines until closing fence
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        blockLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```

      const content = blockLines.join("\n");
      if (content.trim()) {
        if (lang === "python" || lang === "py") {
          cells.push(createCodeCell(content));
        } else {
          cells.push(createMarkdownCell(content));
        }
      }
    } else {
      pendingMarkdown += line + "\n";
      i++;
    }
  }

  // Flush remaining markdown
  if (pendingMarkdown.trim()) {
    cells.push(createMarkdownCell(pendingMarkdown.trim()));
  }

  return cells;
}

function createCodeCell(source: string): NotebookCodeCell {
  return {
    cell_type: "code",
    source: toSourceArray(source),
    metadata: {},
    execution_count: null,
    outputs: [],
  };
}

function createMarkdownCell(source: string): NotebookMarkdownCell {
  return {
    cell_type: "markdown",
    source: toSourceArray(source),
    metadata: {},
  };
}

/**
 * Builds a complete nbformat v4 notebook from an LLM response string.
 */
export function buildNotebook(response: string): Notebook {
  if (!response || response.trim().length === 0) {
    throw new Error("Cannot build notebook from empty response");
  }

  const cells = parseResponseToCells(response);

  if (cells.length === 0) {
    throw new Error("No cells could be parsed from the response");
  }

  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3",
      },
      language_info: {
        name: "python",
        version: "3.10.0",
        mimetype: "text/x-python",
        file_extension: ".py",
      },
    },
    cells,
  };
}
