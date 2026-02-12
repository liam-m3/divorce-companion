# Journal Feature -- Build Guide

Step-by-step notes for building the journal feature from scratch.

## Overview

Users write raw, emotional journal entries. AI generates professional summaries that can be shared with lawyers or therapists.

## Step 1: Database

Run in Supabase SQL editor:

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

CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

No git commit needed -- this runs in Supabase, not in the repo.

## Step 2: Types

Add to `src/types/index.ts`:

- `MOODS` constant: calm, anxious, angry, sad, overwhelmed, hopeful, frustrated, relieved
- `JOURNAL_CATEGORIES` constant: legal, financial, children, housing, emotional, communication, other
- `JournalEntry` interface with all DB columns typed

## Step 3: Pages

### `/journal` -- List View
- Fetch entries ordered by `created_at DESC`
- Display as cards: title (or content preview), date, mood chip, category chip
- Filters: mood dropdown, category dropdown, search input
- "New Entry" button linking to `/journal/new`
- Empty state when no entries

### `/journal/new` -- Create Entry
- Large textarea for content (required, autofocus)
- Title input (optional)
- Mood picker (clickable chips, single select)
- Category picker (clickable chips, single select)
- Incident date picker (defaults to today)
- Save inserts to DB, redirects to `/journal/[id]`

### `/journal/[id]` -- View Entry
- Full content display with title, dates, mood, category
- AI Summary section:
  - No summary: show "Generate AI Summary" button
  - Summary exists: show in styled card with Regenerate and Copy buttons
  - Disclaimer: "This is an AI-generated draft. Please review before sharing."
- Edit and Delete buttons

### `/journal/[id]/edit` -- Edit Entry
- Same form as create, pre-filled with existing data
- Warning banner: editing clears the existing AI summary

## Step 4: AI Summary API Route

Create `src/app/api/journal/summarise/route.ts`:

- Auth check via `supabase.auth.getUser()`
- Fetch entry and verify ownership via RLS
- Call Groq API (`llama-3.3-70b-versatile`) with structured prompt
- Prompt asks for: incident date, people involved, key events, statements, children's involvement, legal points, current status
- Save summary + timestamp to DB
- Return summary JSON

Environment variable: `GROQ_API_KEY`

Install: `npm install groq-sdk`

## Step 5: Components

- `EntryCard` -- preview card for list view
- `MoodPicker` -- 8 coloured mood chips
- `CategoryPicker` -- 7 category chips
- `AISummarySection` -- summary display with copy, export PDF, regenerate

## UI Notes

Mood chip colours: calm (green), anxious (yellow), angry (red), sad (blue), overwhelmed (purple), hopeful (teal), frustrated (orange), relieved (light green).

Category chips use neutral/grey backgrounds.

AI summary card should be visually distinct from the raw entry content.

Content textarea is the main focus of the form -- keep everything else secondary.

## Testing

- Create entry with just content
- Create entry with all fields
- Entries show in list, filters work
- Generate AI summary, verify it saves
- Copy summary to clipboard
- Edit entry (summary clears with warning)
- Delete entry with confirmation
- RLS working (can't see other users' entries)
- Loading states on all async operations

## Git Workflow

Branch off main, commit after each step:

```
feat(journal): add JournalEntry type and constants
feat(journal): create journal list view
feat(journal): add new entry form with mood/category pickers
feat(journal): add single entry view with AI summary section
feat(journal): add entry edit page
feat(journal): add AI summary API endpoint
```

Merge back to main when done.
