import { describe, it, expect, beforeEach, vi } from "vitest";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests under the limit", async () => {
    const { RateLimiter } = await import("@/lib/rate-limiter");
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });

    for (let i = 0; i < 5; i++) {
      expect(limiter.check("127.0.0.1")).toEqual({ allowed: true, remaining: 5 - i - 1 });
    }
  });

  it("blocks requests over the limit", async () => {
    const { RateLimiter } = await import("@/lib/rate-limiter");
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 60000 });

    // Use up the limit
    limiter.check("127.0.0.1");
    limiter.check("127.0.0.1");
    limiter.check("127.0.0.1");

    const result = limiter.check("127.0.0.1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different IPs independently", async () => {
    const { RateLimiter } = await import("@/lib/rate-limiter");
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });

    limiter.check("1.1.1.1");
    limiter.check("1.1.1.1");
    expect(limiter.check("1.1.1.1").allowed).toBe(false);

    // Different IP should still be allowed
    expect(limiter.check("2.2.2.2").allowed).toBe(true);
  });

  it("resets after the time window", async () => {
    const { RateLimiter } = await import("@/lib/rate-limiter");
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });

    limiter.check("127.0.0.1");
    limiter.check("127.0.0.1");
    expect(limiter.check("127.0.0.1").allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(61000);

    expect(limiter.check("127.0.0.1").allowed).toBe(true);
  });

  it("returns retryAfter when blocked", async () => {
    const { RateLimiter } = await import("@/lib/rate-limiter");
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

    limiter.check("127.0.0.1");
    const result = limiter.check("127.0.0.1");

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeDefined();
    expect(result.retryAfter!).toBeGreaterThan(0);
    expect(result.retryAfter!).toBeLessThanOrEqual(60);
  });

  it("provides separate limiters for parse-pdf and generate", async () => {
    const { parsePdfLimiter, generateLimiter } = await import("@/lib/rate-limiter");

    expect(parsePdfLimiter).toBeDefined();
    expect(generateLimiter).toBeDefined();

    // parse-pdf allows 10/min
    for (let i = 0; i < 10; i++) {
      expect(parsePdfLimiter.check("127.0.0.1").allowed).toBe(true);
    }
    expect(parsePdfLimiter.check("127.0.0.1").allowed).toBe(false);

    // generate allows 5/min
    for (let i = 0; i < 5; i++) {
      expect(generateLimiter.check("127.0.0.1").allowed).toBe(true);
    }
    expect(generateLimiter.check("127.0.0.1").allowed).toBe(false);
  });
});
