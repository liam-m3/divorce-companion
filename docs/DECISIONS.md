# Technical Decisions

This document records key technical decisions made during development.

## MVP 1 Decisions

### 1. Using Supabase SSR Package

**Decision:** Use `@supabase/ssr` instead of `@supabase/auth-helpers-nextjs`

**Reason:** The auth-helpers package is deprecated. The SSR package is the recommended approach for Next.js App Router and provides better cookie handling.

### 2. Middleware for Auth Protection

**Decision:** Use Next.js middleware for route protection

**Reason:**
- Centralized auth logic
- Runs before page renders
- Handles session refresh automatically
- Redirects happen at edge, faster than client-side

### 3. Single Database Write for Onboarding

**Decision:** Store all onboarding data in client state, write once on completion

**Reason:**
- Reduces database calls
- User can go back/forward without saving partial data
- Cleaner UX - either complete or incomplete, no partial states

### 4. TypeScript Strict Mode

**Decision:** Enable strict TypeScript checking

**Reason:**
- Catches errors early
- Better IDE support
- Forces explicit typing
- Worth the extra effort for long-term maintainability

### 5. Tailwind CSS Only

**Decision:** No custom CSS files, Tailwind only

**Reason:**
- Consistent styling approach
- Faster development
- Built-in responsive utilities
- No CSS naming conventions to manage

### 6. Server Components by Default

**Decision:** Use server components where possible, client components only when needed

**Reason:**
- Better performance (less JS shipped to client)
- Direct database access without API routes
- Use `'use client'` only for:
  - Interactive forms
  - State management
  - Browser APIs

## Phase 2 Decisions

### 7. Groq API Instead of Anthropic

**Decision:** Use Groq SDK with Llama 3.3 70B for AI journal summaries instead of Anthropic Claude API

**Reason:**
- Free tier available for development/early users
- Fast inference speeds
- Llama 3.3 70B produces high-quality structured summaries
- Lower cost at scale compared to Claude API
- Easy to swap providers later if needed (API route abstraction)

### 8. Checklist Persistence via Upsert

**Decision:** Store checklist progress in a `checklist_progress` table using compound key `(user_id, checklist_id)` with upsert on conflict

**Reason:**
- Simple schema — one row per user per checklist
- `completed_items` stored as text array (flexible, no join tables)
- Upsert avoids race conditions and simplifies client logic
- No need for a separate checklist items table at this stage

### 9. Document Vault as Single Page

**Decision:** Build the entire vault feature in a single page (`/vault/page.tsx`) with inline components rather than extracting separate component files

**Reason:**
- Vault is simpler than journal (no multi-page CRUD flow)
- All interactions happen on one page (upload, list, edit, delete)
- Inline components reduce file count without hurting readability
- Can extract components later if the page grows too complex

### 10. Supabase Storage with Signed URLs

**Decision:** Use private Supabase Storage bucket with signed URLs for downloads rather than public URLs

**Reason:**
- Documents contain sensitive divorce-related files
- Signed URLs expire (60-second window) — no permanent public links
- RLS on storage bucket ensures users can only access their own files
- Storage path includes user_id for folder-level isolation

### 11. AI Summary Clears on Edit

**Decision:** When a user edits a journal entry, the existing AI summary is cleared and must be regenerated

**Reason:**
- Prevents stale summaries that don't match updated content
- Clear warning shown to user before editing
- Simpler than diffing content to determine if summary is still valid
- Regeneration is fast and free (Groq free tier)

### 12. Browser Print API for PDF Export

**Decision:** Use browser's native print API (`window.print()`) on generated HTML for PDF export rather than a server-side PDF library

**Reason:**
- Zero additional dependencies
- Works across all modern browsers
- User controls print settings (page size, margins)
- Good enough for MVP — can add proper PDF generation (e.g. puppeteer, react-pdf) later if needed

### 13. Financial Tracker as Single Page (Vault Pattern)

**Decision:** Build the financial tracker as a single-page design (`/finances`) with inline CRUD, following the vault pattern rather than the journal's multi-page pattern

**Reason:**
- Financial items are simple CRUD — no rich content, no AI processing
- Summary cards at top need to be always visible alongside the item list
- Inline edit is natural for tabular data (name, amount, notes)
- Single page reduces navigation overhead for quick data entry
- Follows established vault pattern for consistency

### 14. Timeline as Single Page with Year Grouping

**Decision:** Build the timeline as a single-page design (`/timeline`) with events grouped by year and a visual timeline line, following the vault/finances single-page pattern

**Reason:**
- Timeline events are simple CRUD — title, date, category, description
- Visual timeline with vertical line and coloured dots by category adds clarity
- Year grouping gives natural structure without separate pages
- Inline edit/delete follows established vault/finances pattern
- Original spec had separate `/timeline/new` and `/timeline/[id]/edit` pages, but single-page is more consistent with the rest of the app

### 15. Full Brief Generator — Parallel Fetch + Summarise-First Strategy

**Decision:** Fetch all user data in parallel, prefer existing AI summaries over raw journal content, and cap at 30 journal entries to stay within context limits

**Reason:**
- Parallel fetching (Promise.all) keeps response time fast even with lots of data
- Using pre-generated AI summaries for journal entries reduces token usage and improves brief quality (structured data in, structured data out)
- Falls back to truncated raw content (500 chars) for entries without summaries
- 30-entry limit prevents prompt from exceeding Groq's context window
- 3000 max tokens gives room for a comprehensive 1-2 page brief

### 16. Lazy Groq Client Initialisation

**Decision:** Initialise the Groq SDK client inside a function call rather than at module level

**Reason:**
- Groq SDK throws an error if `GROQ_API_KEY` env var is missing at instantiation time
- At module level, this runs during Next.js build (both locally and on Vercel)
- Vercel builds don't have runtime env vars available during the build step
- Lazy init defers instantiation to request time, when env vars are available

## Phase 3 Decisions

### 17. Mobile Navigation — Hamburger Menu

**Decision:** Replace the horizontal nav link row with a hamburger menu on mobile (`< md` breakpoint), keeping the desktop nav unchanged

**Reason:**
- The shared Header component renders 7 nav items that wrap/overflow on mobile screens
- Every authenticated page uses Header, so fixing it once fixes all pages
- Hamburger with slide-down panel is standard mobile UX
- Active route highlighting via `usePathname()` helps orientation

### 18. Journal Auto-Save via localStorage

**Decision:** Save journal draft to localStorage with debounced writes (~1 second), show recovery banner on page load

**Reason:**
- Users may be emotionally distressed while writing — accidental navigation shouldn't lose their work
- localStorage is simpler than a server-side draft system and works offline
- Debounce prevents excessive writes on every keystroke
- Clear on successful save to prevent stale drafts

### 19. Currency Formatting from Profile Country

**Decision:** Create a country-to-currency map and format financial amounts based on the user's profile country instead of hardcoded USD

**Reason:**
- Users set their country during onboarding — we already have this data
- Showing $ to a UK user is confusing/wrong
- Simple static map is enough for now (no API needed)
- Default to USD for unmapped countries

### 20. Brief History Persistence

**Decision:** Save generated briefs to a `briefs` table so users can view and compare past briefs

**Reason:**
- Implements the "Brief persistence" item from Future Considerations
- Users update their data over time — comparing briefs shows progress
- Simple table: id, user_id, content, generated_at with RLS
- Low cost, high value for returning users

### 21. Page Header Mobile Layout Pattern

**Decision:** Use `flex-col sm:flex-row` pattern for all page headers (title + action button) across all feature pages

**Reason:**
- Consistent pattern across journal, vault, finances, timeline, brief
- On mobile: title stacks above the action button instead of cramming side-by-side
- Matches Tailwind responsive conventions
- One-time change, applied identically across 5 pages

## Future Considerations

- **Email notifications:** Evaluate Supabase Edge Functions vs external service.
- **Multi-language:** Consider i18n library (next-intl or similar) when ready.
- **Brief customisation:** Let users choose which data sources to include (e.g. exclude finances, focus on children).
- **Dark mode toggle:** Already have `dark:` classes in most components, just need a toggle mechanism and persistence.
