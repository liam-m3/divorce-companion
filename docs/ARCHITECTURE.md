# Architecture Overview

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19
- **Auth & Database:** Supabase (Auth + PostgreSQL + Storage)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript (strict mode)
- **AI:** Groq SDK (Llama 3.3 70B for journal summaries)
- **Hosting:** Vercel

## Directory Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page (/)
│   ├── layout.tsx                      # Root layout (Geist fonts)
│   ├── globals.css                     # Tailwind styles
│   ├── error.tsx                       # Global error boundary
│   ├── not-found.tsx                   # 404 page
│   ├── loading.tsx                     # Global loading state
│   ├── login/page.tsx                  # Login page
│   ├── signup/page.tsx                 # Signup page
│   ├── onboarding/page.tsx             # 5-step onboarding flow
│   ├── dashboard/
│   │   ├── page.tsx                    # Adaptive dashboard
│   │   └── loading.tsx                 # Dashboard loading state
│   ├── profile/page.tsx                # Edit profile
│   ├── journal/
│   │   ├── page.tsx                    # Journal list with filters
│   │   ├── new/page.tsx                # Create new entry
│   │   └── [id]/
│   │       ├── page.tsx                # View entry + AI summary
│   │       └── edit/page.tsx           # Edit entry
│   ├── vault/page.tsx                  # Document vault
│   ├── finances/page.tsx               # Financial tracker
│   ├── timeline/page.tsx               # Timeline with chronological events
│   └── api/journal/summarise/route.ts  # AI summary API endpoint
│
├── components/
│   ├── ui/                             # Reusable UI primitives
│   │   ├── Button.tsx                  # Button with variants (primary/secondary/outline)
│   │   ├── Input.tsx                   # Text input with label
│   │   ├── Card.tsx                    # Card wrapper
│   │   ├── Select.tsx                  # Dropdown select
│   │   ├── Checkbox.tsx                # Checkbox input
│   │   └── LoadingSpinner.tsx          # Loading indicator
│   ├── onboarding/                     # Onboarding step components
│   │   ├── ProgressBar.tsx             # Step progress indicator
│   │   ├── OptionCard.tsx              # Clickable option card
│   │   ├── StepLocation.tsx            # Country selection
│   │   ├── StepRelationship.tsx        # Relationship type
│   │   ├── StepStage.tsx               # Divorce stage
│   │   ├── StepPriorities.tsx          # Multi-select priorities
│   │   └── StepChildren.tsx            # Children info
│   ├── dashboard/                      # Dashboard components
│   │   ├── Header.tsx                  # Nav bar (Journal, Vault, Finances, Profile, Logout)
│   │   ├── ContentBlock.tsx            # Block type router
│   │   ├── Checklist.tsx               # Persistent checklist (DB-backed)
│   │   ├── PromptCard.tsx              # Reflection prompts
│   │   ├── InfoCard.tsx                # Info display
│   │   └── PlaceholderCard.tsx         # Coming soon placeholder
│   └── journal/                        # Journal components
│       ├── EntryCard.tsx               # Entry preview for list view
│       ├── MoodPicker.tsx              # 8 mood chips with colour coding
│       ├── CategoryPicker.tsx          # 7 category chips
│       └── AISummarySection.tsx        # AI summary display/actions
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server Supabase client (cookie-based)
│   │   └── middleware.ts               # Auth middleware utilities
│   ├── onboarding-config.ts            # Onboarding options & labels
│   └── dashboard-content.ts            # Dynamic content block definitions
│
└── types/
    └── index.ts                        # All TypeScript types & constants

middleware.ts                            # Root Next.js middleware (auth enforcement)
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

## Middleware

The middleware (`middleware.ts`) handles:
- Session refresh on each request
- Redirecting unauthenticated users from protected routes
- Redirecting authenticated users from auth pages to dashboard/onboarding
- Public routes (no auth): `/`, `/login`, `/signup`
- All other routes require authentication

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
| created_at | timestamptz | When profile was created |
| updated_at | timestamptz | Last update time |

### Table: `journal_entries`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles.id |
| title | text | Optional title |
| content | text | Raw journal entry (required) |
| mood | text | calm, anxious, angry, sad, overwhelmed, hopeful, frustrated, relieved |
| category | text | legal, financial, children, housing, emotional, communication, other |
| incident_date | date | When the incident occurred |
| ai_summary | text | AI-generated professional summary (null until generated) |
| ai_summary_generated_at | timestamptz | When summary was last generated |
| created_at | timestamptz | Entry creation time |
| updated_at | timestamptz | Last update time |

### Table: `checklist_progress`

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | FK to profiles.id (compound PK) |
| checklist_id | text | Dashboard checklist identifier (compound PK) |
| completed_items | text[] | Array of completed item IDs |
| updated_at | timestamptz | Last update time |

### Table: `documents`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles.id |
| file_name | text | Display filename |
| file_path | text | Supabase Storage path |
| file_size | integer | File size in bytes |
| mime_type | text | MIME type |
| category | text | legal, financial, personal, correspondence, court, other |
| notes | text | User notes/description |
| uploaded_at | timestamptz | Upload time |

### Table: `financial_items`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles.id |
| type | text | asset, debt, income, expense |
| name | text | Item name (required) |
| amount | decimal(12,2) | Dollar amount (required) |
| frequency | text | one_time, monthly, annually (nullable, income/expense only) |
| notes | text | Optional notes |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update time |

### Table: `timeline_events`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles.id |
| title | text | Event title (required) |
| description | text | Optional details |
| event_date | date | When the event occurred (required) |
| category | text | legal, financial, personal, emotional, children |
| created_at | timestamptz | Creation time |

### Row Level Security

All tables have RLS enabled. Policy on all tables: `auth.uid() = user_id` (or `auth.uid() = id` for profiles).

### Supabase Storage

- **Bucket:** `documents` (private)
- **Path structure:** `{user_id}/{timestamp}-{filename}`
- **RLS policies:** Users can only upload/view/delete files in their own folder
- **Constraints:** 50MB max file size; PDF, JPG, PNG, WebP, DOC, DOCX, TXT

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
- Checklists persist progress to `checklist_progress` table via upsert

### Journal
- List view fetches entries ordered by `created_at DESC` with client-side filtering
- Create/edit forms use client components with Supabase browser client
- AI summary generated server-side via `/api/journal/summarise` (Groq API)
- Editing an entry clears the AI summary (user must regenerate)

### Document Vault
- Upload: file goes to Supabase Storage, metadata saved to `documents` table
- Download: generates signed URL with 60-second expiry
- Delete: removes from both Storage and database
- Inline editing for metadata (filename, category, notes)

### AI Summary
1. Frontend sends `{ entryId }` to `POST /api/journal/summarise`
2. Server fetches entry from Supabase (RLS verifies ownership)
3. Calls Groq API (`llama-3.3-70b-versatile`) with structured prompt
4. Saves summary + timestamp to `journal_entries` table
5. Returns summary JSON to frontend
6. Output: structured incident report (date, people, events, statements, children, legal points, status)

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GROQ_API_KEY=gsk_...
```
