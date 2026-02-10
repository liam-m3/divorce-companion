'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/dashboard/Header';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FINANCIAL_TYPES, FREQUENCY_OPTIONS } from '@/types';
import type { FinancialItem, FinancialType, Frequency } from '@/types';

const TYPE_LABELS: Record<FinancialType, string> = {
  asset: 'Asset',
  debt: 'Debt',
  income: 'Income',
  expense: 'Expense',
};

const TYPE_COLORS: Record<FinancialType, string> = {
  asset: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  debt: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  income: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  expense: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

const FREQUENCY_LABELS: Record<Frequency, string> = {
  one_time: 'One-time',
  monthly: 'Monthly',
  annually: 'Annually',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function FinancesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState<FinancialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FinancialType | ''>('');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  // Add form state
  const [newType, setNewType] = useState<FinancialType>('asset');
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newFrequency, setNewFrequency] = useState<Frequency | ''>('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    fetchItems();
  }, [typeFilter, search]);

  async function fetchItems() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    let query = supabase
      .from('financial_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (typeFilter) {
      query = query.eq('type', typeFilter);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching financial items:', error);
    } else {
      setItems((data as FinancialItem[]) || []);
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newName.trim()) {
      setError('Name is required.');
      return;
    }
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      setError('Please enter a valid amount.');
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
      .from('financial_items')
      .insert({
        user_id: user.id,
        type: newType,
        name: newName.trim(),
        amount,
        frequency: (newType === 'income' || newType === 'expense') ? (newFrequency || null) : null,
        notes: newNotes.trim() || null,
      });

    if (insertError) {
      setError(`Failed to save: ${insertError.message}`);
      setSaving(false);
      return;
    }

    // Reset form
    setNewType('asset');
    setNewName('');
    setNewAmount('');
    setNewFrequency('');
    setNewNotes('');
    setShowAddForm(false);
    setSaving(false);
    fetchItems();
  }

  async function handleDelete(itemId: string) {
    await supabase
      .from('financial_items')
      .delete()
      .eq('id', itemId);

    fetchItems();
  }

  async function handleUpdate(itemId: string, updates: Partial<Pick<FinancialItem, 'type' | 'name' | 'amount' | 'frequency' | 'notes'>>) {
    await supabase
      .from('financial_items')
      .update(updates)
      .eq('id', itemId);

    fetchItems();
  }

  // Calculate summary totals from ALL items (not filtered)
  const allItems = items;
  // We need unfiltered items for summary, so fetch separately if filtering
  // For simplicity, compute from current items when no filter is active
  // When filter is active, summary cards are hidden or we refetch all

  const totalAssets = items.filter(i => i.type === 'asset').reduce((sum, i) => sum + Number(i.amount), 0);
  const totalDebts = items.filter(i => i.type === 'debt').reduce((sum, i) => sum + Number(i.amount), 0);
  const netWorth = totalAssets - totalDebts;
  const monthlyIncome = items.filter(i => i.type === 'income').reduce((sum, i) => {
    const amt = Number(i.amount);
    if (i.frequency === 'annually') return sum + amt / 12;
    if (i.frequency === 'monthly') return sum + amt;
    return sum + amt;
  }, 0);
  const monthlyExpenses = items.filter(i => i.type === 'expense').reduce((sum, i) => {
    const amt = Number(i.amount);
    if (i.frequency === 'annually') return sum + amt / 12;
    if (i.frequency === 'monthly') return sum + amt;
    return sum + amt;
  }, 0);
  const monthlyNet = monthlyIncome - monthlyExpenses;

  const itemCount = items.length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Financial Tracker
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {loading ? 'Loading...' : `${itemCount} item${itemCount !== 1 ? 's' : ''}`} &middot; Track assets, debts, income &amp; expenses
            </p>
          </div>
          <Button className="w-full sm:w-auto shrink-0" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add Item'}
          </Button>
        </div>

        {/* Summary cards */}
        {!loading && items.length > 0 && !typeFilter && !search && (
          <div className="mb-6 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard label="Total Assets" amount={totalAssets} color="text-emerald-600 dark:text-emerald-400" />
              <SummaryCard label="Total Debts" amount={totalDebts} color="text-red-600 dark:text-red-400" />
              <SummaryCard label="Net Worth" amount={netWorth} color={netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard label="Monthly Income" amount={monthlyIncome} color="text-blue-600 dark:text-blue-400" />
              <SummaryCard label="Monthly Expenses" amount={monthlyExpenses} color="text-amber-600 dark:text-amber-400" />
              <SummaryCard label="Monthly Net" amount={monthlyNet} color={monthlyNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} />
            </div>
          </div>
        )}

        {/* Add item form */}
        {showAddForm && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {FINANCIAL_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        newType === t
                          ? TYPE_COLORS[t]
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Family home, Car loan, Salary"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              {(newType === 'income' || newType === 'expense') && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Frequency
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FREQUENCY_OPTIONS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setNewFrequency(newFrequency === f ? '' : f)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          newFrequency === f
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {FREQUENCY_LABELS[f]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Joint account, Estimated value"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button onClick={handleAdd} isLoading={saving}>
                  Save Item
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* Type filter tabs and search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FinancialType | '')}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="">All types</option>
            {FINANCIAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}s
              </option>
            ))}
          </select>
        </div>

        {/* Items list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {typeFilter || search
                ? 'No items match your search.'
                : 'No financial items yet.'}
            </p>
            {!typeFilter && !search && (
              <Button onClick={() => setShowAddForm(true)}>
                Add your first item
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <FinancialItemCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-3 sm:p-4">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 truncate">{label}</p>
      <p className={`text-sm sm:text-lg font-bold ${color} truncate`}>
        {formatCurrency(amount)}
      </p>
    </div>
  );
}

function FinancialItemCard({
  item,
  onDelete,
  onUpdate,
}: {
  item: FinancialItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<FinancialItem, 'type' | 'name' | 'amount' | 'frequency' | 'notes'>>) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editAmount, setEditAmount] = useState(String(item.amount));
  const [editType, setEditType] = useState<FinancialType>(item.type);
  const [editFrequency, setEditFrequency] = useState<Frequency | ''>(item.frequency || '');
  const [editNotes, setEditNotes] = useState(item.notes || '');

  const createdDate = new Date(item.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleSaveEdit = () => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) return;
    if (!editName.trim()) return;

    onUpdate(item.id, {
      type: editType,
      name: editName.trim(),
      amount,
      frequency: (editType === 'income' || editType === 'expense') ? (editFrequency || null) : null,
      notes: editNotes.trim() || null,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Type</label>
            <div className="flex flex-wrap gap-2">
              {FINANCIAL_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setEditType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    editType === t
                      ? TYPE_COLORS[t]
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Amount ($)</label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          {(editType === 'income' || editType === 'expense') && (
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Frequency</label>
              <div className="flex flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setEditFrequency(editFrequency === f ? '' : f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      editFrequency === f
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {FREQUENCY_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Notes</label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-zinc-900 dark:text-white truncate">
              {item.name}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[item.type]}`}>
              {TYPE_LABELS[item.type]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-lg font-bold ${
              item.type === 'asset' || item.type === 'income'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(Number(item.amount))}
            </span>
            {item.frequency && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                / {FREQUENCY_LABELS[item.frequency].toLowerCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Added {createdDate}</span>
          </div>
          {item.notes && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {item.notes}
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
                onClick={() => { onDelete(item.id); setConfirmDelete(false); }}
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
  );
}
