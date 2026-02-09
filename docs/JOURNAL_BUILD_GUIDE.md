# Journal Feature — Build Guide

## FIRST: Git Setup

Before writing any code:

```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/journal
```

**Commit after each step below. Don't do everything then commit once.**

## Overview

Users write raw, emotional journal entries. Later, AI generates professional summaries for sharing with lawyers/therapists.

## Step 1: Database

Run this in Supabase SQL editor:

```sql
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  category TEXT,
  incident_date DATE DEFAULT CURRENT_DATE,
  ai_summary TEXT,
  ai_summary_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own journal entries"
  ON journal_entries FOR ALL
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**No git commit needed** — this is in Supabase, not your repo.

## Step 2: Types

Add to `src/types/index.ts`:

```typescript
export const MOODS = [
  'calm',
  'anxious',
  'angry',
  'sad',
  'overwhelmed',
  'hopeful',
  'frustrated',
  'relieved'
] as const;

export type Mood = typeof MOODS[number];

export const JOURNAL_CATEGORIES = [
  'legal',
  'financial',
  'children',
  'housing',
  'emotional',
  'communication',
  'other'
] as const;

export type JournalCategory = typeof JOURNAL_CATEGORIES[number];

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood: Mood | null;
  category: JournalCategory | null;
  incident_date: string;
  ai_summary: string | null;
  ai_summary_generated_at: string | null;
  created_at: string;
  updated_at: string;
}
```

**Git commit:**
```bash
git add src/types/index.ts
git commit -m "feat(journal): add JournalEntry type and constants"
```

## Step 3: Pages

### `/journal` — List View

- Fetch all entries for current user, ordered by created_at DESC
- Display as cards: title (or first 50 chars of content), date, mood chip, category chip
- Filters: mood dropdown, category dropdown, search input
- "New Entry" button → links to `/journal/new`
- Empty state if no entries

**Git commit after building:**
```bash
git add src/app/journal/page.tsx src/components/journal/EntryCard.tsx
git commit -m "feat(journal): create journal list view"
```

### `/journal/new` — Create Entry

- Large textarea for `content` (required, autofocus)
- Below textarea, collapsible "Add details" section:
  - `title` input (optional)
  - `mood` — clickable chips, single select
  - `category` — clickable chips, single select
  - `incident_date` — date picker, defaults to today
- Save button → insert to DB, redirect to `/journal/[id]`
- Cancel button → redirect to `/journal`

**Git commit after building:**
```bash
git add src/app/journal/new/page.tsx src/components/journal/MoodPicker.tsx src/components/journal/CategoryPicker.tsx
git commit -m "feat(journal): add new entry form with mood/category pickers"
```

### `/journal/[id]` — View Entry

- Display: title, created date, incident date, mood chip, category chip
- Full content text
- Divider line
- **AI Summary Section:**
  - If `ai_summary` is null: Show "Generate AI Summary" button
  - If `ai_summary` exists: Show summary in styled card, show "Regenerate" and "Copy" buttons
  - Show disclaimer: "This is an AI-generated draft. Please review before sharing."
- Edit button → `/journal/[id]/edit`
- Delete button → confirmation modal, then delete and redirect to `/journal`

**Git commit after building:**
```bash
git add src/app/journal/[id]/page.tsx src/components/journal/AISummarySection.tsx
git commit -m "feat(journal): add single entry view with AI summary section"
```

### `/journal/[id]/edit` — Edit Entry

- Same form as `/journal/new` but pre-filled
- Update on save
- Note: editing clears `ai_summary` (or prompt user to regenerate)

**Git commit after building:**
```bash
git add src/app/journal/[id]/edit/page.tsx
git commit -m "feat(journal): add entry edit page"
```

## Step 4: API Route for AI Summary

Create `/app/api/journal/summarise/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const supabase = createClient();
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { entryId } = await request.json();

  // Fetch entry and verify ownership
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .single();

  if (error || !entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  // Call Anthropic
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an assistant helping someone organise their divorce-related experiences for professional consultations.

Given the following personal journal entry, extract and present:
- Date and time of incident (if mentioned)
- People involved
- Key events and actions (factual, chronological)
- Any statements made (especially threatening, financial, or legally relevant)
- Children's involvement (if any)
- Outcome or current status

Rules:
- Remove all emotional language
- Write in third person, professional tone
- Keep it concise but don't omit legally relevant details
- If something is unclear from the entry, note it as "unclear" rather than guessing
- Flag anything that might be legally significant

Journal entry:
"""
${entry.content}
"""`,
      },
    ],
  });

  const summary = message.content[0].type === 'text' ? message.content[0].text : '';

  // Save summary to DB
  const { error: updateError } = await supabase
    .from('journal_entries')
    .update({
      ai_summary: summary,
      ai_summary_generated_at: new Date().toISOString(),
    })
    .eq('id', entryId);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 });
  }

  return NextResponse.json({ summary });
}
```

**Git commit after building:**
```bash
git add src/app/api/journal/summarise/route.ts
git commit -m "feat(journal): add AI summary API endpoint"
```

## Step 5: Environment Variable

Add to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Add to `.env.local.example`:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Step 6: Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

## Step 7: Navigation

Add "Journal" link to dashboard sidebar/nav:
- Icon: or a book icon from your icon library
- Link to `/journal`

## UI Guidelines

- Mood chips: small rounded pills with subtle background colors
  - calm: green
  - anxious: yellow
  - angry: red
  - sad: blue
  - overwhelmed: purple
  - hopeful: teal
  - frustrated: orange
  - relieved: light green

- Category chips: neutral/gray background, text label

- AI Summary card: distinct visual style (maybe a light blue or gray background, or a border) to differentiate from raw content

- Keep forms clean and uncluttered — content textarea is the hero

## Testing Checklist

- [ ] Can create entry with just content
- [ ] Can create entry with all fields
- [ ] Entries appear in list view
- [ ] Filters work (mood, category)
- [ ] Can view single entry
- [ ] Can generate AI summary
- [ ] Summary saves to database
- [ ] Can copy summary to clipboard
- [ ] Can edit entry
- [ ] Can delete entry
- [ ] RLS working (user can only see own entries)
- [ ] Loading states on all async operations
- [ ] Error handling for API failures

## Final Step: Merge to Main

Once everything works:

```bash
# Make sure all changes are committed
git status

# Push feature branch
git push origin feat/journal

# Merge to main
git checkout main
git merge feat/journal
git push origin main

# Clean up
git branch -d feat/journal
```

**Update CLAUDE.md:**
Change Journal status from `NOT STARTED` to `DONE`

```bash
git add CLAUDE.md
git commit -m "docs: mark journal feature as complete"
git push origin main
```
