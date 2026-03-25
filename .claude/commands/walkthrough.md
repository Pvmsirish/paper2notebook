# `/walkthrough` Skill

You are a technical writer generating a sprint review report. Your job is to read all code produced in the current sprint and create a comprehensive, human-readable walkthrough document.

## Your Process

### Step 1: Identify the Sprint

Find the latest `sprints/vN/` directory. Read:
- `PRD.md` — what was planned
- `TASKS.md` — what tasks were attempted

### Step 2: Inventory All Changes

Use git to find all files created or modified in this sprint:
```bash
# If tasks have commits tagged to this sprint
git log --oneline --name-only
```
Or read the `TASKS.md` completed entries for the file list.

### Step 3: Generate WALKTHROUGH.md

Write `sprints/vN/WALKTHROUGH.md` with this structure:

```markdown
# Sprint vN — Walkthrough

## Summary
[2-3 sentence summary of what this sprint accomplished]

## Architecture Overview
[ASCII diagram showing the main components and how they connect]

## Files Created/Modified

### [filename.ext]
**Purpose**: [What this file does in 1 sentence]
**Key Functions/Components**:
- `functionName()` — [What it does]
- `ComponentName` — [What it renders/handles]

**How it works**:
[2-3 paragraph plain English explanation. Include relevant code snippets
for the most important logic. Explain WHY, not just WHAT.]

[Repeat for each file]

## Data Flow
[Describe how data moves through the application. Example:
"User submits login form → API route validates credentials →
NextAuth creates session → Redirect to dashboard → Dashboard
fetches metrics from /api/metrics → Renders charts"]

## Test Coverage
[List all tests and what they verify]
- Unit: [N tests] — [what they cover]
- Integration: [N tests] — [what they cover]
- E2E: [N tests] — [what they cover]

## Security Measures
[List security features implemented in this sprint]

## Known Limitations
[Be honest about what's missing, hacky, or could be improved]

## What's Next
[Based on the limitations and PRD trajectory, suggest v(N+1) priorities]
```

---

## Rules

- Write for a developer who has **NEVER** seen this codebase
- Include actual code snippets for complex logic (5-10 lines, not entire files)
- Every file gets its own section
- Be honest about limitations — don't oversell
- Use the same terminology as the PRD
- Architecture diagram **MUST** be ASCII art (works everywhere)
- The walkthrough should be self-contained — reader shouldn't need to open source files

---

## Example Output

### sprints/v1/WALKTHROUGH.md

```markdown
# Sprint v1 — Walkthrough

## Summary
Built an analytics dashboard MVP with email/password authentication,
4 metric cards (Revenue, Users, Conversion, MRR), a Recharts line chart
with date range filtering, and CSV export. Uses Next.js 14 with SQLite.

## Architecture Overview

┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│                                                      │
│  /login ──▶ /dashboard ──▶ /api/metrics              │
│              │                    │                   │
│              ├─ MetricCards       │                   │
│              ├─ RevenueChart      │                   │
│              ├─ DateFilter        │                   │
│              └─ ExportButton      │                   │
└──────────────────────┬───────────┘                   │
                       │                               │
                       ▼                               ▼
              ┌────────────────┐            ┌─────────────┐
              │  NextAuth.js   │            │  Prisma ORM  │
              │  (sessions)    │            │  (SQLite)    │
              └────────────────┘            └─────────────┘

## Files Created/Modified

### app/layout.tsx
**Purpose**: Root layout with auth session provider and global styles.
**Key Functions/Components**:
- `RootLayout` — Wraps all pages with SessionProvider and Tailwind base styles

**How it works**:
This is the Next.js 14 root layout that wraps every page. It imports the
global CSS (Tailwind), initializes the font, and wraps children in the
NextAuth SessionProvider so any component can call `useSession()`.

### components/metric-card.tsx
**Purpose**: Reusable card component displaying a single KPI metric.
**Key Functions/Components**:
- `MetricCard` — Renders a card with title, value, and trend indicator

**How it works**:
Takes `title`, `value`, `change`, and `trend` props. Displays the metric
value prominently with a colored trend arrow (green for up, red for down).
Uses shadcn/ui Card component for consistent styling.

## Data Flow
User submits login form → API route validates credentials →
NextAuth creates session → Redirect to dashboard → Dashboard
fetches metrics from /api/metrics with date range param →
API queries Prisma/SQLite → Returns JSON → Dashboard renders
MetricCards and RevenueChart → Export button hits /api/export
→ Returns CSV blob → Browser downloads file.

## Test Coverage
- Unit: 4 tests — metric calculations, date range filtering logic
- Integration: 3 tests — auth API, metrics API, export API
- E2E: 2 tests — login flow, dashboard interactions with screenshots

## Security Measures
- Password hashing with bcrypt
- CSRF protection via NextAuth
- SQL injection prevention via Prisma parameterized queries
- Session-only access to API routes

## Known Limitations
- SQLite is not suitable for production (no concurrent writes)
- No password reset flow
- No input validation on signup (email format, password strength)
- Charts don't handle empty data gracefully
- No rate limiting on auth endpoints

## What's Next
Suggested v2 priorities:
1. Switch to PostgreSQL for production readiness
2. Add password reset via email
3. Input validation and error messages
4. Real-time updates with WebSocket
5. Team/organization support
```
