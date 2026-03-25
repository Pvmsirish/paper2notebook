export interface NotebookCodeCell {
  cell_type: "code";
  source: string[];
  metadata: Record<string, unknown>;
  execution_count: null;
  outputs: unknown[];
}

export interface NotebookMarkdownCell {
  cell_type: "markdown";
  source: string[];
  metadata: Record<string, unknown>;
}

export type NotebookCell = NotebookCodeCell | NotebookMarkdownCell;

export interface NotebookKernelSpec {
  display_name: string;
  language: string;
  name: string;
}

export interface NotebookMetadata {
  kernelspec: NotebookKernelSpec;
  language_info: {
    name: string;
    version: string;
    mimetype: string;
    file_extension: string;
  };
}

export interface Notebook {
  nbformat: 4;
  nbformat_minor: number;
  metadata: NotebookMetadata;
  cells: NotebookCell[];
}
