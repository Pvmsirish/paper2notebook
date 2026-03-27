# Sprint v3 — PRD: Production-Ready (Testing, CI/CD, Docker & AWS Deployment)

## Overview
Make Paper2Notebook production-ready with comprehensive E2E testing (including a real interactive quality test), a GitHub Actions CI/CD pipeline that blocks merges on failure, Dockerized deployment, and Terraform-managed AWS ECS Fargate infrastructure with auto-deploy on main.

## Goals
- E2E Playwright tests cover the full user flow (upload → generate → download) with screenshots at every step
- A real quality test opens a visible browser, lets the user enter their OpenAI API key, generates a notebook from "Attention Is All You Need", and validates the output (valid JSON, 8+ sections, valid Python, safety disclaimer)
- GitHub Actions CI runs all tests + semgrep + npm audit on every push/PR and blocks merge on failure
- The app runs in Docker with a single `docker compose up`
- Terraform provisions AWS ECS Fargate infrastructure and the CD pipeline auto-deploys on merge to main
- Bug fixes from v2 (max_completion_tokens for gpt-5.4, CSP dev-mode eval) are committed

## User Stories
- As a developer, I want a CI pipeline that catches regressions before merge, so I can ship with confidence
- As a researcher, I want proof that the app generates valid, high-quality notebooks from real papers, so I can trust the output
- As an operator, I want to deploy with `docker compose up` locally or push to main for automatic AWS deployment, so I can go to production without manual steps
- As a reviewer, I want to see screenshots of every step in the E2E test, so I can visually verify the app works

## Technical Architecture

### Changes from v2
- **Bug fixes**: `max_completion_tokens` replaces `max_tokens` for gpt-5.4; CSP allows `unsafe-eval` + `ws:` in dev mode only
- **Testing**: E2E Playwright full-flow test + interactive real quality test with "Attention Is All You Need" PDF
- **CI/CD**: GitHub Actions workflow with test → security scan → deploy pipeline
- **Docker**: Next.js standalone output in multi-stage Dockerfile, nginx not needed (Next.js serves itself)
- **Infrastructure**: Terraform for AWS ECS Fargate with ALB, ECR, CloudWatch

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Developer Workflow                          │
│                                                                  │
│  git push / PR ──▶ GitHub Actions                                │
│                     ├─ npm test (vitest)                        │
│                     ├─ npx playwright test                      │
│                     ├─ semgrep --config auto                    │
│                     ├─ npm audit                                │
│                     └─ ❌ Block merge if any fail                │
│                                                                  │
│  merge to main ──▶ GitHub Actions (CD)                           │
│                     ├─ docker build                             │
│                     ├─ docker push → AWS ECR                    │
│                     └─ aws ecs update-service → ECS Fargate     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AWS Infrastructure (Terraform)                │
│                                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────────────┐ │
│  │   ALB    │───▶│  ECS Fargate  │───▶│  Next.js Container     │ │
│  │ (port 80)│    │  (Task Def)   │    │  (standalone, port 3000│ │
│  └──────────┘    └──────────────┘    └────────────────────────┘ │
│                                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────────────┐ │
│  │   ECR    │    │  CloudWatch   │    │  VPC + Subnets + SG    │ │
│  │ (images) │    │  (logs)       │    │  (networking)          │ │
│  └──────────┘    └──────────────┘    └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Local Development                             │
│                                                                  │
│  docker compose up ──▶ Next.js container (port 3000)             │
│                        (same image as production)                │
└─────────────────────────────────────────────────────────────────┘
```

### Real Quality Test Flow
```
1. Playwright opens a VISIBLE Chromium browser (headful mode)
2. Pauses with a dialog: "Enter your OpenAI API key in the input field, then press Resume"
3. User manually types their real API key
4. Test uploads C:\Users\siris\Downloads\1706.pdf ("Attention Is All You Need")
5. Test clicks "Generate Notebook" and waits (up to 5 minutes)
6. Screenshots captured: initial state, PDF uploaded, generating, done, download section
7. Test downloads the .ipynb and validates:
   - Valid JSON
   - nbformat v4 structure
   - 8+ cells (sections)
   - At least one Python code cell with valid syntax
   - Security review warning visible on page
8. Test report printed to console with pass/fail for each check
```

### Docker Strategy
- **Single Dockerfile**: Multi-stage build using Next.js `output: "standalone"` mode
  - Stage 1: `node:20-alpine` — install deps + build
  - Stage 2: `node:20-alpine` — copy standalone output, run `node server.js`
- **docker-compose.yml**: Single service, maps port 3000, passes `NODE_ENV=production`
- No nginx needed — Next.js standalone serves static assets itself

### Terraform Resources
- **VPC**: 2 public subnets across 2 AZs
- **ECR**: Private repository `paper2notebook`
- **ECS Cluster**: Fargate launch type
- **Task Definition**: 512 CPU / 1024 MiB, Next.js container on port 3000
- **Service**: Desired count 1, ALB target group
- **ALB**: Internet-facing, HTTP listener on port 80
- **Security Groups**: ALB allows 80 inbound; ECS allows 3000 from ALB only
- **CloudWatch**: Log group for container stdout/stderr
- **IAM**: Task execution role + task role

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml — runs on push and PR
jobs:
  test:
    - npm ci
    - npx vitest run
    - npx playwright install chromium && npx playwright test
    - semgrep --config auto lib/ app/ middleware.ts
    - npm audit --audit-level=high

# .github/workflows/deploy.yml — runs on push to main (after CI passes)
jobs:
  deploy:
    - docker build -t paper2notebook .
    - docker tag + push to ECR
    - aws ecs update-service --force-new-deployment
```

## Out of Scope (v4+)
- Custom domain + HTTPS (ACM + Route53)
- Redis-backed rate limiting for multi-instance
- Streaming response (SSE)
- In-browser notebook preview/renderer
- ArXiv URL direct fetch
- User accounts / authentication
- Multi-region deployment
- Auto-scaling policies (beyond Fargate baseline)

## Dependencies
- Sprint v2 complete (all 10 tasks)
- GitHub CLI (`gh`) installed for repo creation
- Docker Desktop installed
- AWS CLI configured with `paper2notebookMSD` IAM user credentials
- Terraform CLI installed
- PDF file: `C:\Users\siris\Downloads\1706.pdf` (Attention Is All You Need)
- User's OpenAI API key with gpt-5.4 access (for real quality test)
