# Sprint v3 — Tasks

## Status: In Progress

- [x] Task 1: Commit v2 bug fixes (max_completion_tokens + CSP dev mode) (P0)
  - Acceptance: `lib/openai-client.ts` uses `max_completion_tokens` instead of `max_tokens`. `lib/security-headers.ts` adds `unsafe-eval` and `ws:` to CSP in development only. `app/page.tsx` has responsive classes. All changes committed. Existing tests still pass (`npx vitest run`).
  - Files: lib/openai-client.ts, lib/security-headers.ts, app/page.tsx
  - Completed: 2026-03-27 — Fixed gpt-5.4 max_completion_tokens param, CSP dev-mode unsafe-eval+ws:, responsive padding/sizing; 102/105 tests pass (3 pre-existing pdf-parser failures)

- [x] Task 2: Write E2E Playwright test for full user flow (P0)
  - Acceptance: Playwright test covers: load page → enter API key → click "Try with sample paper" → click Generate → see progress spinner → see download section with review warning → screenshot at each step (6+ screenshots saved to `tests/screenshots/task2-*`). Uses mocked APIs (no real OpenAI call). All assertions pass.
  - Files: tests/e2e/full-flow.spec.ts
  - Completed: 2026-03-27 — 3 E2E tests (happy flow, security warnings, error handling) with 9 screenshots, all passing

- [ ] Task 3: Build the real quality test — interactive browser (P0)
  - Acceptance: `npx playwright test tests/e2e/quality-test.spec.ts --headed` opens a visible browser. Test pauses and prompts user to enter their OpenAI API key. Test uploads `C:\Users\siris\Downloads\1706.pdf`. Test clicks Generate and waits up to 5 minutes. After generation, validates: (1) valid JSON notebook, (2) nbformat v4 structure with `cells` array, (3) 8+ cells, (4) at least one code cell with Python, (5) review warning visible on page. Takes screenshots at each step. Prints validation report to console.
  - Files: tests/e2e/quality-test.spec.ts

- [ ] Task 4: Install GitHub CLI and create GitHub repository (P0)
  - Acceptance: `gh` is installed. A GitHub repo `paper2notebook` is created (public or private per user preference). Local repo has `origin` remote pointing to it. All current code is pushed to `main`. `.gitignore` updated to exclude `aws_cred.md`, `*accessKeys*`, `.env*`, `node_modules/`, `.next/`, `test-results/`.
  - Files: .gitignore

- [ ] Task 5: Create GitHub Actions CI workflow (P0)
  - Acceptance: `.github/workflows/ci.yml` runs on every push and PR. Jobs: (1) install deps, (2) run `npx vitest run`, (3) install Playwright chromium + run `npx playwright test` (excluding quality-test), (4) run `semgrep --config auto`, (5) run `npm audit --audit-level=high`. Workflow uses `ubuntu-latest`. PR checks block merge if any step fails.
  - Files: .github/workflows/ci.yml

- [ ] Task 6: Create Dockerfile with Next.js standalone build (P0)
  - Acceptance: `docker build -t paper2notebook .` succeeds. `docker run -p 3000:3000 paper2notebook` starts the app and `curl http://localhost:3000` returns 200. Multi-stage build: deps → build → runtime. Final image under 200MB. Uses `output: "standalone"` in next.config.js.
  - Files: Dockerfile, next.config.js (update), .dockerignore

- [ ] Task 7: Create docker-compose.yml for local deployment (P0)
  - Acceptance: `docker compose up --build` starts the app on port 3000. `docker compose down` stops it. Single service configuration with health check.
  - Files: docker-compose.yml

- [ ] Task 8: Write Terraform config for AWS ECS Fargate (P0)
  - Acceptance: `terraform/` directory contains: `main.tf` (provider + VPC + subnets), `ecr.tf` (repository), `ecs.tf` (cluster + task def + service), `alb.tf` (load balancer + target group + listener), `security.tf` (security groups), `iam.tf` (execution role + task role), `logs.tf` (CloudWatch log group), `variables.tf` (region, app name, image tag), `outputs.tf` (ALB DNS name, ECR URL). `terraform validate` passes.
  - Files: terraform/*.tf

- [ ] Task 9: Create GitHub Actions CD workflow for auto-deploy to AWS (P0)
  - Acceptance: `.github/workflows/deploy.yml` triggers on push to `main` (after CI passes). Steps: (1) configure AWS credentials from GitHub secrets, (2) login to ECR, (3) docker build + tag + push to ECR, (4) update ECS service with `--force-new-deployment`. Uses GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`. Includes instructions in PR description for setting up the secrets.
  - Files: .github/workflows/deploy.yml

- [ ] Task 10: Add minimal unit + integration tests for untested modules (P1)
  - Acceptance: Unit tests added for `lib/notebook-builder.ts` (valid nbformat output, code cell detection, markdown cell detection — 5+ tests). Integration test for `POST /api/parse-pdf` with a real sample PDF (returns text, rejects non-PDF, rejects oversized — 3+ tests). Integration test for `POST /api/generate` with mocked OpenAI (returns content+warnings, rejects missing auth, rejects empty text — 3+ tests). All tests pass with `npx vitest run`.
  - Files: tests/unit/notebook-builder.test.ts, tests/integration/api-parse-pdf.test.ts, tests/integration/api-generate.test.ts
