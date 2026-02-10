# Development Roadmap

## MVP 1 — COMPLETE

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

## Phase 2: Core Features — COMPLETE

### Journal with AI Summary — DONE
- [x] TypeScript types (JournalEntry, Mood, JournalCategory)
- [x] Journal list view with mood/category/search filters
- [x] New entry form with mood picker, category picker, incident date
- [x] Single entry view with full content display
- [x] AI summary generation via Groq API (Llama 3.3 70B)
- [x] Summary actions: copy, export PDF, regenerate
- [x] Entry edit page (clears AI summary with warning)
- [x] Entry delete with confirmation
- [x] Dashboard navigation link

### Persistent Checklists — DONE
- [x] `checklist_progress` table with RLS
- [x] Track completed items per user per checklist
- [x] Sync state across sessions via upsert
- [x] Completion count display

### Document Vault — DONE
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

### Financial Tracker — DONE
- [x] `financial_items` table with RLS
- [x] TypeScript types (FinancialItem, FinancialType, Frequency)
- [x] Single-page design with summary cards (Total Assets, Total Debts, Net Worth, Monthly Income, Monthly Expenses, Monthly Net)
- [x] Add item form with type chips, name, amount, frequency (income/expense only), notes
- [x] Inline edit and delete with confirmation
- [x] Type filter and search by name
- [x] Currency formatting and monthly normalisation
- [x] Dashboard navigation link

### Timeline — DONE
- [x] `timeline_events` table with RLS
- [x] TypeScript types (TimelineEvent, TimelineCategory)
- [x] Chronological event view grouped by year with visual timeline
- [x] Add/edit/delete events with inline CRUD
- [x] Category tagging with coloured dots (legal, financial, personal, emotional, children)
- [x] Search and category filter
- [x] Dashboard navigation link

### Full Brief Generator — DONE
- [x] Dedicated `/brief` page with data overview cards
- [x] Fetch all user data in parallel (journal, documents, financials, timeline, profile)
- [x] Bundle into structured AI prompt via Groq API (3000 max tokens)
- [x] Generate professional situation brief (Client Overview, Situation Summary, Key Incidents, Financial Position, Documents, Areas of Concern, Next Steps)
- [x] Copy to clipboard and Export PDF
- [x] Regenerate button
- [x] Data sources summary
- [x] Dashboard navigation link

---

## Phase 3: Polish & UX Improvements — IN PROGRESS

Based on a full screenshot audit of all 12 pages (desktop + mobile). Prioritised by user impact.

### Priority 1 — Critical Mobile Fixes — DONE
- [x] Mobile hamburger nav menu (Header.tsx — affects all authenticated pages)
- [x] Page header layouts on mobile (title + action button stacking for journal, vault, finances, timeline)
- [x] Vault file card layout on mobile (filename truncation, action button cramming)
- [x] Finance summary cards on mobile (cramped 2-col grid, number overflow)

### Priority 2 — Essential UX & Trust — IN PROGRESS (4/6)
- [x] Forgot password flow (new `/forgot-password` + `/reset-password` pages)
- [x] Password visibility toggle (auto eye icon on all password inputs)
- [x] Display name on profile + personalised "Welcome back, [name]" on dashboard
- [x] Landing page feature breakdown (5 feature cards with icons below CTA)
- [ ] Journal auto-save drafts (localStorage with debounce + recovery banner)
- [ ] Onboarding: full-width Next button on mobile, Back button, Skip option

### Priority 3 — Feature Enhancements
- [ ] Currency formatting based on profile country (country-to-currency map)
- [ ] Timeline colour legend (dot + label for each category)
- [ ] Brief: output preview description + saved history (DB migration: `briefs` table)
- [ ] Vault: file type badges (PDF, IMG, DOC, TXT based on mime_type)
- [ ] Journal: writing prompts for blank textarea
- [ ] Dashboard: recent activity summary card (this week's entries, uploads, upcoming events)
- [ ] Replace "Expense Tracker — Coming Soon" placeholder with Financial Tracker link

### Priority 4 — Nice to Have
- [ ] Vault: overflow menu ("...") for actions on mobile
- [ ] Timeline: future events with "upcoming" visual treatment
- [ ] Journal: larger textarea on mobile (min-h-[300px])
- [ ] Profile: change password + delete account sections
- [ ] Signup: privacy/trust note below Create Account button

### DB Migrations Required (Phase 3)
1. `display_name TEXT` column on `profiles` table
2. `briefs` table: id UUID PK, user_id UUID FK, content TEXT, generated_at TIMESTAMPTZ + RLS

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
