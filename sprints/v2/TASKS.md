# Sprint v2 — Tasks

## Status: In Progress

- [x] Task 1: Add security headers and CORS middleware (P0)
  - Acceptance: All responses include Content-Security-Policy, X-Content-Type-Options (nosniff), X-Frame-Options (DENY), Referrer-Policy, Permissions-Policy. CORS restricted to same-origin. Verify headers with `curl -I`.
  - Files: middleware.ts, lib/security-headers.ts
  - Completed: 2026-03-26 — Security headers helper + Next.js middleware with same-origin CORS enforcement, 7 integration tests

- [x] Task 2: Add rate limiting to API routes (P0)
  - Acceptance: `/api/parse-pdf` limited to 10 requests/minute per IP. `/api/generate` limited to 5 requests/minute per IP. Returns 429 with `{ error: "Too many requests. Please try again later." }` when exceeded. Uses in-memory store (no external deps).
  - Files: lib/rate-limiter.ts, middleware.ts (update)
  - Completed: 2026-03-26 — RateLimiter class with per-IP tracking, window reset, retryAfter; wired into middleware; 6 unit tests

- [x] Task 3: Build input sanitization for prompt injection defense (P0)
  - Acceptance: `sanitizeInput(text)` strips XML/HTML-like tags (`<system>`, `<paper>`, `</instructions>`, etc.), removes lines matching prompt override patterns ("ignore previous instructions", "you are now", "system:"), truncates to 100,000 chars. Returns `{ sanitized: string, strippedCount: number }`. Unit tests cover all patterns.
  - Files: lib/sanitize-input.ts, tests/unit/sanitize-input.test.ts
  - Completed: 2026-03-26 — Sanitizer with dangerous tag stripping (10 tag names), 9 injection line patterns, 100K char truncation; 16 unit tests

- [x] Task 4: Harden the system prompt against injection (P0)
  - Acceptance: System prompt includes explicit instruction boundary markers, a directive to ignore instructions in the paper text, and uses a per-request randomized boundary token. `buildPrompt()` now accepts a boundary token parameter. Unit tests verify boundary token is present in output.
  - Files: lib/prompts/notebook-system-prompt.ts (update), lib/prompts/notebook-user-prompt.ts (update), lib/prompt-engine.ts (update), tests/unit/prompt-engine.test.ts (update)
  - Completed: 2026-03-26 — Added anti-injection directive to system prompt, replaced <paper> tags with randomized boundary tokens (crypto.randomBytes), updated all 12 tests

- [x] Task 5: Build output scanner for dangerous code patterns (P0)
  - Acceptance: `scanOutput(response)` scans generated code for dangerous patterns: `os.system`, `subprocess`, `eval`, `exec`, `__import__`, `requests.get`, `urllib`, `socket`, `open('/etc/`, `os.remove`, base64 strings >100 chars. Returns `{ warnings: string[] }` listing each flagged pattern with line context. Does NOT block output — only flags. Unit tests cover all patterns.
  - Files: lib/scan-output.ts, tests/unit/scan-output.test.ts
  - Completed: 2026-03-26 — Output scanner with 14 dangerous patterns + base64 detection, only scans Python code blocks, includes line context in warnings; 15 unit tests

- [x] Task 6: Wire sanitization + output scanning into the generate pipeline (P0)
  - Acceptance: `/api/generate` calls `sanitizeInput()` on paperText before prompt construction, calls `scanOutput()` on LLM response before returning. Response shape changes to `{ content: string, warnings: string[] }`. Frontend displays warnings in a yellow alert box above the download section. Existing tests updated.
  - Files: app/api/generate/route.ts (update), lib/hooks/use-generate.ts (update), app/page.tsx (update), components/security-warnings.tsx
  - Completed: 2026-03-26 — Wired sanitizeInput() + scanOutput() into generate route, added SecurityWarnings component, useGenerate now tracks warnings state

- [ ] Task 7: Sanitize error messages and add paper text length limit (P0)
  - Acceptance: `/api/generate` error responses never include raw error messages — only predefined user-friendly strings. Paper text over 100,000 chars returns 400 with `{ error: "Paper text is too long. Maximum 100,000 characters supported." }`. Internal errors logged to console, not returned to client. Unit test verifies no raw messages leak.
  - Files: app/api/generate/route.ts (update), app/api/parse-pdf/route.ts (update), tests/integration/api-generate.test.ts (update)

- [ ] Task 8: Upgrade LLM to gpt-5.4 and remove "Open in Colab" (P1)
  - Acceptance: `lib/openai-client.ts` uses model `gpt-5.4` instead of `gpt-4o`. "Open in Colab" button removed from DownloadSection. `generateColabUrl()` removed from `lib/colab-link.ts`. Download button remains. Add "Review generated code before running" warning text above the download button. Tests updated.
  - Files: lib/openai-client.ts (update), components/download-section.tsx (update), lib/colab-link.ts (update), tests/e2e/landing-page.spec.ts (update if needed)

- [ ] Task 9: Add generation history with IndexedDB (P1)
  - Acceptance: After successful generation, notebook + metadata (id, createdAt, paperTitle, fileName, warnings) saved to IndexedDB store `paper2notebook/history`. History panel below the main form shows last 10 entries with paper title, date, and a "Download" button. Max 50 entries with FIFO eviction. Uses `idb` library. Clearing history is possible via a "Clear History" button.
  - Files: lib/history-store.ts, components/history-panel.tsx, app/page.tsx (update), lib/hooks/use-generate.ts (update)

- [ ] Task 10: Add E2E tests for security features (P2)
  - Acceptance: Playwright tests verify: (1) rate limit returns 429 after repeated requests, (2) security headers present on responses, (3) warning banner appears when output contains flagged patterns (mock the API), (4) history panel shows after generation, (5) download warning text visible. Screenshots captured.
  - Files: tests/e2e/security.spec.ts, tests/e2e/history.spec.ts
