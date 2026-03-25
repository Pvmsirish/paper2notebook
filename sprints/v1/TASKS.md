# Sprint v1 — Tasks

## Status: Not Started

- [x] Task 1: Initialize Next.js 14 project with Tailwind CSS + shadcn/ui (P0)
  - Acceptance: `npm run dev` starts without errors, Tailwind renders correctly, shadcn/ui Button component works
  - Files: package.json, tailwind.config.js, app/layout.tsx, app/page.tsx, components/ui/button.tsx
  - Completed: 2026-03-25 — Initialized Next.js 14 with Tailwind v3, shadcn/ui theming, Button component, and utility functions

- [x] Task 2: Build the landing page with API key input and PDF upload form (P0)
  - Acceptance: Page shows app title/description, an API key input field (masked), a PDF file upload dropzone, and a "Generate Notebook" button. API key is stored in React state only (never sent to localStorage or cookies). Upload accepts only .pdf files.
  - Files: app/page.tsx, components/api-key-input.tsx, components/pdf-upload.tsx, components/generate-button.tsx
  - Completed: 2026-03-25 — Built landing page with masked API key input (show/hide toggle), PDF drag-and-drop upload zone, and Generate button with disabled state logic

- [x] Task 3: Create the PDF parsing API route with text extraction (P0)
  - Acceptance: POST `/api/parse-pdf` accepts a PDF file (multipart form data), returns extracted text content as JSON. Handles errors gracefully (invalid file, empty PDF, too large). Max file size: 20MB.
  - Files: app/api/parse-pdf/route.ts, lib/pdf-parser.ts
  - Completed: 2026-03-25 — Built PDF parser with pdf-parse, API route with validation (type, size, content), PdfParseError class

- [x] Task 4: Build the notebook generation prompt engine (P0)
  - Acceptance: Given extracted paper text, constructs a structured prompt for gpt-5.4 that requests all 9 notebook sections (metadata, contributions, prerequisites, math, implementation, synthetic data, experiments, ablations, reproducibility). Prompt is modular and stored separately from API logic.
  - Files: lib/prompt-engine.ts, lib/prompts/notebook-system-prompt.ts, lib/prompts/notebook-user-prompt.ts
  - Completed: 2026-03-25 — Modular prompt engine with system prompt (9 sections), user prompt builder, and buildPrompt() interface

- [ ] Task 5: Create the OpenAI integration API route for notebook generation (P0)
  - Acceptance: POST `/api/generate` accepts PDF text + OpenAI API key, calls gpt-5.4 with the prompt engine output, returns the raw LLM response. API key is passed via `Authorization` header (never logged or stored). Includes error handling for invalid key, rate limits, and timeout (5 min max).
  - Files: app/api/generate/route.ts, lib/openai-client.ts

- [ ] Task 6: Build the .ipynb file assembler (P0)
  - Acceptance: Takes gpt-5.4 response (markdown + code blocks) and converts it into a valid .ipynb JSON structure (nbformat v4). Output opens correctly in Jupyter and Google Colab. Handles markdown cells, code cells, and metadata.
  - Files: lib/notebook-builder.ts, lib/types/notebook.ts

- [ ] Task 7: Wire up the full end-to-end flow with progress UI (P0)
  - Acceptance: User enters API key → uploads PDF → clicks Generate → sees progress states (Parsing PDF... / Analyzing paper... / Generating notebook... / Building .ipynb...) → receives download. Errors display as toast notifications. Generate button is disabled during processing.
  - Files: app/page.tsx (update), components/progress-display.tsx, lib/hooks/use-generate.ts

- [ ] Task 8: Add .ipynb download button and "Open in Colab" link (P1)
  - Acceptance: After generation, user sees two buttons: "Download .ipynb" (triggers browser download) and "Open in Colab" (opens notebook in Google Colab via Gist upload or colab URL scheme). Download produces a valid file that opens in Jupyter/Colab without errors.
  - Files: components/download-section.tsx, lib/colab-link.ts

- [ ] Task 9: Add responsive styling, loading skeletons, and error states (P1)
  - Acceptance: App looks polished on desktop and mobile. Loading states use skeleton/spinner animations. Error states (bad API key, parsing failure, generation timeout) show clear messages with retry options. Dark mode support via Tailwind.
  - Files: app/globals.css, components/ui/* (various), components/error-display.tsx

- [ ] Task 10: Add sample PDF demo mode for first-time users (P2)
  - Acceptance: A "Try with sample paper" button loads a bundled sample PDF (e.g., Attention Is All You Need abstract/excerpt) and runs the full flow without requiring a real PDF upload. Helps users understand the output before using their own papers.
  - Files: public/samples/sample-paper.pdf, components/demo-button.tsx, app/page.tsx (update)
