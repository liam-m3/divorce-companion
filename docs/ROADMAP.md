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

## Phase 2: Core Features — IN PROGRESS

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

### Timeline — NOT STARTED
- [ ] `timeline_events` table with RLS
- [ ] TypeScript types (TimelineEvent)
- [ ] Chronological event view
- [ ] Add/edit/delete events
- [ ] Category tagging (legal, financial, personal, emotional, children)
- [ ] Dashboard navigation link

### Full Brief Generator — NOT STARTED
- [ ] Dedicated page or dashboard action
- [ ] Fetch all user data (journal entries, documents, financials, timeline)
- [ ] Bundle into single AI prompt via Groq API
- [ ] Generate 1-2 page professional brief
- [ ] Copy, export PDF, share options
- [ ] Requires Priorities 1-5 to be built first

---

## Phase 3 (Future)

### Enhanced Journal
- Auto-save drafts to localStorage
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
- Mobile responsiveness polish

---

## Out of Scope

- Legal advice or guidance
- Payment processing
- Real-time messaging/chat
- Native mobile apps
- Social features
