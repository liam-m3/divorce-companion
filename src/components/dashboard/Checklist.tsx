'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ChecklistItem } from '@/types';

interface ChecklistProps {
  title: string;
  checklistId: string;
  items: ChecklistItem[];
}

export default function Checklist({ title, checklistId, items: initialItems }: ChecklistProps) {
  const supabase = createClient();
  const [items, setItems] = useState(initialItems);
  const [loaded, setLoaded] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    async function loadProgress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('checklist_progress')
        .select('completed_items')
        .eq('user_id', user.id)
        .eq('checklist_id', checklistId)
        .single();

      if (data?.completed_items) {
        setItems(initialItems.map(item => ({
          ...item,
          completed: data.completed_items.includes(item.id),
        })));
      }
      setLoaded(true);
    }

    loadProgress();
  }, [checklistId]);

  const toggleItem = async (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);

    const completedIds = updated.filter(i => i.completed).map(i => i.id);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('checklist_progress')
      .upsert({
        user_id: user.id,
        checklist_id: checklistId,
        completed_items: completedIds,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,checklist_id',
      });
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
      <ul className={`space-y-2 ${!loaded ? 'opacity-50' : ''}`}>
        {items.map(item => (
          <li key={item.id}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                disabled={!loaded}
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
