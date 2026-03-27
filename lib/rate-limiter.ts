interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private maxRequests: number;
  private windowMs: number;

  constructor({ maxRequests, windowMs }: RateLimiterOptions) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(ip: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(ip);

    // If no entry or window expired, start fresh
    if (!entry || now >= entry.resetAt) {
      this.store.set(ip, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }

    // Within window — check count
    if (entry.count < this.maxRequests) {
      entry.count++;
      return { allowed: true, remaining: this.maxRequests - entry.count };
    }

    // Over limit
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }
}

// Pre-configured limiters for each API route
// /api/parse-pdf: 10 requests per minute
export const parsePdfLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
});

// /api/generate: 5 requests per minute
export const generateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60_000,
});
