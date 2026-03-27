import { describe, it, expect } from "vitest";

/**
 * Integration tests for security headers and CORS middleware.
 * These test the middleware logic directly since we can't easily
 * spin up a full Next.js server in vitest.
 */

// We test the header-setting logic by importing the helper
// and verifying it produces correct headers.
describe("Security Headers", () => {
  it("sets Content-Security-Policy header", async () => {
    const { getSecurityHeaders } = await import("@/lib/security-headers");
    const headers = getSecurityHeaders();
    const csp = headers.get("Content-Security-Policy");
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src");
  });

  it("sets X-Content-Type-Options to nosniff", async () => {
    const { getSecurityHeaders } = await import("@/lib/security-headers");
    const headers = getSecurityHeaders();
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets X-Frame-Options to DENY", async () => {
    const { getSecurityHeaders } = await import("@/lib/security-headers");
    const headers = getSecurityHeaders();
    expect(headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("sets Referrer-Policy", async () => {
    const { getSecurityHeaders } = await import("@/lib/security-headers");
    const headers = getSecurityHeaders();
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("sets Permissions-Policy", async () => {
    const { getSecurityHeaders } = await import("@/lib/security-headers");
    const headers = getSecurityHeaders();
    const pp = headers.get("Permissions-Policy");
    expect(pp).toBeTruthy();
    expect(pp).toContain("camera=()");
    expect(pp).toContain("microphone=()");
  });

  it("sets Strict-Transport-Security", async () => {
    const { getSecurityHeaders } = await import("@/lib/security-headers");
    const headers = getSecurityHeaders();
    const hsts = headers.get("Strict-Transport-Security");
    expect(hsts).toBeTruthy();
    expect(hsts).toContain("max-age=");
  });

  it("sets X-DNS-Prefetch-Control", async () => {
    const { getSecurityHeaders } = await import("@/lib/security-headers");
    const headers = getSecurityHeaders();
    expect(headers.get("X-DNS-Prefetch-Control")).toBe("on");
  });
});
