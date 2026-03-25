import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/generate/route";
import { NextRequest } from "next/server";

describe("POST /api/generate", () => {
  it("returns 401 when no Authorization header", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paperText: "some paper text" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toMatch(/api key/i);
  });

  it("returns 400 when no paperText provided", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk-test-key",
      },
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/paper text/i);
  });

  it("returns 400 when paperText is empty", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk-test-key",
      },
      body: JSON.stringify({ paperText: "   " }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
