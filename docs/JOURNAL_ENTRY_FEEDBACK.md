# Journal -- Enhancement Ideas

Ideas for future improvements to the journal feature, grouped by priority.

## Current State

The journal has: list view with search/mood/category filters, entry creation with mood and category pickers, single entry view with AI summary generation (Groq API), edit/delete, copy/export PDF/regenerate summary actions, auto-save drafts to localStorage, and writing prompts for blank textareas.

## High Priority

### Better AI Summaries
- Pass the incident date field into the prompt so the AI doesn't have to guess
- Add a "Recommended Actions" section to summaries (evidence to gather, safety concerns, whether to escalate to lawyer)
- Pattern detection across entries ("3rd incident involving custody this month")
- Flag areas where the AI is uncertain rather than guessing

### Better Organisation
- Sorting options: most recent, oldest, by incident date, recently updated
- Multi-select mood and category filters
- Date range filter
- Result count display ("Showing 12 of 45 entries")
- Smart views: "Needs attention" (no AI summary), "High priority" (angry/overwhelmed in the last 7 days)

### Entry Creation
- Separate "Save Draft" and "Save & Generate Summary" actions
- Voice-to-text using Web Speech API for when users are too upset or unable to type

### Export
- Option to include just the summary or the full entry + summary in PDF
- Bulk export: select multiple entries, export as a single PDF
- Chronological timeline export for court submissions

## Medium Priority

### Entry Templates
Templates for common situations with pre-filled fields and guided prompts:
- Argument about children (category pre-set, prompts for triggers, what was said, whether children were present)
- Missed visitation/pickup
- Financial dispute
- Users should be able to create their own templates too

### Rich Text
Basic formatting support -- bold for emphasis, lists, block quotes for exact statements. Markdown or a lightweight editor like Tiptap. Keep it minimal, don't overwhelm users.

### Media Attachments
Attach photos (text screenshots, damage photos) and audio recordings to entries. Store in Supabase Storage alongside vault documents. Reference attachments in AI summary context.

### Mood Tracking
Visualise emotional patterns over time -- mood frequency, trends, category correlations. Could use something like recharts. Useful for showing therapists or identifying patterns (e.g. "most incidents occur during custody exchanges").

### Linked Documents
"Attach from Vault" button in the journal editor. Select existing vault documents to link to an entry. Needs a junction table (`entry_documents`). Include linked docs in AI summary context.

### Entry Sharing
Generate secure, time-limited links to share specific entries with lawyers. Options for what to include (content only, summary only, both, with/without attachments). No login required for the recipient.

## Lower Priority

### Timeline View
Plot entries on a visual timeline by incident date. Colour-coded by mood/category. Zoom levels (daily, weekly, monthly). Export for court.

### Smart Reminders
"You haven't logged in 2 weeks", "Court date in 3 days", weekly reflection prompts.

### Conversational Entry
Chat-style interface where AI guides the user through documenting an incident step by step. More supportive than a blank form for people who aren't sure what to write.

### Privacy Extras
Mark entries as "highly sensitive" with additional password protection. Redaction mode that replaces names with "Person A", "Person B" in exports. Audit log of who viewed what and when.

## Design Notes

- Users are often emotionally distressed when writing -- keep the UX simple and supportive
- Mobile-first: many entries are written on phones, late at night
- Always reinforce privacy: "Only you can see this"
- AI summaries are drafts -- always show a disclaimer
- Groq free tier has rate limits -- handle gracefully with retry messaging
