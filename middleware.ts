import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders } from "@/lib/security-headers";
import { parsePdfLimiter, generateLimiter } from "@/lib/rate-limiter";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(request: NextRequest) {
  const securityHeaders = getSecurityHeaders();
  const pathname = request.nextUrl.pathname;

  // CORS: block cross-origin API requests
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin && pathname.startsWith("/api/")) {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return new NextResponse(
        JSON.stringify({ error: "Cross-origin requests are not allowed" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            ...Object.fromEntries(securityHeaders.entries()),
          },
        }
      );
    }
  }

  // Rate limiting on API routes
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const limiter = pathname === "/api/generate" ? generateLimiter : parsePdfLimiter;
    const result = limiter.check(ip);

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.retryAfter || 60),
            ...Object.fromEntries(securityHeaders.entries()),
          },
        }
      );
    }
  }

  // Apply security headers to all responses
  const response = NextResponse.next();
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  // Apply to all routes except static files and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|samples/).*)"],
};
