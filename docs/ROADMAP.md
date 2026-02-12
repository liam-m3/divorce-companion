# Development Roadmap

## MVP 1 -- COMPLETE

- [x] Project setup (Next.js 16, TypeScript, Tailwind CSS 4)
- [x] Supabase client configuration (browser + server + middleware)
- [x] TypeScript types and constants
- [x] Configuration files (onboarding options, dashboard content)
- [x] Middleware for auth protection
- [x] Auth pages (signup, login)
- [x] 5-step onboarding flow
- [x] Dashboard with adaptive content blocks
- [x] Profile edit page
- [x] Landing page
- [x] Error handling (error boundary, not-found page)
- [x] Loading states (global + dashboard)
- [x] Vercel deployment

---

## Phase 2: Core Features -- COMPLETE

### Journal with AI Summary
- [x] TypeScript types (JournalEntry, Mood, JournalCategory)
- [x] Journal list view with mood/category/search filters
- [x] New entry form with mood picker, category picker, incident date
- [x] Single entry view with full content display
- [x] AI summary generation via Groq API (Llama 3.3 70B)
- [x] Summary actions: copy, export PDF, regenerate
- [x] Entry edit page (clears AI summary with warning)
- [x] Entry delete with confirmation
- [x] Dashboard navigation link

### Persistent Checklists
- [x] `checklist_progress` table with RLS
- [x] Track completed items per user per checklist
- [x] Sync state across sessions via upsert
- [x] Completion count display

### Document Vault
- [x] TypeScript types (Document, DocumentCategory)
- [x] File upload with validation (50MB max, type restrictions)
- [x] Supabase Storage integration (private bucket with RLS)
- [x] Category tagging (6 categories)
- [x] Notes/description per document
- [x] Search by filename or notes
- [x] Filter by category
- [x] Inline metadata editing (filename, category, notes)
- [x] Download via signed URL
- [x] Delete with confirmation
- [x] Dashboard navigation link

### Financial Tracker
- [x] `financial_items` table with RLS
- [x] TypeScript types (FinancialItem, FinancialType, Frequency)
- [x] Single-page design with summary cards
- [x] Add item form with type chips, name, amount, frequency, notes
- [x] Inline edit and delete with confirmation
- [x] Type filter and search by name
- [x] Currency formatting and monthly normalisation
- [x] Dashboard navigation link

### Timeline
- [x] `timeline_events` table with RLS
- [x] TypeScript types (TimelineEvent, TimelineCategory)
- [x] Chronological event view grouped by year with visual timeline
- [x] Add/edit/delete events with inline CRUD
- [x] Category tagging with coloured dots
- [x] Search and category filter
- [x] Dashboard navigation link

### Full Brief Generator
- [x] Dedicated `/brief` page with data overview cards
- [x] Fetch all user data in parallel
- [x] Structured AI prompt via Groq API (3000 max tokens)
- [x] Professional situation brief generation
- [x] Copy to clipboard and export PDF
- [x] Regenerate button
- [x] Data sources summary
- [x] Dashboard navigation link

---

## Phase 3: Polish & UX -- COMPLETE

Based on a screenshot audit of all pages (desktop + mobile), prioritised by user impact.

### Priority 1 -- Mobile Fixes
- [x] Mobile hamburger nav menu (Header.tsx)
- [x] Page header layouts on mobile (title + action button stacking)
- [x] Vault file card layout on mobile (filename truncation, action buttons)
- [x] Finance summary cards on mobile (grid and number overflow)

### Priority 2 -- UX & Trust
- [x] Forgot password flow (`/forgot-password` + `/reset-password`)
- [x] Password visibility toggle on all password inputs
- [x] Display name on profile + personalised dashboard greeting
- [x] Landing page feature breakdown (5 feature cards with icons)
- [x] Journal auto-save drafts (localStorage with debounce + recovery banner)
- [x] Onboarding: full-width Next button on mobile, Back button, Skip option

### Priority 3 -- Feature Enhancements
- [x] Currency formatting based on profile country
- [x] Vault file type badges (PDF, IMG, DOC, TXT)
- [x] Journal writing prompts for blank textarea
- [x] Dashboard recent activity summary card
- [x] Replace expense tracker placeholder with Financial Tracker link
- [ ] Brief: saved history (needs `briefs` table migration)

### Priority 4 -- Nice to Have
- [x] Vault: overflow menu for actions on mobile
- [x] Timeline: future events with "upcoming" badge
- [x] Journal: larger textarea on mobile
- [x] Profile: change password + delete account sections
- [x] Signup: privacy/trust note below Create Account button

### DB Migrations (Phase 3)
1. [x] `display_name TEXT` column on `profiles` table
2. [ ] `briefs` table: id, user_id, content, generated_at + RLS

---

## Phase 4 (Future)

### Enhanced Journal
- Pattern detection across entries
- Entry templates for common situations
- Voice-to-text input
- Mood tracking dashboard with visualisations
- Rich text editing (markdown)

### Enhanced Vault
- Drag-and-drop upload
- Multiple file upload with progress bars
- In-app PDF preview
- AI auto-categorisation
- Tag system beyond categories
- Document versioning

### Cross-Feature Integration
- Link documents to journal entries
- Combined timeline (entries + documents + events)
- Share individual entries/documents with lawyers
- Entry comments/follow-ups

### Platform
- Multi-language support (i18n)
- Email notifications / reminders
- Calendar integration (court dates, deadlines)
- Dark mode toggle

---

## Out of Scope

- Legal advice or guidance
- Payment processing
- Real-time messaging/chat
- Native mobile apps
- Social features
