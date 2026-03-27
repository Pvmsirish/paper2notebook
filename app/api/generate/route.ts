import { NextRequest, NextResponse } from "next/server";
import { generateNotebook } from "@/lib/openai-client";
import { sanitizeInput } from "@/lib/sanitize-input";
import { scanOutput } from "@/lib/scan-output";

const MAX_PAPER_LENGTH = 100_000;

export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "API key is required. Pass it via Authorization: Bearer <key>" },
        { status: 401 }
      );
    }
    const apiKey = authHeader.slice(7).trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { paperText } = body;

    if (!paperText || typeof paperText !== "string" || paperText.trim().length === 0) {
      return NextResponse.json(
        { error: "Paper text is required" },
        { status: 400 }
      );
    }

    // Enforce paper text length limit
    if (paperText.length > MAX_PAPER_LENGTH) {
      return NextResponse.json(
        { error: "Paper text is too long. Maximum 100,000 characters supported." },
        { status: 400 }
      );
    }

    // Layer 1: Sanitize input to mitigate prompt injection
    const { sanitized } = sanitizeInput(paperText);

    // Generate notebook with sanitized text
    const content = await generateNotebook({ apiKey, paperText: sanitized });

    // Layer 3: Scan output for dangerous patterns
    const { warnings } = scanOutput(content);

    return NextResponse.json({ content, warnings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";

    // Handle specific OpenAI errors — return generic messages only
    if (message.includes("401") || message.includes("Incorrect API key")) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your OpenAI API key." },
        { status: 401 }
      );
    }
    if (message.includes("429") || message.includes("Rate limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }

    // Generic error — never leak internal details
    console.error("Generate error:", message);
    return NextResponse.json(
      { error: "Failed to generate notebook. Please try again." },
      { status: 500 }
    );
  }
}
