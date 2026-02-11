# Divorce Companion

## Product Vision

**One-liner:** A "divorce brain" — one place to hold everything so users don't have to.

**The problem:** People going through divorce are overwhelmed. They're juggling legal documents, financial details, emotional turmoil, and communication with professionals — all while their cognitive capacity is at its lowest. They use scattered tools (Notes, Google Drive, spreadsheets, email) and lose track of what they told whom, when.

**The solution:** Divorce Companion is a centralised hub where users store everything related to their divorce — journal entries, documents, finances, timeline of events. When they need to communicate with a lawyer or therapist, AI helps them generate professional summaries from their raw, emotional data.

**What makes it different:**
- Not legal advice (lawyers do that) — administrative and emotional support
- Not therapy (therapists do that) — practical organisation with emotional awareness
- Context-aware: adapts to where the user is in their divorce journey
- The "in-between" space nobody else serves

---

## Two Modes of Use

### Mode 1: Reactive (in the moment)
Something happens → User writes it down raw and emotional → Later, AI cleans it up into professional language → User sends to lawyer/therapist

**Example:** Sally has an argument with her ex. She opens the app and writes everything raw — "He said he'd burn the house down before letting me have it, the kids were crying." Two days later, she needs to talk to her lawyer. She hits "Generate Summary" and AI produces: "On February 5th, spouse made a threatening statement regarding the family home. Children (ages 8 and 11) were present and distressed."

### Mode 2: Comprehensive (building a full picture)
Over time, user fills in everything — journal entries, documents, finances, timeline → When they need to talk to a professional, AI pulls from ALL of it and generates a complete situation brief

**Example:** User has been logging for 3 months. They have 40 journal entries, 12 documents, a full financial picture, and a timeline of key events. They click "Generate Full Brief" and AI produces a 2-page professional summary of their entire situation for a new lawyer.

---

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Supabase** (Auth + PostgreSQL + Storage)
- **Tailwind CSS 4**
- **TypeScript** (strict mode)
- **Groq SDK** (AI summarisation — Llama 3.3 70B)
- **Vercel** (hosting)

---

## Build Status

### MVP 1 — COMPLETE

- Auth (signup/login with email)
- 5-step onboarding (country, relationship type, stage, priorities, children)
- Adaptive dashboard (content changes based on stage and priorities)
- Profile editing
- Deployed to Vercel: https://divorce-companion-two.vercel.app/

### Phase 2: Core Features — COMPLETE

| Priority | Feature | Status |
|----------|---------|--------|
| 1 | Journal with AI Summary | DONE |
| 2 | Persistent Checklists | DONE |
| 3 | Document Vault | DONE |
| 4 | Financial Tracker | DONE |
| 5 | Timeline | DONE |
| 6 | Full Brief Generator | DONE |

### Phase 3: Polish & UX Improvements — COMPLETE (except Task 13)

| Priority | Task | Status |
|----------|------|--------|
| P1 | Mobile hamburger nav | DONE |
| P1 | Page header mobile layouts | DONE |
| P1 | Vault card mobile layout | DONE |
| P1 | Finance cards mobile layout | DONE |
| P2 | Forgot password flow | DONE |
| P2 | Password visibility toggle | DONE |
| P2 | Display name + personalisation | DONE |
| P2 | Landing page features | DONE |
| P2 | Journal auto-save drafts | DONE |
| P2 | Onboarding mobile UX | DONE |
| P3 | Currency from country | DONE |
| P3 | Timeline colour legend | DONE |
| P3 | Brief preview + history | TODO (needs DB migration) |
| P3 | Vault file type badges | DONE |
| P3 | Journal writing prompts | DONE |
| P3 | Dashboard recent activity | DONE |
| P3 | Replace expense placeholder | DONE |
| P4 | Vault overflow menu on mobile | DONE |
| P4 | Timeline future events indicator | DONE |
| P4 | Journal textarea mobile sizing | DONE |
| P4 | Profile account management | DONE |
| P4 | Signup privacy note | DONE |

---

## What's Built — Detailed Reference

### Authentication & Onboarding

**Auth flow:**
1. User signs up via `/signup` → Supabase creates `auth.users` row
2. Database trigger creates matching `profiles` row
3. User redirected to `/onboarding` → 5-step wizard
4. Profile updated with `onboarding_completed = true`
5. User redirected to `/dashboard`
6. Future logins: if onboarding incomplete → `/onboarding`, otherwise → `/dashboard`

**Password reset flow:**
1. User clicks "Forgot password?" on `/login` → goes to `/forgot-password`
2. Enters email → `resetPasswordForEmail()` sends email with reset link
3. Email link redirects through Supabase → `/auth/callback?code=xxx&next=/reset-password`
4. Auth callback route exchanges code for session via `exchangeCodeForSession()`
5. User redirected to `/reset-password` with valid session
6. User sets new password via `updateUser({ password })`

**Auth callback:** `src/app/auth/callback/route.ts` — server route handler for Supabase PKCE code exchange. Handles password reset and any future OAuth flows.

**Middleware** (`middleware.ts`) handles session refresh, auth redirects, and onboarding enforcement on every request. Public routes: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`. Everything else requires auth.

**Onboarding UX:**
- 5-step wizard: Country → Relationship → Stage → Priorities → Children
- Full-width buttons on mobile, side-by-side on desktop
- Primary fill on selected OptionCard (inverted colours when selected)
- "Skip this step" option on steps 1-4
- Responsive headings (`text-xl sm:text-2xl`)

**Signup:** Includes privacy note — "Your data is private and encrypted."

### Dashboard

Server component that fetches user profile and generates adaptive content blocks via `getContentBlocksForUser()`. Content changes based on the user's divorce stage and selected priorities. Includes navigation header with links to Journal, Vault, Finances, Timeline, Brief, Profile, and Logout.

**Recent Activity Card:** "Your Progress" card at top of dashboard showing counts and latest item for journal entries, documents, timeline events, and financial items. Each stat is a clickable link to the respective page. Only shown when user has data. Fetched server-side via parallel Supabase queries.

**Personalised Greeting:** Shows "Welcome back, [display_name]" if set, otherwise "Welcome back".

### Journal (Priority 1) — DONE

Users write raw emotional entries. AI generates professional summaries for lawyers/therapists.

**Routes:**

| Route | File | Purpose |
|-------|------|---------|
| `/journal` | `src/app/journal/page.tsx` | List view with mood/category/search filters |
| `/journal/new` | `src/app/journal/new/page.tsx` | Create entry with content, mood, category, incident date |
| `/journal/[id]` | `src/app/journal/[id]/page.tsx` | View entry with AI summary section |
| `/journal/[id]/edit` | `src/app/journal/[id]/edit/page.tsx` | Edit entry (clears AI summary with warning) |

**Components:**

| Component | File | Purpose |
|-----------|------|---------|
| EntryCard | `src/components/journal/EntryCard.tsx` | Entry preview card for list view |
| MoodPicker | `src/components/journal/MoodPicker.tsx` | 8 clickable mood chips with colour coding |
| CategoryPicker | `src/components/journal/CategoryPicker.tsx` | 7 clickable category chips |
| AISummarySection | `src/components/journal/AISummarySection.tsx` | Generate/display summary with Copy, Export PDF, Regenerate |

**Writing Prompts:** 8 clickable prompt suggestions shown below the textarea when empty (e.g. "What happened today that's on your mind?", "How did a conversation with your ex go?"). Clicking a prompt inserts it as starter text. Prompts disappear once there's content.

**Auto-save Drafts:** Content, title, mood, category, and date auto-save to localStorage with 1s debounce. Recovery banner on page load offers "Resume" or "Discard". Drafts expire after 7 days. Cleared on successful save.

**Mobile:** Textarea min-height is 160px on mobile, 240px on desktop.

**AI Summary API:** `POST /api/journal/summarise`
- File: `src/app/api/journal/summarise/route.ts`
- Uses Groq API with `llama-3.3-70b-versatile` model
- Verifies user owns entry via RLS before processing
- Generates structured incident report (date, people, events, statements, children, legal points, status)
- Saves summary to `ai_summary` column in database
- PDF export uses browser print API on generated HTML

**Database: `journal_entries`**
```sql
id UUID PK, user_id UUID FK, title TEXT, content TEXT NOT NULL,
mood TEXT, category TEXT, incident_date DATE,
ai_summary TEXT, ai_summary_generated_at TIMESTAMPTZ,
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
-- RLS: auth.uid() = user_id
```

**Mood options:** calm, anxious, angry, sad, overwhelmed, hopeful, frustrated, relieved
**Category options:** legal, financial, children, housing, emotional, communication, other

### Persistent Checklists (Priority 2) — DONE

Dashboard checklists save state to Supabase. Progress persists across sessions.

**Database: `checklist_progress`**
```sql
user_id UUID, checklist_id TEXT, completed_items TEXT[],
updated_at TIMESTAMPTZ
-- Primary key: (user_id, checklist_id)
-- RLS: per-user access
-- Upsert on conflict (user_id, checklist_id)
```

### Document Vault (Priority 3) — DONE

Users upload, categorise, and manage divorce-related documents.

**Route:** `/vault` (`src/app/vault/page.tsx`)

**Features:**
- File upload with validation (50MB max; PDF, JPG, PNG, WebP, DOC, DOCX, TXT)
- Category tagging (legal, financial, personal, correspondence, court, other)
- Notes/description field per document
- Search by filename or notes
- Filter by category
- Inline metadata editing (filename, category, notes)
- Download via signed URL (60-second expiry)
- Delete with confirmation
- **File type badges** — colour-coded PDF (red), IMG (blue), DOC (purple), TXT (grey) badges next to filename based on mime_type
- **Mobile overflow menu** — vertical dots dropdown on mobile (`<sm`) with Edit/Download/Delete actions; inline buttons on desktop

**Database: `documents`**
```sql
id UUID PK, user_id UUID FK, file_name TEXT NOT NULL,
file_path TEXT NOT NULL, file_size INTEGER, mime_type TEXT,
category TEXT, notes TEXT, uploaded_at TIMESTAMPTZ
-- RLS: auth.uid() = user_id
```

**Supabase Storage:** Bucket `documents`, path `{user_id}/{timestamp}-{filename}`, private with RLS policies.

### Financial Tracker (Priority 4) — DONE

Users track assets, debts, income, and expenses. Single-page design with summary dashboard and inline CRUD.

**Route:** `/finances` (`src/app/finances/page.tsx`)

**Features:**
- Summary cards: Total Assets, Total Debts, Net Worth, Monthly Income, Monthly Expenses, Monthly Net
- Income/expense amounts normalised to monthly (annual amounts divided by 12)
- Add item form with type chips, name, amount, frequency (income/expense only), notes
- Type filter dropdown (All, Assets, Debts, Income, Expenses)
- Search by name
- Inline edit and delete with confirmation
- Colour-coded type badges (green=asset, red=debt, blue=income, amber=expense)
- **Dynamic currency** — fetches user's profile country on mount, formats all amounts with correct locale and currency via `src/lib/currency.ts` (e.g. GBP for UK, EUR for Ireland/Germany/France, USD for US)

**Currency mapping** (`src/lib/currency.ts`):
Maps onboarding country values to `{ locale, currency, symbol }`. Falls back to USD for unknown countries or no country set.

**Database: `financial_items`**
```sql
id UUID PK, user_id UUID FK, type TEXT NOT NULL,
name TEXT NOT NULL, amount DECIMAL(12,2) NOT NULL,
frequency TEXT, notes TEXT,
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
-- RLS: auth.uid() = user_id
```

**Type options:** asset, debt, income, expense
**Frequency options:** one_time, monthly, annually (only for income/expense)

---

### Timeline (Priority 5) — DONE

Users log key events in their divorce journey with dates.

**Route:** `/timeline` (`src/app/timeline/page.tsx`)

**Features:**
- Chronological view grouped by year with visual timeline (vertical line + coloured dots)
- Add event with title, date, category, and description
- Inline edit and delete with confirmation
- Search by title or description
- Filter by category
- Category-coloured timeline dots (purple=legal, green=financial, blue=personal, rose=emotional, amber=children)
- **Colour legend** — row of coloured dots with category labels below filters, visible when events exist
- **Future events indicator** — sky-blue "Upcoming" badge for events with dates after today

**Database: `timeline_events`**
```sql
id UUID PK, user_id UUID FK, title TEXT NOT NULL,
description TEXT, event_date DATE NOT NULL,
category TEXT, created_at TIMESTAMPTZ
-- RLS: auth.uid() = user_id
```

**Category options:** legal, financial, personal, emotional, children

---

### Full Brief Generator (Priority 6) — DONE

Generates a comprehensive professional situation brief from ALL user data.

**Route:** `/brief` (`src/app/brief/page.tsx`)

**Features:**
- Data overview cards showing counts (journal entries, timeline events, financial items, documents)
- One-click generation — fetches all user data, bundles into prompt, sends to Groq
- Structured output: Client Overview, Situation Summary, Key Incidents, Financial Position, Documents Available, Areas of Concern, Recommended Next Steps
- Copy to clipboard and Export PDF
- Regenerate button
- Data sources summary showing what was included

**API:** `POST /api/brief/generate` (`src/app/api/brief/generate/route.ts`)
- Fetches journal entries (up to 30, prefers AI summaries), documents, financial items, timeline events, and user profile
- Builds structured prompt with all sections
- Uses Groq (`llama-3.3-70b-versatile`) with 3000 max tokens
- Returns brief text and data counts

---

### Profile — DONE

**Route:** `/profile` (`src/app/profile/page.tsx`)

**Features:**
- Edit display name, country, relationship type, stage, priorities, children info
- **Change password** — new password + confirm fields with validation (8+ chars, match), uses `supabase.auth.updateUser()`
- **Delete account** — confirmation step, signs user out, directs to contact support for permanent data deletion

---

## Database Schema (Complete)

### `profiles` (MVP 1)
```sql
id UUID PK (refs auth.users), email TEXT, display_name TEXT,
country TEXT, relationship_type TEXT, stage TEXT, priorities TEXT[],
has_children BOOLEAN, children_count INTEGER, children_ages TEXT,
onboarding_completed BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

### `journal_entries` (Priority 1)
```sql
id UUID PK, user_id UUID FK (refs profiles), title TEXT,
content TEXT NOT NULL, mood TEXT, category TEXT,
incident_date DATE, ai_summary TEXT,
ai_summary_generated_at TIMESTAMPTZ,
created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

### `checklist_progress` (Priority 2)
```sql
user_id UUID, checklist_id TEXT,
completed_items TEXT[], updated_at TIMESTAMPTZ
-- PK: (user_id, checklist_id)
```

### `documents` (Priority 3)
```sql
id UUID PK, user_id UUID FK (refs profiles),
file_name TEXT NOT NULL, file_path TEXT NOT NULL,
file_size INTEGER, mime_type TEXT, category TEXT,
notes TEXT, uploaded_at TIMESTAMPTZ
```

### `financial_items` (Priority 4)
```sql
id UUID PK, user_id UUID FK (refs profiles),
type TEXT NOT NULL, name TEXT NOT NULL,
amount DECIMAL(12,2) NOT NULL, frequency TEXT,
notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
```

### `timeline_events` (Priority 5)
```sql
id UUID PK, user_id UUID FK (refs profiles),
title TEXT NOT NULL, description TEXT,
event_date DATE NOT NULL, category TEXT,
created_at TIMESTAMPTZ
```

All tables have RLS enabled with `auth.uid() = user_id` policies.

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page with feature cards
│   ├── layout.tsx                      # Root layout (Geist fonts, globals)
│   ├── globals.css                     # Tailwind styles
│   ├── error.tsx                       # Global error boundary
│   ├── not-found.tsx                   # 404 page
│   ├── loading.tsx                     # Global loading state
│   ├── login/page.tsx                  # Login form + forgot password link
│   ├── signup/page.tsx                 # Signup form + privacy note
│   ├── forgot-password/page.tsx        # Request password reset email
│   ├── reset-password/page.tsx         # Set new password (requires auth session)
│   ├── auth/callback/route.ts          # Supabase PKCE code exchange
│   ├── onboarding/page.tsx             # 5-step onboarding wizard
│   ├── dashboard/
│   │   ├── page.tsx                    # Adaptive dashboard + activity card
│   │   └── loading.tsx                 # Dashboard loading state
│   ├── profile/page.tsx                # Edit profile + change password + delete account
│   ├── journal/
│   │   ├── page.tsx                    # Journal list with filters
│   │   ├── new/page.tsx                # Create entry + writing prompts + auto-save
│   │   └── [id]/
│   │       ├── page.tsx                # View entry + AI summary
│   │       └── edit/page.tsx           # Edit entry
│   ├── vault/page.tsx                  # Document vault + file type badges + mobile overflow menu
│   ├── finances/page.tsx               # Financial tracker + dynamic currency
│   ├── timeline/page.tsx               # Timeline + colour legend + upcoming badge
│   ├── brief/page.tsx                  # Full situation brief generator
│   └── api/
│       ├── journal/summarise/route.ts  # AI journal summary endpoint
│       └── brief/generate/route.ts     # AI full brief endpoint
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx                  # Button with variants (primary/secondary/outline)
│   │   ├── Input.tsx                   # Text input with label + password visibility toggle
│   │   ├── Card.tsx                    # Card wrapper
│   │   ├── Select.tsx                  # Dropdown select
│   │   ├── Checkbox.tsx                # Checkbox input
│   │   └── LoadingSpinner.tsx          # Loading indicator
│   ├── onboarding/
│   │   ├── ProgressBar.tsx             # Step progress indicator
│   │   ├── OptionCard.tsx              # Clickable option card (primary fill when selected)
│   │   ├── StepLocation.tsx            # Country selection
│   │   ├── StepRelationship.tsx        # Relationship type
│   │   ├── StepStage.tsx               # Divorce stage
│   │   ├── StepPriorities.tsx          # Multi-select priorities
│   │   └── StepChildren.tsx            # Children info
│   ├── dashboard/
│   │   ├── Header.tsx                  # Nav bar with hamburger menu on mobile
│   │   ├── ContentBlock.tsx            # Block type router
│   │   ├── Checklist.tsx               # Persistent checklist (DB-backed)
│   │   ├── PromptCard.tsx              # Reflection prompts
│   │   ├── InfoCard.tsx                # Info display
│   │   └── PlaceholderCard.tsx         # Coming soon placeholder
│   └── journal/
│       ├── EntryCard.tsx               # Entry preview for list
│       ├── MoodPicker.tsx              # Mood chip selector
│       ├── CategoryPicker.tsx          # Category chip selector
│       └── AISummarySection.tsx        # AI summary display/actions
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server Supabase client (cookies)
│   │   └── middleware.ts               # Auth middleware utilities
│   ├── onboarding-config.ts            # Onboarding options & labels
│   ├── dashboard-content.ts            # Dynamic content block definitions
│   └── currency.ts                     # Country-to-currency mapping
│
└── types/
    └── index.ts                        # All TypeScript types & constants

middleware.ts                            # Root Next.js middleware (auth enforcement)
```

---

## Environment Variables

```env
# Supabase (public — used client-side)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# AI Summarisation (server-side only)
GROQ_API_KEY=gsk_...
```

---

## Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | React framework (App Router) |
| `react` | 19.2.3 | UI library |
| `react-dom` | 19.2.3 | DOM rendering |
| `@supabase/ssr` | ^0.8.0 | Server-side Supabase auth |
| `@supabase/supabase-js` | ^2.93.2 | Supabase client |
| `groq-sdk` | ^0.37.0 | Groq API for AI summaries |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5 | Type checking |
| `tailwindcss` | ^4 | Utility CSS |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 16.1.6 | Next.js ESLint rules |
| `babel-plugin-react-compiler` | 1.0.0 | React compiler optimisation |
| `@types/node` | ^20 | Node type definitions |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |

---

## AI Integration

**Provider:** Groq (NOT Anthropic)
**Model:** `llama-3.3-70b-versatile`
**SDK:** `groq-sdk`
**Endpoint:** `POST /api/journal/summarise`

**Flow:**
1. User clicks "Generate AI Summary" on a journal entry
2. Frontend sends `{ entryId }` to API route
3. Server verifies user owns entry via Supabase RLS
4. Calls Groq API with structured prompt
5. Saves summary + timestamp to `journal_entries` table
6. Returns summary to frontend

**Output format:** Structured incident report with sections:
- Incident Date
- People Involved
- Key Events (numbered, chronological)
- Statements Made
- Children's Involvement
- Legally Significant Points
- Current Status

**Disclaimer shown to user:** "This is an AI-generated draft. Please review before sharing."

---

## Git Workflow

### Branch Strategy

```
main (production)
  └── feat/<feature-name> (feature branches)
```

### Before Starting Any Feature

```bash
git checkout main
git pull origin main
git checkout -b feat/<feature-name>
```

### During Development

Commit frequently in logical chunks. NOT everything at once.

```bash
git add src/types/index.ts
git commit -m "feat(finances): add FinancialItem type"

git add src/app/finances/page.tsx
git commit -m "feat(finances): create overview page"
```

### Commit Message Format

Use conventional commits with scope:

| Type | When | Example |
|------|------|---------|
| `feat` | New feature | `feat(finances): add expense tracking` |
| `fix` | Bug fix | `fix(vault): handle upload timeout` |
| `docs` | Documentation | `docs: update CLAUDE.md` |
| `style` | Formatting | `style(journal): fix alignment` |
| `refactor` | Restructure | `refactor(dashboard): extract nav` |
| `test` | Tests | `test(finances): add CRUD tests` |
| `chore` | Maintenance | `chore: update dependencies` |

Scope: `(journal)`, `(vault)`, `(finances)`, `(timeline)`, `(dashboard)`, `(auth)`, `(onboarding)`, `(profile)`

### Finishing a Feature

```bash
git push origin feat/<feature-name>
git checkout main
git merge feat/<feature-name>
git push origin main
git branch -d feat/<feature-name>
```

### Rules for Claude Code

1. **ALWAYS create a feature branch before starting work**
2. **NEVER commit directly to main**
3. **Commit in small, logical chunks** — one component or one file at a time
4. **Use conventional commit messages** with scope
5. **Don't bundle unrelated changes** in one commit
6. **Push regularly** to keep remote up to date
7. **Update CLAUDE.md** when feature status changes

---

## Rules

- **No legal advice** — the app helps organise, not advise
- **No hardcoded API keys** — all secrets in `.env.local`
- **RLS on everything** — users can only access their own data
- **Functional > beautiful** — get it working, then polish
- **AI summaries are drafts** — always show disclaimer that user should review before sending
- **Privacy first** — this is sensitive data, treat it seriously

---

## Running Locally

```bash
npm install
# Create .env.local with Supabase credentials and GROQ_API_KEY
npm run dev
```

---

## Current Task

**Phase 3 is complete** (except Task 13: Brief preview + history, which requires a `briefs` DB table migration).

### Outstanding
- [ ] **Task 13: Brief preview + history** — save briefs to new `briefs` table, show previous briefs. Requires DB migration to create `briefs` table with RLS.

### DB Migrations
1. ~~`ALTER TABLE profiles ADD COLUMN display_name TEXT;`~~ — SQL file at `scripts/migrations/001_add_display_name.sql` (run on Supabase)
2. New `briefs` table with RLS (Task 13, not yet created)

### Branch
`feat/phase3-polish`

### Tailwind CSS 4 Note
Some Tailwind utility classes (e.g. `gap-x-4`) don't render correctly in Tailwind v4. Use inline `style={{ gap: '...' }}` as a workaround when gap utilities fail.
