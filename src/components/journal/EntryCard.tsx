import Link from 'next/link';
import type { JournalEntry } from '@/types';

const MOOD_COLORS: Record<string, string> = {
  calm: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  anxious: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  angry: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  sad: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  overwhelmed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  hopeful: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  frustrated: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  relieved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface EntryCardProps {
  entry: JournalEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const displayTitle = entry.title || entry.content.slice(0, 50) + (entry.content.length > 50 ? '...' : '');
  const previewContent = entry.content.slice(0, 120) + (entry.content.length > 120 ? '...' : '');
  const formattedDate = new Date(entry.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link href={`/journal/${entry.id}`}>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-medium text-zinc-900 dark:text-white line-clamp-1">
            {displayTitle}
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            {formattedDate}
          </span>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
          {previewContent}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {entry.mood && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MOOD_COLORS[entry.mood] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}`}>
              {entry.mood}
            </span>
          )}
          {entry.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-medium">
              {entry.category}
            </span>
          )}
          {entry.ai_summary && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
              AI summary
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
