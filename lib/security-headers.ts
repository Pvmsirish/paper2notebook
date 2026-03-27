/**
 * Returns a Headers object with all security headers for the application.
 */
export function getSecurityHeaders(): Headers {
  const headers = new Headers();

  const isDev = process.env.NODE_ENV === "development";

  // Restrict resource loading to same-origin + inline styles (needed for Tailwind)
  // In development, Next.js HMR requires 'unsafe-eval' and ws: connections
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      isDev ? "connect-src 'self' ws:" : "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Prevent framing (clickjacking)
  headers.set("X-Frame-Options", "DENY");

  // Control referrer information
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict browser features
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  // Enforce HTTPS
  headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Allow DNS prefetching for performance
  headers.set("X-DNS-Prefetch-Control", "on");

  return headers;
}
