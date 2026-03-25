import { NextRequest, NextResponse } from "next/server";
import { generateNotebook } from "@/lib/openai-client";

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

    const content = await generateNotebook({ apiKey, paperText });

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Handle specific OpenAI errors
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

    return NextResponse.json(
      { error: "Failed to generate notebook. " + message },
      { status: 500 }
    );
  }
}
