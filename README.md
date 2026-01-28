# Divorce Companion

Structured support and organisation tools for individuals going through divorce.

## Overview

Divorce Companion is a web app that helps people navigate separation by providing:
- Personalised onboarding based on your situation
- Adaptive dashboard with relevant checklists and resources
- Organisation tools for the divorce process

**Note:** This app provides organisational support, not legal advice.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) (Auth + PostgreSQL)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd divorce-companion
```

2. Install dependencies:
```bash
npm install
```

3. Create a Supabase project at [supabase.com](https://supabase.com)

4. Run the database schema in Supabase SQL Editor (see Database Setup below)

5. Copy the environment example and add your credentials:
```bash
cp .env.local.example .env.local
```

6. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  country TEXT,
  relationship_type TEXT,
  stage TEXT,
  priorities TEXT[] DEFAULT '{}',
  has_children BOOLEAN,
  children_count INTEGER,
  children_ages TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── onboarding/  # Onboarding flow components
│   └── dashboard/   # Dashboard components
├── lib/             # Utilities and config
│   └── supabase/    # Supabase clients
└── types/           # TypeScript definitions
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - Technical architecture overview
- [Decisions](./docs/DECISIONS.md) - Technical decision log
- [Roadmap](./docs/ROADMAP.md) - Development roadmap

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private project - not for public distribution.
