# Anthropic Architecture Certification LMS — Web App

A complete Learning Management System for the Anthropic Architecture Certification, built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and the Anthropic SDK.

## Features

- **5 Domain Course** covering 27% to 15% of the certification exam
- **AI-Powered Q&A** with streaming responses from `claude-opus-4-6`
- **Practice Exams** — 39 realistic MCQ questions across all 5 domains
- **Progress Tracking** — all progress saved to localStorage
- **Certificate** — printable certificate earned on passing all 5 exams
- **Dark theme** — professional Anthropic-inspired purple/blue design

## Setup

### 1. Install dependencies

```bash
cd lms-web
npm install
```

### 2. Configure API key

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_key_here
```

Get your API key at: https://console.anthropic.com/

### 3. Run development server

```bash
npm run dev
```

Open http://localhost:3000

### 4. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
lms-web/
├── app/
│   ├── page.tsx                    # Landing / Login
│   ├── dashboard/page.tsx          # Course dashboard
│   ├── domain/[id]/page.tsx        # Domain learning page
│   ├── domain/[id]/practice/       # Practice exam
│   ├── certificate/page.tsx        # Certificate page
│   └── api/
│       ├── evaluate/route.ts       # Claude evaluation API
│       └── explain/route.ts        # Claude explanation API
├── components/
│   ├── AiChat.tsx                  # Streaming AI chat panel
│   ├── DomainCard.tsx              # Domain overview card
│   ├── ProgressBar.tsx             # Animated progress bar
│   ├── QuestionCard.tsx            # MCQ question with feedback
│   └── Certificate.tsx             # Printable certificate
└── lib/
    ├── curriculum.ts               # All course content + 39 questions
    ├── progress.ts                 # localStorage helpers
    └── types.ts                    # TypeScript interfaces
```

## Course Domains

| Domain | Title | Exam Weight | Questions |
|--------|-------|-------------|-----------|
| 1 | Agentic Architecture & Orchestration | 27% | 10 |
| 2 | Tool Design & MCP Integration | 18% | 7 |
| 3 | Claude Code Configuration & Workflows | 20% | 8 |
| 4 | Prompt Engineering & Structured Output | 20% | 8 |
| 5 | Context Management & Reliability | 15% | 6 |

## Certificate Eligibility

Pass all 5 domain practice exams with a score of **≥70%** to earn your certificate. The certificate page will show a printable certificate with your name, scores, and completion date.

## AI Features

Both API routes (`/api/evaluate` and `/api/explain`) use **streaming** with the Anthropic SDK. The AI assistant uses the `claude-opus-4-6` model with an expert certification mentor system prompt.

### POST /api/evaluate
Evaluates a user's answer to a concept question. Returns streaming feedback.

### POST /api/explain
Explains any concept from the curriculum. Returns a streaming explanation with code examples.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic SDK (`@anthropic-ai/sdk`) with `claude-opus-4-6`
- **Icons**: Lucide React
- **Storage**: localStorage (no external database)
- **Auth**: Name + email (stored locally, no backend auth)
