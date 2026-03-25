# Sprint v1 — PRD: Paper2Notebook

## Overview
Build a web application where researchers upload a PDF research paper, provide their OpenAI API key, and receive a production-quality Jupyter notebook (.ipynb) that implements the paper's core algorithms and methodology as a structured, runnable tutorial. The generated notebooks target top-tier ML researchers who need to rapidly replicate and experiment with published work.

## Goals
- User can open the web app, enter their OpenAI API key, and upload a PDF
- PDF is parsed with high fidelity (text, equations, figures, tables)
- OpenAI gpt-5.4 generates a detailed, research-grade .ipynb notebook
- Notebook includes: paper summary, algorithm implementation with synthetic data, step-by-step explanations, and reproducibility notes
- User can download the .ipynb file or click "Open in Colab" to launch it directly

## User Stories
- As an ML researcher at DeepMind, I want to upload an attention mechanism paper and get a runnable notebook implementing multi-head attention with realistic synthetic data, so I can experiment with the architecture immediately
- As a research engineer at OpenAI, I want the generated notebook to be structured like a professional tutorial (not a toy demo), so I can use it as a starting point for replication
- As a PhD student, I want to click "Open in Colab" after generation, so I can start running the code without any local setup
- As a user, I want my API key to stay in my browser and never be stored on the server, so I feel safe using the tool

## Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API routes (serverless functions)
- **PDF Parsing**: pdf-parse (text extraction) + OpenAI gpt-5.4 vision for equations/figures
- **Notebook Generation**: OpenAI gpt-5.4 (reasoning model) via streaming API
- **Notebook Format**: nbformat-compatible JSON → .ipynb file
- **Colab Integration**: Google Colab URL scheme with GitHub Gist or base64 upload

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌────────────────────────┐   │
│  │ API Key  │──▶│  Upload   │──▶│  Progress / Download   │   │
│  │  Input   │   │   PDF     │   │  .ipynb  |  Open Colab │   │
│  └──────────┘   └──────────┘   └────────────────────────┘   │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │ API Key + PDF (multipart)
                       ▼
              ┌─────────────────┐
              │  Next.js API    │
              │  /api/generate  │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌────────────┐ ┌──────────┐ ┌──────────────┐
   │ PDF Parse  │ │ GPT-5.4  │ │  .ipynb      │
   │ (text +    │ │ Reasoning│ │  Builder     │
   │  vision)   │ │ (generate│ │  (nbformat   │
   │            │ │  notebook│ │   JSON)      │
   └────────────┘ │  cells)  │ └──────────────┘
                  └──────────┘
```

### Data Flow
1. User enters OpenAI API key (stored only in browser state, never persisted)
2. User uploads PDF → sent to `/api/generate` with API key in request header
3. Backend extracts text + identifies equations/figures from PDF
4. Backend sends structured prompt to gpt-5.4 with paper content
5. gpt-5.4 returns notebook cells (markdown explanations + Python code)
6. Backend assembles valid .ipynb JSON and returns to frontend
7. Frontend offers download button + "Open in Colab" link

### Notebook Structure (Generated Output)
The generated .ipynb will contain these sections:
1. **Paper Metadata** — Title, authors, abstract, link
2. **Key Contributions** — Bullet summary of what the paper introduces
3. **Prerequisites** — pip installs, imports, environment setup
4. **Mathematical Foundation** — LaTeX-rendered equations with explanations
5. **Algorithm Implementation** — Step-by-step code with detailed comments
6. **Synthetic Data Generation** — Realistic data that demonstrates the algorithm
7. **Experiments & Results** — Run the algorithm, visualize outputs, compare with paper's claims
8. **Ablation Studies** — Vary key parameters to build intuition
9. **Reproducibility Notes** — Seeds, hardware requirements, known limitations

## Out of Scope (v2+)
- User accounts / authentication
- Saving/history of generated notebooks
- Real dataset integration (only synthetic data in v1)
- Multi-paper comparison notebooks
- Fine-tuning or custom model support
- Server-side API key storage
- Batch processing of multiple PDFs
- Collaboration features

## Dependencies
- None (greenfield project)
- User must have their own OpenAI API key with gpt-5.4 access
