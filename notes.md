# Divorce Companion — MVP 1 Complete Specification

## Project Overview

**Project name:** Divorce Companion
**Goal:** Deliver a functional onboarding + profile system and a simple user dashboard that adapts content based on user stage and priorities.
**Tech stack:** Next.js 14 (App Router), Supabase (Auth + PostgreSQL), Tailwind CSS, Vercel hosting

---

## Target Users

- International spouse going through cross-border divorce
- Expat mother needing structure during separation
- Common-law partner navigating separation
- Post-separation individual needing admin support and organisation

---

## Scope Definition

### MVP 1 MUST INCLUDE
- [ ] Public landing page (basic)
- [ ] User signup with email + password
- [ ] User login with email + password
- [ ] Onboarding questionnaire (5 steps with conditional logic)
- [ ] User profile stored in Supabase database
- [ ] Dashboard that adapts content blocks based on user's stage and priorities
- [ ] Edit profile functionality
- [ ] Responsive layout (desktop + mobile web)
- [ ] Deployed staging URL on Vercel
- [ ] Basic README with setup instructions

### MVP 1 MUST NOT INCLUDE
- ❌ Legal advice or legal guidance
- ❌ AI features or AI generation
- ❌ Payment processing
- ❌ Notifications (email or push)
- ❌ Messaging or chat
- ❌ Multi-language support
- ❌ Mobile apps (web only)
- ❌ Advanced design polish (functional > beautiful for MVP)

**Rule: Anything not explicitly listed above is Phase 2. If new ideas come up, park them.**

---

## Database Schema

### Table: `profiles`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, matches auth.users.id |
| email | text | User's email |
| country | text | Country of residence |
| relationship_type | text | 'married' \| 'international_marriage' \| 'common_law' \| 'divorced' |
| stage | text | 'thinking' \| 'separated' \| 'in_court' \| 'post_divorce' |
| priorities | text[] | Array of: 'children', 'finances', 'housing', 'emotional_support', 'legal_admin' |
| has_children | boolean | Whether user has children |
| children_count | integer | Number of children (nullable) |
| children_ages | text | Ages of children as free text (nullable) |
| onboarding_completed | boolean | Whether onboarding is finished |
| created_at | timestamp | When profile was created |
| updated_at | timestamp | Last update time |

### Row Level Security (RLS)
- Users can only SELECT their own profile (auth.uid() = id)
- Users can only UPDATE their own profile (auth.uid() = id)
- Users can only INSERT their own profile (auth.uid() = id)

### Database Trigger
- On user signup (auth.users INSERT), automatically create a matching row in profiles table with id and email

---

## Page Structure

### Public Pages (no auth required)
```
/ → Landing page
/login → Login form
/signup → Signup form
```

### Protected Pages (auth required)
```
/onboarding → 5-step onboarding questionnaire
/dashboard → Main adaptive dashboard
/profile → Edit profile page
```

### Auth Flow
1. User signs up → Supabase creates auth.users row → trigger creates profiles row
2. User is redirected to /onboarding
3. User completes onboarding → profile updated with all fields → onboarding_completed = true
4. User redirected to /dashboard
5. On future logins: if onboarding_completed = false → redirect to /onboarding, else → /dashboard

---

## Onboarding Flow (5 Steps)

### Step 1: Location
- **Question:** "Where do you currently live?"
- **Input type:** Dropdown/select
- **Options:**
  - United Kingdom
  - Ireland
  - United States
  - Canada
  - Australia
  - New Zealand
  - Germany
  - France
  - Netherlands
  - Spain
  - Italy
  - Other
- **Saves to:** `country`

### Step 2: Relationship Type
- **Question:** "What is your relationship status?"
- **Input type:** Single select (radio buttons or cards)
- **Options:**
  - Married
  - International Marriage (married in different country)
  - Common-law Partnership
  - Already Divorced
- **Saves to:** `relationship_type`

### Step 3: Stage
- **Question:** "Where are you in the process?"
- **Input type:** Single select (radio buttons or cards)
- **Options:**
  - Thinking about leaving — "Considering your options"
  - Separated — "Living apart, not yet divorced"
  - In court proceedings — "Going through legal divorce process"
  - Post-divorce — "Divorce finalised, rebuilding"
- **Saves to:** `stage`

### Step 4: Priorities
- **Question:** "What matters most to you right now?"
- **Input type:** Multi-select (checkboxes or toggleable cards)
- **Instruction:** "Select all that apply"
- **Options:**
  - Children — "Parenting arrangements and child welfare"
  - Finances — "Budgeting, assets, and financial planning"
  - Housing — "Living arrangements and property"
  - Emotional Support — "Mental health and wellbeing"
  - Legal & Admin — "Paperwork and legal organisation"
- **Saves to:** `priorities` (as array)

### Step 5: Children
- **Question:** "Do you have children?"
- **Input type:** Yes/No toggle or buttons
- **Saves to:** `has_children`
- **Conditional fields (if Yes):**
  - "How many children?" → number input → saves to `children_count`
  - "What are their ages? (optional)" → text input → saves to `children_ages`

### Onboarding UI Requirements
- Show progress indicator (Step 1 of 5, Step 2 of 5, etc.)
- Back button on steps 2-5
- Next button on steps 1-4
- Finish/Complete button on step 5
- All state stored client-side until final submission
- Single database write on completion (update profiles row)
- Set `onboarding_completed = true` on finish

---

## Dashboard Behaviour

### Core Principle
**"The dashboard does not change design/layout, only content blocks."**

All users see the same dashboard shell/layout. The content blocks inside change based on their profile.

### Dashboard Layout
```
┌─────────────────────────────────────────┐
│ Header (Logo, Profile/Logout)           │
├─────────────────────────────────────────┤
│ Welcome message with user's stage       │
├─────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐        │
│ │ Content     │ │ Content     │        │
│ │ Block 1     │ │ Block 2     │        │
│ └─────────────┘ └─────────────┘        │
│ ┌─────────────┐ ┌─────────────┐        │
│ │ Content     │ │ Content     │        │
│ │ Block 3     │ │ Block 4     │        │
│ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────┘
```

### Content Block Selection Logic

#### Stage-based blocks (always shown based on stage):

**If stage = "thinking":**
- Checklist: "Things to Consider" (review finances, speak to counsellor, gather documents, research options)
- Prompt: Reflection prompt about considering the future

**If stage = "separated":**
- Checklist: "Immediate Admin Tasks" (secure documents, separate bank account, update emergency contacts, review shared accounts)
- Prompt: Daily check-in journaling prompt

**If stage = "in_court":**
- Checklist: "Court Preparation" (organise documents, keep communication records, note deadlines, prepare solicitor questions)
- Info block: "Stay Organised" tips

**If stage = "post_divorce":**
- Checklist: "Moving Forward" (update legal documents, update name if applicable, review beneficiaries, set new goals)
- Prompt: "New Chapter" reflection prompt

#### Priority-based blocks (added based on selected priorities):

**If priorities includes "children":**
- Checklist: "Children & Parenting" (maintain routines, respectful communication, consider children's counselling, document arrangements)
- Info block: "Supporting Your Children" guidance

**If priorities includes "finances":**
- Checklist: "Financial Organisation" (list assets/debts, gather statements, create budget, check credit score)
- Placeholder: "Expense Tracker — Coming in future update"

**If priorities includes "housing":**
- Checklist: "Housing Considerations" (review options, understand rights, research rentals, update address)

**If priorities includes "emotional_support":**
- Checklist: "Self-Care" (reach out to support network, consider professional help, maintain physical health, allow grieving)
- Prompt: Daily gratitude reflection

**If priorities includes "legal_admin":**
- Checklist: "Legal & Admin Tasks" (research solicitors, gather marriage certificate, understand timeline, keep correspondence copies)

### Content Block Types

1. **Checklist** — List of items with checkboxes (state NOT persisted in MVP, just visual)
2. **Prompt** — Static text card with reflection question or encouragement
3. **Info** — Static text card with helpful information
4. **Placeholder** — Greyed out card indicating future feature

### Content Block Component Structure
```typescript
interface ContentBlock {
  id: string;
  type: 'checklist' | 'prompt' | 'info' | 'placeholder';
  title: string;
  content: string | ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean; // Local state only, not persisted
}
```

---

## Landing Page

### Required Elements
- Logo/app name
- Headline explaining what the app does
- Subheadline for target audience
- "Get Started" button → /signup
- "Already have an account? Log in" link → /login

### Example Copy (placeholder, can be improved)
- **Headline:** "Navigate your separation with clarity"
- **Subheadline:** "Structured support and organisation tools for individuals going through divorce"

---

## Auth Pages

### Signup Page (/signup)
- Email input (required, validated)
- Password input (required, min 8 characters)
- Confirm password input (must match)
- "Create Account" button
- "Already have an account? Log in" link
- Show loading state during submission
- Show error messages (email taken, password too short, etc.)
- On success → redirect to /onboarding

### Login Page (/login)
- Email input
- Password input
- "Log In" button
- "Don't have an account? Sign up" link
- Show loading state during submission
- Show error messages (invalid credentials)
- On success → check onboarding_completed:
  - If false → redirect to /onboarding
  - If true → redirect to /dashboard

---

## Profile Page (/profile)

### Required Elements
- Display all current profile data
- Edit form with same fields as onboarding
- "Save Changes" button
- "Back to Dashboard" link
- Show loading/saving states
- Show success message on save

### Behaviour
- On save, update profiles row in Supabase
- Redirect or show confirmation

---

## Technical Implementation

### Folder Structure
```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── signup/
│   │   └── page.tsx               # Signup page
│   ├── onboarding/
│   │   └── page.tsx               # Onboarding flow
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard
│   └── profile/
│       └── page.tsx               # Edit profile
├── components/
│   ├── ui/                        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   └── Card.tsx
│   ├── onboarding/                # Onboarding step components
│   │   ├── StepLocation.tsx
│   │   ├── StepRelationship.tsx
│   │   ├── StepStage.tsx
│   │   ├── StepPriorities.tsx
│   │   ├── StepChildren.tsx
│   │   └── ProgressBar.tsx
│   └── dashboard/                 # Dashboard components
│       ├── ContentBlock.tsx
│       ├── Checklist.tsx
│       ├── PromptCard.tsx
│       ├── InfoCard.tsx
│       └── PlaceholderCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase browser client
│   │   └── server.ts              # Supabase server client
│   ├── dashboard-content.ts       # Content block definitions
│   └── onboarding-config.ts       # Onboarding options
└── types/
    └── index.ts                   # TypeScript type definitions
```

### TypeScript Types
```typescript
export type RelationshipType = 
  | 'married'
  | 'international_marriage'
  | 'common_law'
  | 'divorced';

export type Stage = 
  | 'thinking'
  | 'separated'
  | 'in_court'
  | 'post_divorce';

export type Priority = 
  | 'children'
  | 'finances'
  | 'housing'
  | 'emotional_support'
  | 'legal_admin';

export interface Profile {
  id: string;
  email: string;
  country: string;
  relationship_type: RelationshipType;
  stage: Stage;
  priorities: Priority[];
  has_children: boolean;
  children_count: number | null;
  children_ages: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
```

### Supabase Setup Required
1. Create new Supabase project
2. Run database schema SQL (create profiles table, RLS policies, triggers)
3. Get project URL and anon key
4. Create .env.local with credentials

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Deliverables Checklist

By end of MVP 1, confirm delivery of:

- [ ] Working landing page
- [ ] Working signup flow
- [ ] Working login flow
- [ ] Working 5-step onboarding with conditional logic
- [ ] Profile stored in Supabase and editable
- [ ] Adaptive dashboard showing different content based on profile
- [ ] Responsive on desktop and mobile
- [ ] Deployed to Vercel with staging URL
- [ ] README with setup and run instructions
- [ ] docs/ARCHITECTURE.md
- [ ] docs/DECISIONS.md
- [ ] docs/ROADMAP.md

---

## Development Order

1. **Setup:** Supabase project, environment variables, Supabase client
2. **Types:** Create TypeScript types and config files
3. **Auth:** Signup and login pages
4. **Onboarding:** 5-step flow with progress bar
5. **Dashboard:** Layout and conditional content blocks
6. **Profile:** Edit profile page
7. **Polish:** Error handling, loading states, responsive design
8. **Deploy:** Vercel deployment
9. **Docs:** README and documentation

---

## Notes for Development

- Keep components simple and functional
- Use Tailwind for all styling (no custom CSS files)
- Content can be placeholder text — functionality matters more than copy
- Don't over-engineer — this is an MVP
- Ask for clarification on anything unclear before building
- Commit frequently with descriptive messages

Git workflow:
- Create feature branches for each piece of work (feat/auth, feat/onboarding, etc.)
- Make small, descriptive commits as you build
- Push to remote regularly
- When a feature is complete, merge to main

Start by creating a feat/setup branch for the initial project structure.