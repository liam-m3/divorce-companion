# Divorce Companion

## What This Project Is

A divorce support web app that provides structured onboarding, adaptive content based on user's situation, and organisation tools. **Not** legal advice - focuses on emotional support and administrative organisation.

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (Auth + PostgreSQL)
- **Tailwind CSS 4**
- **TypeScript** (strict mode)
- **Vercel** (hosting)

## Current Phase

**MVP 1** - Building core functionality:
- Auth (signup/login)
- 5-step onboarding questionnaire
- Adaptive dashboard
- Profile editing

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript types (Profile, Stage, Priority, etc.) |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `src/lib/supabase/middleware.ts` | Auth middleware utilities |
| `src/lib/onboarding-config.ts` | Onboarding options and labels |
| `src/lib/dashboard-content.ts` | Content block definitions |
| `middleware.ts` | Next.js middleware for auth |

## Database

Single `profiles` table linked to Supabase auth. Key fields:
- `stage`: thinking, separated, in_court, post_divorce
- `priorities`: array of children, finances, housing, emotional_support, legal_admin
- `onboarding_completed`: boolean

## Git Workflow

- Feature branches: `feat/auth`, `feat/onboarding`, etc.
- Small, descriptive commits
- Merge to main when feature complete

## Development Order

1. ~~Setup (types, Supabase, config)~~ DONE
2. ~~Auth (signup, login pages)~~ DONE
3. ~~Onboarding (5-step flow)~~ DONE
4. ~~Dashboard (adaptive content)~~ DONE
5. ~~Profile (edit page)~~ DONE
6. ~~Polish (loading states, errors)~~ DONE
7. Deploy to Vercel

## Rules

- No legal advice
- No AI features
- No payments
- No notifications
- Functional > beautiful
- Keep it simple - this is an MVP
- **Never commit or hardcode API keys** - all secrets go in `.env.local` (gitignored). Use `process.env.NEXT_PUBLIC_SUPABASE_URL` etc. in code

## Running Locally

```bash
npm install
cp .env.local.example .env.local
# Add your Supabase credentials to .env.local
npm run dev
```

## Supabase Setup Required

Before running, you need:
1. Create Supabase project
2. Run the database schema (see README.md for SQL)
3. Add URL and anon key to `.env.local`
