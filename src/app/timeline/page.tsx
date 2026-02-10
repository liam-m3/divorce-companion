'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/dashboard/Header';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TIMELINE_CATEGORIES } from '@/types';
import type { TimelineEvent, TimelineCategory } from '@/types';

const CATEGORY_LABELS: Record<TimelineCategory, string> = {
  legal: 'Legal',
  financial: 'Financial',
  personal: 'Personal',
  emotional: 'Emotional',
  children: 'Children',
};

const CATEGORY_COLORS: Record<TimelineCategory, string> = {
  legal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  financial: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  personal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  emotional: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  children: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

const CATEGORY_DOT_COLORS: Record<TimelineCategory, string> = {
  legal: 'bg-purple-500',
  financial: 'bg-emerald-500',
  personal: 'bg-blue-500',
  emotional: 'bg-rose-500',
  children: 'bg-amber-500',
};

export default function TimelinePage() {
  const router = useRouter();
  const supabase = createClient();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<TimelineCategory | ''>('');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCategory, setNewCategory] = useState<TimelineCategory | ''>('');

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, search]);

  async function fetchEvents() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    let query = supabase
      .from('timeline_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching timeline events:', error);
    } else {
      setEvents((data as TimelineEvent[]) || []);
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newTitle.trim()) {
      setError('Title is required.');
      return;
    }
    if (!newDate) {
      setError('Date is required.');
      return;
    }

    setSaving(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { error: insertError } = await supabase
      .from('timeline_events')
      .insert({
        user_id: user.id,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        event_date: newDate,
        category: newCategory || null,
      });

    if (insertError) {
      setError(`Failed to save: ${insertError.message}`);
      setSaving(false);
      return;
    }

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewCategory('');
    setShowAddForm(false);
    setSaving(false);
    fetchEvents();
  }

  async function handleDelete(eventId: string) {
    await supabase
      .from('timeline_events')
      .delete()
      .eq('id', eventId);

    fetchEvents();
  }

  async function handleUpdate(eventId: string, updates: Partial<Pick<TimelineEvent, 'title' | 'description' | 'event_date' | 'category'>>) {
    await supabase
      .from('timeline_events')
      .update(updates)
      .eq('id', eventId);

    fetchEvents();
  }

  // Group events by year for the timeline view
  const groupedByYear: Record<string, TimelineEvent[]> = {};
  events.forEach((event) => {
    const year = new Date(event.event_date).getFullYear().toString();
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(event);
  });

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Timeline
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {loading ? 'Loading...' : `${events.length} event${events.length !== 1 ? 's' : ''}`} &middot; Key moments in your journey
            </p>
          </div>
          <Button className="w-full sm:w-auto shrink-0" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add Event'}
          </Button>
        </div>

        {/* Add event form */}
        {showAddForm && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  What happened?
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Filed for divorce, Custody hearing, Moved out"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  When did it happen?
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIMELINE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(newCategory === cat ? '' : cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        newCategory === cat
                          ? CATEGORY_COLORS[cat]
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Details (optional)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add any extra details, notes, or context..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <Button onClick={handleAdd} isLoading={saving}>
                  Save Event
                </Button>
                <Button variant="outline" onClick={() => { setShowAddForm(false); setError(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TimelineCategory | '')}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="">All categories</option>
            {TIMELINE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Colour legend */}
        {!loading && events.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6">
            {TIMELINE_CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_DOT_COLORS[cat]}`} />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{CATEGORY_LABELS[cat]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timeline view */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {categoryFilter || search
                ? 'No events match your search.'
                : 'No timeline events yet.'}
            </p>
            {!categoryFilter && !search && (
              <Button onClick={() => setShowAddForm(true)}>
                Add your first event
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {sortedYears.map((year) => (
              <div key={year}>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 sticky top-0 bg-zinc-50 dark:bg-zinc-950 py-2 z-10">
                  {year}
                </h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

                  <div className="space-y-4">
                    {groupedByYear[year].map((event) => (
                      <TimelineEventCard
                        key={event.id}
                        event={event}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TimelineEventCard({
  event,
  onDelete,
  onUpdate,
}: {
  event: TimelineEvent;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<TimelineEvent, 'title' | 'description' | 'event_date' | 'category'>>) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(event.title);
  const [editDescription, setEditDescription] = useState(event.description || '');
  const [editDate, setEditDate] = useState(event.event_date);
  const [editCategory, setEditCategory] = useState<TimelineCategory | ''>(event.category || '');

  const formattedDate = new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    if (!editDate) return;

    onUpdate(event.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      event_date: editDate,
      category: editCategory || null,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="relative pl-10">
        {/* Timeline dot */}
        <div className="absolute left-2.5 top-5 w-3 h-3 rounded-full bg-zinc-400 dark:bg-zinc-500 border-2 border-zinc-50 dark:border-zinc-950 z-10" />

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {TIMELINE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEditCategory(editCategory === cat ? '' : cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      editCategory === cat
                        ? CATEGORY_COLORS[cat]
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Details</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add details..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div className={`absolute left-2.5 top-5 w-3 h-3 rounded-full border-2 border-zinc-50 dark:border-zinc-950 z-10 ${
        event.category
          ? CATEGORY_DOT_COLORS[event.category]
          : 'bg-zinc-400 dark:bg-zinc-500'
      }`} />

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {formattedDate}
              </span>
              {event.category && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[event.category]}`}>
                  {CATEGORY_LABELS[event.category]}
                </span>
              )}
            </div>
            <h3 className="font-medium text-zinc-900 dark:text-white mt-1">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 whitespace-pre-wrap">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              Edit
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(event.id); setConfirmDelete(false); }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
