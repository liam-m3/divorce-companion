'use client';

import { useState } from 'react';
import type { ChecklistItem } from '@/types';

interface ChecklistProps {
  title: string;
  items: ChecklistItem[];
}

export default function Checklist({ title, items: initialItems }: ChecklistProps) {
  // Local state only - not persisted in MVP
  const [items, setItems] = useState(initialItems);

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter(item => item.completed).length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {completedCount}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className="mt-0.5 h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
              />
              <span
                className={`text-sm ${
                  item.completed
                    ? 'text-zinc-400 dark:text-zinc-500 line-through'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {item.text}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
