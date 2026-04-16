import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';
import { getCurrencyConfig } from '@/lib/currency';
import Header from '@/components/dashboard/Header';

const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  legal: 'Legal',
  financial: 'Financial',
  personal: 'Personal',
  correspondence: 'Correspondence',
  court: 'Court',
  other: 'Other',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');
  if (!profile.onboarding_completed) redirect('/onboarding');

  const typedProfile = profile as Profile;

  const [journalRes, docsRes, timelineRes, financeRes] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('id, title, content, created_at, ai_summary')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('documents')
      .select('id, file_name, category, uploaded_at')
      .order('uploaded_at', { ascending: false })
      .limit(1),
    supabase
      .from('timeline_events')
      .select('id, title, event_date')
      .order('event_date', { ascending: false })
      .limit(1),
    supabase
      .from('financial_items')
      .select('id, type, amount'),
  ]);

  const [journalCount, docsCount, timelineCount, financeCount] = await Promise.all([
    supabase.from('journal_entries').select('id', { count: 'exact', head: true }),
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase.from('timeline_events').select('id', { count: 'exact', head: true }),
    supabase.from('financial_items').select('id', { count: 'exact', head: true }),
  ]);

  const counts = {
    journal: journalCount.count ?? 0,
    docs: docsCount.count ?? 0,
    timeline: timelineCount.count ?? 0,
    finance: financeCount.count ?? 0,
  };
  const totalItems = counts.journal + counts.docs + counts.timeline + counts.finance;

  const latestJournal = journalRes.data?.[0] ?? null;
  const latestDoc = docsRes.data?.[0] ?? null;
  const latestEvent = timelineRes.data?.[0] ?? null;

  const financeItems = financeRes.data ?? [];
  const assets = financeItems
    .filter((i) => i.type === 'asset')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const debts = financeItems
    .filter((i) => i.type === 'debt')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const hasAssetsOrDebts = financeItems.some((i) => i.type === 'asset' || i.type === 'debt');
  const netWorth = assets - debts;

  const currency = getCurrencyConfig(typedProfile.country);
  const formatMoney = (n: number) =>
    new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.currency,
      maximumFractionDigits: 0,
    }).format(n);

  const greeting = typedProfile.display_name
    ? `Welcome back, ${typedProfile.display_name}`
    : 'Welcome back';

  const journalPreview = latestJournal
    ? (latestJournal.title?.trim() || latestJournal.content?.trim().split('\n')[0] || 'Untitled entry')
    : null;

  const hasActivity = !!(latestJournal || latestDoc || latestEvent || hasAssetsOrDebts);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {greeting}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            A quick look at what you&apos;ve got going on.
          </p>
        </div>

        {totalItems > 0 && (
          <div className="mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Your progress</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Journal entries" count={counts.journal} href="/journal" />
              <Stat label="Documents" count={counts.docs} href="/vault" />
              <Stat label="Timeline events" count={counts.timeline} href="/timeline" />
              <Stat label="Financial items" count={counts.finance} href="/finances" />
            </div>
          </div>
        )}

        {hasActivity && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Recent activity</h2>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-800">
              {latestJournal && (
                <Link
                  href={`/journal/${latestJournal.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest journal entry</p>
                    <p className="text-sm text-zinc-900 dark:text-white truncate">
                      {journalPreview}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(latestJournal.created_at)}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {latestJournal.ai_summary ? 'AI summary ready' : 'No summary yet'}
                    </p>
                  </div>
                </Link>
              )}

              {latestDoc && (
                <Link
                  href="/vault"
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest document</p>
                    <p className="text-sm text-zinc-900 dark:text-white truncate">
                      {latestDoc.file_name}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                    {latestDoc.category ? DOCUMENT_CATEGORY_LABELS[latestDoc.category] ?? latestDoc.category : 'Uncategorised'}
                  </p>
                </Link>
              )}

              {latestEvent && (
                <Link
                  href="/timeline"
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest timeline event</p>
                    <p className="text-sm text-zinc-900 dark:text-white truncate">
                      {latestEvent.title}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                    {formatDate(latestEvent.event_date)}
                  </p>
                </Link>
              )}

              {hasAssetsOrDebts && (
                <Link
                  href="/finances"
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Net worth</p>
                    <p className="text-sm text-zinc-900 dark:text-white">
                      {formatMoney(netWorth)}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                    {formatMoney(assets)} assets · {formatMoney(debts)} debts
                  </p>
                </Link>
              )}
            </div>
          </div>
        )}

        {totalItems > 0 && (
          <Link
            href="/brief"
            className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            You have {totalItems} {totalItems === 1 ? 'item' : 'items'} across your account.{' '}
            <span className="underline">Generate a brief for your solicitor →</span>
          </Link>
        )}

        {totalItems === 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Nothing here yet. Start with a{' '}
              <Link href="/journal/new" className="text-zinc-900 dark:text-white underline">
                journal entry
              </Link>
              , upload a document, or log a timeline event.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <Link
      href={href}
      className="block p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
    >
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">{count}</p>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
    </Link>
  );
}
