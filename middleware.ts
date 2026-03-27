import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders } from "@/lib/security-headers";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers to all responses
  const securityHeaders = getSecurityHeaders();
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  // CORS: restrict to same-origin only
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin) {
    // Only allow same-origin requests
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      // Cross-origin request — block on API routes
      if (request.nextUrl.pathname.startsWith("/api/")) {
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
  }

  return response;
}

export const config = {
  // Apply to all routes except static files and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|samples/).*)"],
};
