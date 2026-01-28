# Architecture Overview

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Auth & Database:** Supabase (Auth + PostgreSQL)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Hosting:** Vercel

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page (/)
│   ├── layout.tsx         # Root layout
│   ├── login/page.tsx     # Login page
│   ├── signup/page.tsx    # Signup page
│   ├── onboarding/page.tsx # 5-step onboarding flow
│   ├── dashboard/page.tsx  # Adaptive dashboard
│   └── profile/page.tsx    # Edit profile
│
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   └── Card.tsx
│   ├── onboarding/        # Onboarding step components
│   │   ├── StepLocation.tsx
│   │   ├── StepRelationship.tsx
│   │   ├── StepStage.tsx
│   │   ├── StepPriorities.tsx
│   │   ├── StepChildren.tsx
│   │   └── ProgressBar.tsx
│   └── dashboard/         # Dashboard components
│       ├── ContentBlock.tsx
│       ├── Checklist.tsx
│       ├── PromptCard.tsx
│       ├── InfoCard.tsx
│       └── PlaceholderCard.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser client for client components
│   │   ├── server.ts      # Server client for server components
│   │   └── middleware.ts  # Auth middleware utilities
│   ├── dashboard-content.ts # Content block definitions
│   └── onboarding-config.ts # Onboarding options/labels
│
└── types/
    └── index.ts           # TypeScript type definitions
```

## Authentication Flow

1. User signs up via `/signup`
2. Supabase creates `auth.users` row
3. Database trigger creates matching `profiles` row
4. User redirected to `/onboarding`
5. User completes 5-step onboarding
6. Profile updated, `onboarding_completed = true`
7. User redirected to `/dashboard`
8. On future logins:
   - If `onboarding_completed = false` → `/onboarding`
   - If `onboarding_completed = true` → `/dashboard`

## Database Schema

### Table: `profiles`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, matches auth.users.id |
| email | text | User's email |
| country | text | Country of residence |
| relationship_type | text | married, international_marriage, common_law, divorced |
| stage | text | thinking, separated, in_court, post_divorce |
| priorities | text[] | Array of priority values |
| has_children | boolean | Whether user has children |
| children_count | integer | Number of children (nullable) |
| children_ages | text | Ages as free text (nullable) |
| onboarding_completed | boolean | Whether onboarding is finished |
| created_at | timestamp | When profile was created |
| updated_at | timestamp | Last update time |

### Row Level Security

- Users can only SELECT/UPDATE/INSERT their own profile
- Policy: `auth.uid() = id`

## Data Flow

### Onboarding
- All 5 steps store data in client-side state
- Single database write on completion
- Updates `profiles` row with all fields

### Dashboard
- Server component fetches user profile
- `getContentBlocksForUser()` generates content blocks based on:
  - User's stage (always shows stage-specific blocks)
  - User's priorities (adds priority-specific blocks)
- Same layout for all users, different content

## Middleware

The middleware (`middleware.ts`) handles:
- Session refresh on each request
- Redirecting unauthenticated users from protected routes
- Redirecting authenticated users from auth pages to dashboard/onboarding
