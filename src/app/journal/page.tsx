'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/dashboard/Header';
import Button from '@/components/ui/Button';
import EntryCard from '@/components/journal/EntryCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MOODS, JOURNAL_CATEGORIES } from '@/types';
import type { JournalEntry } from '@/types';

export default function JournalPage() {
  const router = useRouter();
  const supabase = createClient();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodFilter, setMoodFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchEntries() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      let query = supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (moodFilter) {
        query = query.eq('mood', moodFilter);
      }
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }
      if (search) {
        query = query.ilike('content', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        setEntries((data as JournalEntry[]) || []);
      }
      setLoading(false);
    }

    fetchEntries();
  }, [moodFilter, categoryFilter, search]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Journal
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Write what happened. AI will help you make sense of it later.
            </p>
          </div>
          <Link href="/journal/new">
            <Button>New Entry</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="">All moods</option>
            {MOODS.map((mood) => (
              <option key={mood} value={mood}>
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="">All categories</option>
            {JOURNAL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {search || moodFilter || categoryFilter
                ? 'No entries match your filters.'
                : 'No journal entries yet. Start by writing what\'s on your mind.'}
            </p>
            {!search && !moodFilter && !categoryFilter && (
              <Link href="/journal/new">
                <Button>Write your first entry</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
