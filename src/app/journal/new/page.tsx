'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/dashboard/Header';
import Button from '@/components/ui/Button';
import MoodPicker from '@/components/journal/MoodPicker';
import CategoryPicker from '@/components/journal/CategoryPicker';
import type { Mood, JournalCategory } from '@/types';

export default function NewEntryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [category, setCategory] = useState<JournalCategory | null>(null);
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showDetails, setShowDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write something before saving.');
      return;
    }

    setSaving(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error: insertError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        content: content.trim(),
        title: title.trim() || null,
        mood,
        category,
        incident_date: incidentDate,
      })
      .select('id')
      .single();

    if (insertError) {
      setError(`Failed to save entry: ${insertError.message}`);
      setSaving(false);
      return;
    }

    router.push(`/journal/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            New Entry
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Write freely. Don&apos;t worry about grammar or structure.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What happened? Write everything — raw, messy, emotional. You can clean it up later..."
            className="w-full min-h-[240px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
          />

          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}

          {/* Collapsible details section */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              {showDetails ? '- Hide details' : '+ Add details (title, mood, category, date)'}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Title (optional)
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give this entry a title..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>

                <MoodPicker selected={mood} onChange={setMood} />
                <CategoryPicker selected={category} onChange={setCategory} />

                <div>
                  <label
                    htmlFor="incident-date"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    When did this happen?
                  </label>
                  <input
                    id="incident-date"
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Link href="/journal">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} isLoading={saving}>
              Save Entry
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
