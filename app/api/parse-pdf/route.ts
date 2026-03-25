import { NextRequest, NextResponse } from "next/server";
import { parsePdf, PdfParseError } from "@/lib/pdf-parser";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file provided. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Check file type
    if (
      file.type !== "application/pdf" &&
      !(file instanceof File && file.name.endsWith(".pdf"))
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await parsePdf(buffer);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PdfParseError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the PDF." },
      { status: 500 }
    );
  }
}
