# LMS-Web — Learn Agent Architecture

Community study platform for Anthropic certifications (Agent Architecture + Prompt Engineering). Next.js 14 App Router, Tailwind CSS, Prisma/PostgreSQL, NextAuth.

## Build & Run

```bash
npm run dev          # Dev server on port 3001
npm run build        # Production build (runs prisma generate first)
npm run lint         # ESLint
```

Requires `.env.local` with: `ANTHROPIC_API_KEY`, `NEXTAUTH_SECRET`, `DATABASE_URL`, and OAuth provider keys (Google, GitHub, LinkedIn). See `.env.local.example`.

## Architecture

- **App Router** — all routes in `app/`, no `pages/` directory
- **Auth** — NextAuth 4 with Google/GitHub/LinkedIn OAuth + email/password credentials. JWT sessions. Admin guard via `assertAdmin()` in `lib/auth.ts` (checks `ADMIN_EMAIL`)
- **Database** — Prisma ORM with PostgreSQL. Schema in `prisma/schema.prisma`. Models: User, Membership, UserDomainProgress, ForumPost, ForumReply, ForumLike, PageView, PromptLog
- **Client state** — localStorage for progress/membership (synced with DB on load). See `lib/progress.ts` and `lib/membership.ts`
- **AI** — Anthropic SDK with streaming responses. Model set via `CLAUDE_MODEL` env var (defaults to `claude-haiku-4-5-20251001`). Routes: `/api/explain` (concept explanations), `/api/evaluate` (answer evaluation)
- **Membership** — Free tier (15 AI prompts) vs Pro (500 prompts). License key validation via `/api/verify-license`
- **Forum** — Posts/replies/likes system with domain-specific categories

## Curriculum Structure

Two courses defined in `lib/curriculum/`:
- `aai.ts` — Agentic AI Architecture (8 domains, 58 questions)
- `pe.ts` — Prompt Engineering Expert (8 domains, 80 questions)
- `index.ts` — Exports `courses` array, helper functions (`getCourse`, `getDomain`, `getDomainsForCourse`, etc.), `PASSING_SCORE = 70`

Each domain has: `id`, `courseId`, `title`, `weight`, `description`, `tagline`, `plainEnglish`, `icon`, `color`, `concepts[]`, `questions[]`, `examTraps`

Domain IDs follow pattern: `{courseId}-{number}` (e.g., `aai-1`, `pe-3`)

## Design System

Tailwind with **Material Design 3** tokens ("The Digital Blueprint" via Stitch):
- Primary: `#9b4510` (warm brown/copper)
- Fonts: `font-headline` = Space Grotesk, `font-body`/default = Inter, `font-label` = Space Grotesk
- Use semantic color tokens: `bg-surface`, `text-on-surface`, `bg-primary`, `text-on-primary`, `bg-surface-container`, `text-on-surface-variant`, etc.
- Corner radius, glass effects, blueprint-grid background pattern
- Icons: Lucide React (`lucide-react`)

## Key Files

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Landing page (hero, bento features, curriculum tabs, auth modal) |
| `app/dashboard/page.tsx` | Main study hub with course tabs, progress, domain cards |
| `app/domain/[id]/page.tsx` | Study material with concepts, AI chat |
| `app/domain/[id]/practice/page.tsx` | Practice exam mode |
| `lib/curriculum/index.ts` | Course registry and helpers |
| `lib/types.ts` | All TypeScript interfaces |
| `lib/progress.ts` | localStorage progress management |
| `lib/auth.ts` | NextAuth config, 4 providers |
| `lib/env.ts` | Env var validation with lazy getters |
| `components/AiChat.tsx` | Streaming AI chat with prompt limit tracking |
| `components/DomainCard.tsx` | Domain card UI for dashboard |
| `components/Certificate.tsx` | Certificate display + PDF download |

## Conventions

- Client components use `"use client"` directive
- API routes return JSON with proper status codes; admin routes use `assertAdmin()`
- Streaming AI responses use `ReadableStream` with `TextEncoder`
- Progress flow: concepts -> quiz -> practice exam (score >= 70% to pass domain, all domains passed = certificate)
- Path alias: `@/` maps to project root
