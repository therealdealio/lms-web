# Learn Agent Architecture

An AI-powered LMS (Learning Management System) built with Next.js 14, NextAuth v4, Prisma, and the Anthropic Claude API. This guide walks through the full setup and the tricky parts you'll hit during deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth v4 + PrismaAdapter |
| Database | Supabase (PostgreSQL) via Prisma |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Hosting | Vercel |
| Payments | Stripe |

---

## Prompting Guide: Building an AI-Powered LMS

This section is for developers who want to recreate or extend this project. It documents the exact prompts, decisions, and pitfalls encountered — especially during deployment.

### Recommended Prompt Sequence

Use these prompts with Claude Code (or any AI assistant) in order:

#### 1. Project Scaffold
```
Create a Next.js 14 App Router project with:
- NextAuth v4 for authentication (Google, GitHub, LinkedIn, and email/password)
- Prisma ORM connected to a Supabase PostgreSQL database
- Tailwind CSS with a dark theme
- TypeScript throughout
```

#### 2. Auth Setup
```
Set up NextAuth with PrismaAdapter using the following providers:
- Google OAuth
- GitHub OAuth
- LinkedIn OAuth (using openid profile email scope)
- CredentialsProvider with bcrypt password hashing

Use JWT session strategy. Add allowDangerousEmailAccountLinking: true to all
OAuth providers so users can sign in with multiple providers using the same email.
```

> **Why `allowDangerousEmailAccountLinking`?**
> Without this, if a user signs up with Google (e.g. `alice@gmail.com`) and then
> tries to sign in with GitHub using the same email, NextAuth throws an
> `OAuthAccountNotLinked` error. This flag merges them into one account.

#### 3. AI Chat Component
```
Create a streaming AI chat component using the Anthropic SDK that:
- Streams responses via Server-Sent Events from a /api/explain route
- Shows a typing indicator while waiting
- Renders markdown responses using react-markdown
- Tracks prompt usage per user with a free tier (10 prompts) and pro tier (500 prompts)
- Stores usage counts in localStorage and syncs to the database
```

#### 4. Stripe Payments
```
Add a Stripe checkout flow for a one-time $5 upgrade to Pro.
Include a webhook handler at /api/webhook/stripe that:
- Verifies the Stripe signature
- Updates the user's membership tier in the database on checkout.session.completed
```

---

## Deployment: Vercel + Supabase

### Environment Variables

Set these in Vercel → Project → Settings → Environment Variables.

**Critical rule: no quotes around values.** Vercel treats quotes as literal characters — your secret becomes `"my-secret"` instead of `my-secret`, which breaks everything.

```
# Database (Supabase pooler — use port 6543 for Prisma)
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# NextAuth
NEXTAUTH_SECRET=your-random-32-char-secret
NEXTAUTH_URL=https://www.yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx

# GitHub OAuth
GITHUB_ID=your-github-app-client-id
GITHUB_SECRET=your-github-app-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx
```

### Supabase Database URL

Use the **Session Mode (port 6543)** pooler URL, not the direct connection.
Prisma with PgBouncer requires `?pgbouncer=true` at the end.

The URL must start with `postgresql://` — not `postgres://`. Prisma will throw:
```
url must start with the protocol `postgresql://` or `postgres://`
```
if the URL is malformed or has quotes around it.

---

## Common Errors and Fixes

### 1. `OAuthAccountNotLinked`

**URL:** `https://yourdomain.com/?error=OAuthAccountNotLinked`

**Cause:** A user tried to sign in with GitHub/LinkedIn using an email already
registered via Google (or vice versa).

**Fix:** Add `allowDangerousEmailAccountLinking: true` to every OAuth provider
in `lib/auth.ts`:

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  allowDangerousEmailAccountLinking: true,
}),
```

---

### 2. Wrong `redirect_uri` in OAuth callback

**Symptom:** After clicking "Sign in with Google", the redirect URL in the
error message points to your Vercel preview URL
(e.g. `lms-abc123-yourorg.vercel.app`) instead of your custom domain.

**Cause:** `NEXTAUTH_URL` is not set, or is set to the wrong value.

**Fix:** Set `NEXTAUTH_URL=https://www.yourdomain.com` in Vercel environment
variables. Make sure there are no trailing slashes and no quotes.

Also add your production domain to the OAuth provider's allowed redirect URIs:
- **Google:** Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs → add `https://www.yourdomain.com/api/auth/callback/google`
- **GitHub:** GitHub App settings → Authorization callback URL → `https://www.yourdomain.com/api/auth/callback/github`
- **LinkedIn:** LinkedIn Developer App → Auth tab → Authorized redirect URLs → `https://www.yourdomain.com/api/auth/callback/linkedin`

---

### 3. LinkedIn `OAuthSignin` Error

**URL:** `https://yourdomain.com/?error=OAuthSignin`

**Cause (most common):** LinkedIn OAuth app does not have the **Sign In with LinkedIn using OpenID Connect** product added.

**Fix:**
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Select your app
3. Click the **Products** tab
4. Add **Sign In with LinkedIn using OpenID Connect**
5. Make sure your `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` in Vercel match the values in the Auth tab exactly

Your `lib/auth.ts` LinkedIn config must include the OpenID scope:
```typescript
LinkedInProvider({
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  allowDangerousEmailAccountLinking: true,
  authorization: {
    params: { scope: "openid profile email" },
  },
}),
```

---

### 4. Prisma `PrismaClientInitializationError` in production

**Symptom:** Works locally, crashes on Vercel with a Prisma initialization error.

**Fix:** Make sure your `package.json` build script runs `prisma generate` before `next build`:
```json
"scripts": {
  "build": "prisma generate && next build"
}
```

---

### 5. Google/GitHub SSO show the same account

This is **expected behavior**. When two providers share the same email address
and `allowDangerousEmailAccountLinking: true` is set, NextAuth links them to
the same user record in your database. The user has one account, multiple
login methods. They will see the same profile, purchases, and progress
regardless of which provider they used to sign in.

---

## OAuth Provider Setup Checklist

### Google Cloud Console
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Add `https://yourdomain.com/api/auth/callback/google` to Authorized redirect URIs
- [ ] Add `https://yourdomain.com` to Authorized JavaScript origins
- [ ] Copy Client ID → `GOOGLE_CLIENT_ID`
- [ ] Copy Client Secret → `GOOGLE_CLIENT_SECRET`

### GitHub
- [ ] Create a new OAuth App (Settings → Developer Settings → OAuth Apps)
- [ ] Set Homepage URL to `https://yourdomain.com`
- [ ] Set Authorization callback URL to `https://yourdomain.com/api/auth/callback/github`
- [ ] Copy Client ID → `GITHUB_ID`
- [ ] Generate and copy Client Secret → `GITHUB_SECRET`

### LinkedIn
- [ ] Create app at [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
- [ ] Add **Sign In with LinkedIn using OpenID Connect** product
- [ ] Add `https://yourdomain.com/api/auth/callback/linkedin` to Authorized redirect URLs
- [ ] Copy Client ID → `LINKEDIN_CLIENT_ID`
- [ ] Copy Primary Client Secret → `LINKEDIN_CLIENT_SECRET`

---

## Local Development

```bash
# Install dependencies
npm install

# Set up .env.local with all the variables above (local values)
cp .env.example .env.local

# Run database migrations
npx prisma db push

# Start dev server
npm run dev
```

Your `.env.local` should have:
```
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...  # your Supabase URL
```

---

## Project Structure

```
lms-web/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── explain/              # Streaming AI endpoint (Anthropic)
│   │   ├── membership/           # Read/update membership tier
│   │   └── webhook/stripe/       # Stripe webhook handler
│   └── ...pages
├── components/
│   ├── AiChat.tsx                # Streaming chat UI
│   └── ...
├── lib/
│   ├── auth.ts                   # NextAuth config (providers, callbacks)
│   ├── prisma.ts                 # Prisma client singleton
│   ├── membership.ts             # Free/pro tier logic
│   └── types.ts
└── prisma/
    └── schema.prisma             # Database schema
```
