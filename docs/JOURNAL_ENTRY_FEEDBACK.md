# Divorce Companion - Journal Entry Feature Feedback

## Current Implementation

### Tech Stack
- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **AI Integration**: Groq API (Llama models for summary generation)

### Implemented Features

**Journal List View:**
- Search bar for filtering entries
- Filter by mood ("All moods")
- Filter by category ("All categories")
- Entry cards showing:
  - Title
  - Preview of content (truncated)
  - Date
  - Mood tags (e.g., "angry", "emotional")
  - "AI summary" indicator badge
- "New Entry" button for creating entries

**Individual Entry View:**
- Full entry display with:
  - Title
  - Written date and incident date metadata
  - Mood tags (colored pills: red for "Angry", gray for "Emotional")
  - Full emotional content text
  - AI Summary section with structured incident report
- Three action buttons in summary: "Copy Summary", "Export PDF", "Regenerate"
- Entry actions: "Edit" and "Delete" buttons at bottom
- "Back to journal" navigation

**Edit Entry View:**
- Large textarea for entry content
- Warning banner: "Editing will clear the existing AI summary. You can regenerate it after saving."
- Title field (optional)
- Mood selection (pills): Calm, Anxious, Angry, Sad, Overwhelmed, Hopeful, Frustrated, Relieved
- Category selection (pills): Legal, Financial, Children, Housing, Emotional, Communication, Other
- "When did this happen?" date picker
- "Cancel" and "Save Changes" buttons

**AI Summary Format:**
Currently generates structured reports with:
- Incident Date
- People Involved
- Key Events (numbered)
- Statements Made
- Children's Involvement
- Legally Significant Points
- Current Status
- Generation timestamp and disclaimer
- "This is an AI-generated draft. Please review before sharing."

## Feature Enhancements Roadmap

### HIGH PRIORITY - Critical UX Improvements

#### 1. Enhanced AI Summary Quality

**Problem**: Current summaries are good but could be more legally useful

**Improvements:**

**Better date extraction:**
```javascript
// Current: "Incident Date: 2026-02-06"
// Problem: AI guesses or uses "not mentioned"

// Solution: Use the "When did this happen?" field from entry
- Pre-populate AI prompt with incident date
- If user didn't set date, use entry creation date
- Show both "Written on" and "Incident occurred on" clearly
```

**More actionable legal insights:**
```javascript
// Add to AI prompt:
"After generating the incident summary, add a section called 'Recommended Actions':
- What evidence should be documented or gathered?
- Are there immediate safety concerns?
- Should this be shared with lawyer/mediator?
- Are there custody implications?
- Financial/property concerns to note?"
```

**Pattern detection across entries:**
- "This is the 3rd incident involving [topic] in the past month"
- "Escalating pattern detected: Previous incidents on [dates]"
- Requires querying past entries and sending context to AI

**Confidence scoring:**
- Show AI confidence in generated summary
- Flag areas that need user verification
- "The AI is uncertain about: [list items]"

#### 2. Improved Entry Organization

**Add sorting options:**
```javascript
// Journal list view - add sort dropdown
Sort by:
- Most recent (default)
- Oldest first
- Incident date (chronological case timeline)
- Most urgent (based on mood/category)
- Recently updated
```

**Enhanced filtering:**
```javascript
// Current: "All moods" and "All categories"
// Problem: Can't combine filters or see filter count

// Improvements:
- Multi-select moods (Angry + Frustrated)
- Multi-select categories (Legal + Children)
- Date range filter (entries from last week/month)
- Show active filter count: "3 filters active"
- "Clear all filters" button
- Show result count: "Showing 12 of 45 entries"
```

**Smart filters/views:**
- "Needs attention" - entries without AI summary
- "High priority" - angry/overwhelmed entries from last 7 days
- "Evidence gaps" - entries without linked documents
- "Court-related" - Legal category + key dates
- "Children involved" - automatic tag when kids mentioned

#### 3. Entry Creation Flow Improvements

**Better initial entry form:**
```javascript
// Current: Edit view has all the fields
// Problem: Creating new entry might not show same form

// Ensure "New Entry" flow includes:
1. Title field (with placeholder: "e.g., Argument about custody")
2. Mood selector (multi-select, not just one)
3. Category selector
4. Date picker with smart default (today)
5. Large textarea for content
6. "Save Draft" vs "Save & Generate Summary" buttons
```

**Auto-save drafts:**
- Save to localStorage every 30 seconds while typing
- Show "Draft saved at 9:03 PM"
- Recover unsaved entry if browser crashes
- "You have an unsaved draft from [time]" prompt on return

**Voice-to-text option:**
- Many users will be emotional, driving, or unable to type
- Use Web Speech API for voice input
- "Speak your entry" button
- Real-time transcription with edit capability

#### 4. AI Summary UX Polish

**Loading states:**
```javascript
// When generating summary, show:
- Progress spinner
- "Analyzing your entry..." message
- Time estimate: "Usually takes 5-10 seconds"
- Cancel button (stop generation if taking too long)
```

**Error handling:**
```javascript
// If AI fails:
- Show friendly error: "Summary generation failed. Please try again."
- Offer retry button
- Don't lose the entry content
- Log error for debugging
- Consider fallback: "Generate basic summary" (simpler prompt)
```

**Regeneration improvements:**
```javascript
// "Regenerate" button should:
- Show confirmation: "This will replace the current summary. Continue?"
- Allow editing the prompt: "Want to focus on anything specific?"
- Show side-by-side comparison (old vs new)
- "Keep old" or "Use new" choice
```

**Summary customization:**
```javascript
// Let users customize what's in summary:
- Toggle sections on/off (don't need "Children's Involvement" if no kids)
- Add custom sections (e.g., "Financial Impact", "Safety Concerns")
- Adjust tone: "More formal" vs "More detailed"
- Length: "Brief" vs "Comprehensive"
```

#### 5. Export Functionality Enhancement

**Export PDF improvements:**
```javascript
// Current: "Export PDF" button exists
// Ensure it includes:
- Professional letterhead/header
- Entry title and dates
- Full entry content (optional - user choice)
- AI summary (formatted nicely)
- Footer with disclaimer and generation date
- Option: "Include only summary" vs "Include full entry"
```

**Multiple export formats:**
- **PDF** (for lawyers, formal submissions)
- **Plain text** (for quick copy-paste)
- **Email** (send directly to lawyer/therapist)
- **Print** (printer-friendly layout)

**Bulk export:**
- Select multiple entries
- "Export selected entries as single PDF"
- Generate timeline document (all entries chronologically)
- Useful for lawyer meetings or court submissions

### MEDIUM PRIORITY - Enhanced Features

#### 6. Entry Templates

**Problem**: Users often document similar incidents repeatedly

**Solution**: Provide templates for common situations

**Template examples:**
```
Template: "Argument about children"
Pre-filled fields:
- Category: Children
- Mood: [empty, user selects]
- Content prompts:
  - What triggered the argument?
  - What was said about the children?
  - Were the children present?
  - How did it end?
  - What are your concerns?

Template: "Missed visitation/pickup"
Pre-filled fields:
- Category: Children
- Content prompts:
  - Scheduled date and time:
  - What happened:
  - Communication before/after:
  - Impact on children:
  - Previous incidents:

Template: "Financial concern"
Pre-filled fields:
- Category: Financial
- Content prompts:
  - What financial issue occurred:
  - Amount involved:
  - Documentation you have:
  - Your concerns:
```

**Implementation:**
- "Use template" button on new entry screen
- Template library (user can create custom ones too)
- Templates help ensure important details captured

#### 7. Rich Text Editing

**Current**: Plain textarea
**Problem**: No formatting options

**Add basic formatting:**
- **Bold** for emphasis (key statements)
- *Italic* for thoughts/feelings
- Bullet lists for easier reading
- Headings for structure
- Maybe quotes for exact statements

**Implementation options:**
- Simple markdown support (easy to implement)
- WYSIWYG editor (Tiptap, Quill, or similar)
- Keep it minimal - don't overwhelm users

**Example markdown:**
```markdown
He said **"I'll burn the house down"** - exact words.

The kids were:
- Crying
- Scared
- Hiding in their room

I'm concerned about:
1. Their safety
2. His escalating threats
3. Need to document everything
```

#### 8. Media Attachments

**Allow attaching to entries:**
- **Photos** (screenshots of texts, photos of damage, etc.)
- **Audio recordings** (voice memos from incidents)
- **Videos** (if applicable)

**Storage:**
- Upload to Supabase Storage (like vault documents)
- Show thumbnails in entry view
- Click to view full size
- Include in AI summary: "Entry has 2 photos attached"

**AI analysis of attachments:**
```javascript
// For images: OCR text messages, analyze content
- "Screenshot shows text conversation with threats"
- Extract key phrases from text screenshots
- Timestamp extraction from photos

// For audio: Transcribe if possible
- Use Whisper API or similar
- Generate transcript
- Include in AI summary analysis
```

#### 9. Mood/Emotion Tracking Dashboard

**Visualize emotional patterns over time:**

**Charts to show:**
- Mood frequency (pie chart: 40% Angry, 30% Sad, etc.)
- Mood trend over time (line graph showing emotional state)
- Entry frequency by category (bar chart)
- Timeline heatmap (which days/weeks are worst)
- Correlation: mood vs. category patterns

**Insights:**
- "You've had 5 'Angry' entries in the past week - this is elevated"
- "Most incidents occur on weekends during custody exchanges"
- "Financial arguments tend to escalate to anger 80% of the time"

**Value:**
- Help users recognize patterns
- Show therapist for support
- Show lawyer for custody/safety arguments
- Self-awareness and healing

**Implementation:**
```javascript
// Query entries by mood/category/date
// Use recharts or similar for visualization
// Generate insights with simple rules or AI
```

#### 10. Linked Documents from Vault

**Cross-feature integration:**

**In entry editor, add "Attach Documents" section:**
```javascript
// Flow:
1. User clicks "Attach from Vault"
2. Modal shows vault documents (filterable)
3. User selects relevant docs (checkboxes)
4. Selected docs show as chips in entry
5. Click chip to preview document
6. Attached docs included in AI summary generation
```

**AI uses attached documents:**
```javascript
// Enhanced prompt:
"The user has attached the following documents to this entry:
- custody_agreement.pdf
- text_screenshots.jpg

Consider these documents when generating the incident summary.
Mention relevant document content that supports the narrative."
```

**Display in entry view:**
- "Attached Evidence: 2 documents"
- Document chips with icons (PDF, image, etc.)
- Click to view document (opens in vault or modal)
- Show in timeline: both entry and documents together

**Database:**
```sql
-- Junction table
entry_documents:
  id, entry_id, document_id, created_at
```

#### 11. Sharing Individual Entries

**Share specific entries with professionals:**

**Features:**
- Select entry → "Share with lawyer" button
- Generate secure link (like vault sharing)
- Share options:
  - Entry content only
  - AI summary only
  - Both entry + summary
  - Include attached documents
- Time-limited links
- Password protection (optional)
- Track when accessed

**Lawyer view:**
- Clean, professional layout
- Shows only what user selected to share
- Download as PDF option
- No login required (secure token in URL)

**Use case**: Share single incident with lawyer for quick review without sending entire case file

#### 12. Collaborative Features (Future)

**Share with therapist/support person:**
- Give read-only access to specific entries
- Therapist can add private notes (only they see)
- User can request feedback on entries
- Support person gets notifications of new entries (if user wants)

**Comments/notes section:**
- User can add follow-up notes to old entries
- "Update: He apologized the next day"
- "Update: Lawyer reviewed this - she says document it more"
- Show comment count on entry cards

### LOW PRIORITY - Advanced Features

#### 13. Timeline Visualization

**Visual case timeline:**
- All entries plotted on timeline (by incident date)
- Color-coded by mood/category
- Zoom in/out (daily, weekly, monthly view)
- Click entry to expand details
- See patterns visually (clusters of incidents)
- Export timeline as PDF for court

**Similar to:**
- Google Maps timeline
- GitHub contribution graph
- Legal case timeline tools

#### 14. Smart Reminders & Notifications

**Automatic reminders:**
- "You haven't logged an entry in 2 weeks - everything okay?"
- "Court date coming up in 3 days - review your documentation?"
- "Weekly reflection: How are you feeling this week?"

**Deadline tracking:**
- Extract deadlines from entries or AI summaries
- "You mentioned filing deadline March 15 - reminder set"
- Calendar view of important dates
- Export to Google Calendar

#### 15. Natural Language Entry

**Conversational AI assistant:**
```javascript
// Instead of structured form, user just talks:
User: "Had another fight about the house today"
AI: "I'm sorry to hear that. Can you tell me what happened?"
User: "He said he'd rather burn it down than let me have it"
AI: "That sounds very upsetting. Were the children present?"
User: "Yes, they were crying in the next room"
AI: "Thank you for sharing. I'll document this incident. What mood best describes how you're feeling?"

// AI guides user through documenting incident
// Feels more supportive than blank form
// Generates structured entry automatically
```

**Implementation:**
- Chat interface for entry creation
- Groq API for conversational flow
- Builds entry piece by piece
- User reviews and saves at end

#### 16. Privacy Features

**Enhanced security:**

**Private/encrypted entries:**
- Option to mark entries as "highly sensitive"
- Client-side encryption before upload
- Requires additional password to view
- Not included in exports unless explicitly selected

**Redaction mode:**
- Auto-redact names in AI summaries
- Replace with "Person A", "Person B", "Child 1"
- Useful for sharing with certain professionals
- Maintain privacy while sharing content

**Audit log:**
- Track every time entry is viewed, edited, exported, shared
- "Last viewed: 2 days ago"
- Security for peace of mind

#### 17. Guided Journaling

**Prompts to help users document effectively:**

**Daily check-in prompts:**
- "How are you feeling today?"
- "Any incidents to document?"
- "What's on your mind?"

**Structured reflection prompts:**
- "What happened this week?"
- "What are you grateful for?"
- "What are you worried about?"
- "What progress have you made?"

**Legal-focused prompts:**
- "Document any communication with your ex"
- "Note any missed obligations (financial, custody)"
- "Record any threats or concerning behavior"

**Therapeutic prompts:**
- "What emotions came up today?"
- "How did you cope with stress?"
- "What support do you need?"

## Database Schema

### Current Journal Entries Table
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood_tags TEXT[], -- e.g., ['Angry', 'Emotional']
  category TEXT, -- 'Legal', 'Financial', 'Children', etc.
  incident_date DATE, -- When the incident occurred
  ai_summary TEXT, -- Generated AI summary
  ai_summary_generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own entries"
  ON journal_entries FOR ALL
  USING (auth.uid() = user_id);
```

### Future Schema Additions
```sql
-- For rich text support
ALTER TABLE journal_entries ADD COLUMN content_format TEXT DEFAULT 'plain'; -- 'plain', 'markdown', 'html'

-- For pattern detection
ALTER TABLE journal_entries ADD COLUMN ai_insights JSONB; -- Store AI-detected patterns

-- For templates
CREATE TABLE entry_templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  template_content TEXT,
  mood_default TEXT[],
  category_default TEXT,
  is_system_template BOOLEAN DEFAULT false, -- Built-in vs user-created
  created_at TIMESTAMP DEFAULT NOW()
);

-- For entry-document linking
CREATE TABLE entry_documents (
  id UUID PRIMARY KEY,
  entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entry_id, document_id)
);

-- For entry sharing
CREATE TABLE shared_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  entry_id UUID REFERENCES journal_entries(id),
  share_link_id TEXT UNIQUE,
  include_content BOOLEAN DEFAULT true,
  include_summary BOOLEAN DEFAULT true,
  include_documents BOOLEAN DEFAULT false,
  password_hash TEXT,
  expiration_date TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- For comments/follow-ups
CREATE TABLE entry_comments (
  id UUID PRIMARY KEY,
  entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comment_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- For mood tracking analytics
CREATE MATERIALIZED VIEW mood_analytics AS
SELECT 
  user_id,
  unnest(mood_tags) as mood,
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as frequency
FROM journal_entries
GROUP BY user_id, mood, week;
```

## AI Integration Details

### Current Groq API Implementation

**Prompt Structure:**
```javascript
const generateSummaryPrompt = (entry) => `
You are a professional divorce case summarizer. Convert this emotional journal entry into a structured incident report suitable for legal professionals (lawyers, therapists, mediators).

Journal Entry:
Title: ${entry.title}
Incident Date: ${entry.incident_date}
Mood: ${entry.mood_tags.join(', ')}
Category: ${entry.category}
Content: ${entry.content}

Generate a professional incident summary with these sections:
1. Incident Date
2. People Involved (writer, partner/spouse, children with ages if mentioned)
3. Key Events (numbered list, chronological order)
4. Direct Statements or Threats Made (exact quotes when available)
5. Children's Involvement (describe their presence, reactions, emotional state)
6. Legally Significant Points (threats, financial concerns, custody issues, safety concerns, property damage)
7. Current Status (resolved, ongoing, escalating, etc.)

Format as structured text with clear section headers. Be objective and factual. Highlight potential legal concerns. Keep it concise but comprehensive. Use professional language throughout.
`;
```

**API Call:**
```javascript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
  },
  body: JSON.stringify({
    model: 'llama-3.1-70b-versatile', // Good balance of speed/quality
    messages: [
      { 
        role: 'system', 
        content: 'You are a professional divorce case summarizer. Generate factual, objective incident reports from emotional journal entries.' 
      },
      { 
        role: 'user', 
        content: generateSummaryPrompt(entry) 
      }
    ],
    temperature: 0.3, // Lower = more consistent, less creative
    max_tokens: 1500,
    top_p: 0.9
  })
});

const data = await response.json();
const summary = data.choices[0].message.content;
```

### Enhanced AI Features

**Pattern Detection Across Entries:**
```javascript
// Query last 10 entries
const recentEntries = await fetchRecentEntries(user_id, 10);

// Send to AI for pattern analysis
const patternPrompt = `
Analyze these recent journal entries for patterns:

${recentEntries.map(e => `
Date: ${e.incident_date}
Mood: ${e.mood_tags.join(', ')}
Category: ${e.category}
Summary: ${e.content.substring(0, 200)}...
`).join('\n\n')}

Identify:
1. Recurring themes or issues
2. Escalation patterns (getting worse/better)
3. Trigger patterns (what causes incidents)
4. Temporal patterns (weekends, holidays, custody exchanges)
5. Safety concerns that require attention

Provide brief analysis (2-3 sentences per pattern).
`;

// Store insights in ai_insights JSONB column
```

**Smart Auto-Categorization:**
```javascript
// When user creates entry, suggest category
const categorizationPrompt = `
Based on this journal entry, suggest the most appropriate category:
Categories: Legal, Financial, Children, Housing, Emotional, Communication, Other

Entry: "${entry.content.substring(0, 500)}"

Respond with ONLY the category name and a brief reason (one sentence).
Format: CATEGORY | Reason
`;

// Show to user: "Suggested category: Children | Entry mentions children's safety concerns"
```

**Mood Detection from Text:**
```javascript
// Auto-suggest moods based on entry content
const moodPrompt = `
What emotions are expressed in this entry? Select 1-3 from:
Calm, Anxious, Angry, Sad, Overwhelmed, Hopeful, Frustrated, Relieved

Entry: "${entry.content}"

Respond with comma-separated mood tags only.
`;

// Pre-select mood pills for user (they can adjust)
```

### Rate Limiting & Error Handling

**Groq Free Tier Considerations:**
- Check current rate limits (requests per minute/day)
- Implement client-side rate limiting
- Show "Please wait" if too many requests
- Queue requests if needed

**Error Handling:**
```javascript
async function generateSummary(entry) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { /* ... */ },
      body: JSON.stringify({ /* ... */ })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT');
      } else if (response.status === 500) {
        throw new Error('SERVER_ERROR');
      } else {
        throw new Error('API_ERROR');
      }
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    if (error.message === 'RATE_LIMIT') {
      return {
        error: 'Too many requests. Please wait a minute and try again.',
        retry: true
      };
    } else if (error.message === 'SERVER_ERROR') {
      return {
        error: 'AI service temporarily unavailable. Please try again later.',
        retry: true
      };
    } else {
      return {
        error: 'Failed to generate summary. Please try again.',
        retry: true
      };
    }
  }
}
```

**Caching:**
```javascript
// Don't regenerate summary unnecessarily
// Store generated summary in database
// Only regenerate when:
1. User clicks "Regenerate" explicitly
2. Entry content is edited (clear summary, offer regeneration)
3. User hasn't seen summary yet (first generation)
```

## Security & Privacy Considerations

### Data Sensitivity
Journal entries contain extremely sensitive information:
- Domestic incidents, threats, abuse
- Children's wellbeing and safety
- Financial details
- Private communications
- Emotional vulnerabilities

### Security Checklist
- ✅ Supabase RLS policies (users only see their entries)
- ✅ Encrypted in transit (HTTPS)
- ✅ Encrypted at rest (Supabase encryption)
- ⚠️ Consider: Client-side encryption for "highly sensitive" entries
- ⚠️ Add: Audit logging (track all entry access)
- ⚠️ Add: Two-factor auth option for vault/journal access
- ⚠️ Add: Auto-logout after inactivity
- ⚠️ Add: "Privacy mode" that requires re-auth to view entries

### Legal Disclaimers

**Critical disclaimers to display:**
```
"Important Legal Notice:
- This is a documentation tool, not legal advice
- AI summaries are drafts and may contain errors
- Always review with a qualified lawyer before using in court
- Your safety is the priority - if in danger, call emergency services
- This app is not a substitute for professional legal or mental health support"
```

**On AI Summary:**
```
"This is an AI-generated draft. Please review carefully before sharing.
AI may misinterpret context or miss important details.
Ensure all facts are accurate before providing to legal professionals."
```

### GDPR / Data Privacy Compliance
- User right to export all data (JSON, PDF)
- User right to deletion (delete all entries permanently)
- Clear privacy policy explaining data usage
- AI data handling: Ensure Groq doesn't train on user data
- Data retention: How long to keep deleted entries (30-day soft delete?)

## User Experience Principles

### Target User Context
**Remember the user is:**
- Emotionally stressed, possibly traumatized
- Often documenting late at night when upset
- May not be tech-savvy
- Needs to feel in control and safe
- Wants simplicity, not complexity

### UX Guidelines

**1. Minimize cognitive load:**
- Keep forms simple
- Pre-fill defaults where possible
- Don't overwhelm with options
- Guide them through process

**2. Be supportive, not clinical:**
- Warm, empathetic copy
- "Write what happened. AI will help you make sense of it later."
- "You're doing great by documenting this."
- Avoid cold, robotic language

**3. Fast and responsive:**
- Quick load times
- Smooth transitions
- Instant feedback on actions
- No unnecessary waiting

**4. Mobile-first:**
- Many users will document on phone (in car, late at night, etc.)
- Large touch targets
- Easy one-handed use
- Voice input option

**5. Privacy reassurance:**
- Constantly reinforce "Only you can see this"
- Clear security indicators
- Easy way to lock/log out
- No social features that feel exposing

## Implementation Phases

### Phase 1: Polish Existing (Week 1)
1. ✅ Journal list, entry view, edit view (done)
2. ✅ AI summary generation (done)
3. ✅ Export PDF (implemented)
4. Add auto-save drafts
5. Improve error handling and loading states
6. Mobile responsiveness testing

### Phase 2: Enhanced AI & UX (Week 2)
1. Better AI prompts (more actionable summaries)
2. Mood detection from entry text
3. Auto-categorization suggestions
4. Entry templates for common situations
5. Sorting and filtering improvements
6. Voice-to-text option

### Phase 3: Organization & Insights (Week 3)
1. Timeline visualization of entries
2. Mood tracking dashboard
3. Pattern detection across entries
4. Smart filters ("Needs attention", "High priority")
5. Search functionality improvements
6. Bulk export features

### Phase 4: Cross-Feature Integration (Week 4)
1. Link documents from vault to entries
2. Combined timeline (entries + documents)
3. Share individual entries with lawyers
4. Entry comments/follow-ups
5. Guided journaling prompts
6. Rich text editing (markdown)

### Phase 5: Advanced Features (Week 5+)
1. Natural language entry creation
2. Media attachments (photos, audio)
3. Collaborative features (therapist sharing)
4. Enhanced privacy options
5. Smart reminders
6. Timeline export for court

## Testing Checklist

**Functional Testing:**
- [ ] Create new entry with all fields
- [ ] Generate AI summary successfully
- [ ] Regenerate summary (replaces old one)
- [ ] Edit entry (clears summary with warning)
- [ ] Delete entry (confirmation prompt)
- [ ] Export single entry as PDF
- [ ] Search entries by title/content
- [ ] Filter by mood
- [ ] Filter by category
- [ ] Filter by date range
- [ ] Sort entries (date, title)
- [ ] Copy summary to clipboard
- [ ] Voice-to-text entry creation (if implemented)

**AI Testing:**
- [ ] Summary generated for short entry (50 words)
- [ ] Summary generated for long entry (1000+ words)
- [ ] Summary handles missing information gracefully
- [ ] Summary extracts dates correctly
- [ ] Summary identifies threats/concerns
- [ ] Summary notes children's involvement
- [ ] Regeneration produces different but accurate summary
- [ ] AI error handling works (network failure, rate limit)

**Security Testing:**
- [ ] User A cannot see User B's entries
- [ ] Unauthenticated user redirected to login
- [ ] RLS policies enforce user isolation
- [ ] XSS attempts in entry content sanitized
- [ ] SQL injection attempts fail

**Performance Testing:**
- [ ] Large entry (5000 words) loads quickly
- [ ] Journal list with 100+ entries performant
- [ ] AI summary generates in < 15 seconds
- [ ] Search responds instantly (< 500ms)
- [ ] Mobile performance acceptable

**Mobile Testing:**
- [ ] Entry creation works on mobile
- [ ] Touch interactions smooth
- [ ] Voice-to-text works (if implemented)
- [ ] Layout responsive on small screens (320px+)
- [ ] Can use with one hand
- [ ] No horizontal scrolling

## Notes for Implementation

**AI Prompt Engineering Tips:**
```javascript
// For better summaries:
1. Be specific about output format
2. Provide examples in prompt (few-shot learning)
3. Use lower temperature (0.2-0.3) for consistency
4. Set appropriate max_tokens (1000-1500 for summaries)
5. Include user context (mood, category) in prompt
6. Request specific sections explicitly
7. Ask for structured output (JSON or markdown)

// Example improvement:
// Instead of: "Summarize this entry"
// Use: "Generate a legal incident report with exactly these 7 sections: [list sections]. Use professional language. Extract direct quotes. Highlight safety concerns."
```

**Database Query Optimization:**
```javascript
// When fetching entries for list view:
- Use pagination (10-20 entries at a time)
- Only fetch needed fields (not full content)
- Index on user_id, created_at, incident_date
- Use Supabase's built-in filtering

// Example:
const { data, error } = await supabase
  .from('journal_entries')
  .select('id, title, content, mood_tags, category, incident_date, created_at')
  .eq('user_id', userId)
  .order('incident_date', { ascending: false })
  .range(0, 19); // First 20 entries
```

**UI Component Reuse:**
```javascript
// Create reusable components:
<EntryCard /> - for list view
<MoodPill /> - for mood tags
<CategoryBadge /> - for category display
<AISummarySection /> - for summary display
<ExportButton /> - for export actions
<FilterBar /> - for search and filters
<EmptyState /> - for empty list
```

**State Management:**
```javascript
// Consider using:
- React Context for global state (current user, settings)
- Local state for form inputs
- SWR or React Query for data fetching
- localStorage for drafts

// Example: Auto-save draft
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('entry_draft', entryContent);
  }, 3000); // Save after 3 seconds of no typing

  return () => clearTimeout(timer);
}, [entryContent]);
```

---

**Last Updated**: February 9, 2026  
**Status**: Core features implemented, enhancements documented
**Next Steps**: Focus on AI prompt improvements and auto-save functionality