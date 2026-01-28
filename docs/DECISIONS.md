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

### 4. Static Content Blocks (No Persistence)

**Decision:** Checklist checkbox state is not persisted in MVP

**Reason:**
- Reduces scope for MVP
- Can be added in Phase 2 with a `checklist_items` table
- Current focus is on demonstrating adaptive dashboard concept

### 5. TypeScript Strict Mode

**Decision:** Enable strict TypeScript checking

**Reason:**
- Catches errors early
- Better IDE support
- Forces explicit typing
- Worth the extra effort for long-term maintainability

### 6. Tailwind CSS Only

**Decision:** No custom CSS files, Tailwind only

**Reason:**
- Consistent styling approach
- Faster development
- Built-in responsive utilities
- No CSS naming conventions to manage

### 7. Server Components by Default

**Decision:** Use server components where possible, client components only when needed

**Reason:**
- Better performance (less JS shipped to client)
- Direct database access without API routes
- Use `'use client'` only for:
  - Interactive forms
  - State management
  - Browser APIs

## Future Considerations

### For Phase 2

- **Checkbox persistence:** Add `user_checklist_progress` table
- **Email notifications:** Evaluate Supabase Edge Functions vs external service
- **File uploads:** Supabase Storage for document uploads
- **Multi-language:** Consider i18n library (next-intl or similar)
