import pdfParse from "pdf-parse";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export class PdfParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfParseError";
  }
}

export interface PdfParseResult {
  text: string;
  numPages: number;
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  if (!buffer || buffer.length === 0) {
    throw new PdfParseError("Empty file provided");
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new PdfParseError(
      `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  try {
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new PdfParseError(
        "No text content could be extracted from the PDF"
      );
    }

    return {
      text: data.text,
      numPages: data.numpages,
    };
  } catch (error) {
    if (error instanceof PdfParseError) {
      throw error;
    }
    throw new PdfParseError(
      "Failed to parse PDF. The file may be corrupted or invalid."
    );
  }
}
