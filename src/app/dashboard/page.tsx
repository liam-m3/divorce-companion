import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getContentBlocksForUser, STAGE_WELCOME_MESSAGES } from '@/lib/dashboard-content';
import type { Profile, Stage, Priority } from '@/types';
import Header from '@/components/dashboard/Header';
import ContentBlock from '@/components/dashboard/ContentBlock';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  if (!profile.onboarding_completed) {
    redirect('/onboarding');
  }

  // Fetch recent activity counts and latest items
  const [journalRes, docsRes, timelineRes, financeRes] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('id, title, content, created_at')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('documents')
      .select('id, file_name, uploaded_at')
      .order('uploaded_at', { ascending: false })
      .limit(1),
    supabase
      .from('timeline_events')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('financial_items')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  const [journalCount, docsCount, timelineCount, financeCount] = await Promise.all([
    supabase.from('journal_entries').select('id', { count: 'exact', head: true }),
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase.from('timeline_events').select('id', { count: 'exact', head: true }),
    supabase.from('financial_items').select('id', { count: 'exact', head: true }),
  ]);

  const activity = {
    journal: { latest: journalRes.data?.[0] ?? null, count: journalCount.count ?? 0 },
    docs: { latest: docsRes.data?.[0] ?? null, count: docsCount.count ?? 0 },
    timeline: { latest: timelineRes.data?.[0] ?? null, count: timelineCount.count ?? 0 },
    finance: { latest: financeRes.data?.[0] ?? null, count: financeCount.count ?? 0 },
  };

  const totalItems = activity.journal.count + activity.docs.count + activity.timeline.count + activity.finance.count;

  const typedProfile = profile as Profile;
  const contentBlocks = getContentBlocksForUser(
    typedProfile.stage as Stage,
    (typedProfile.priorities || []) as Priority[]
  );

  const welcomeMessage = typedProfile.stage
    ? STAGE_WELCOME_MESSAGES[typedProfile.stage as Stage]
    : 'Welcome to your dashboard';

  const greeting = typedProfile.display_name
    ? `Welcome back, ${typedProfile.display_name}`
    : 'Welcome back';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {greeting}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {welcomeMessage}
          </p>
        </div>

        {totalItems > 0 && (
          <div className="mb-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Your Progress</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '0.75rem' }}>
              <ActivityStat label="Journal Entries" count={activity.journal.count} href="/journal" latest={activity.journal.latest ? (activity.journal.latest.title || activity.journal.latest.content?.slice(0, 30) + '...') : null} />
              <ActivityStat label="Documents" count={activity.docs.count} href="/vault" latest={activity.docs.latest?.file_name ?? null} />
              <ActivityStat label="Timeline Events" count={activity.timeline.count} href="/timeline" latest={activity.timeline.latest?.title ?? null} />
              <ActivityStat label="Financial Items" count={activity.finance.count} href="/finances" latest={activity.finance.latest?.name ?? null} />
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {contentBlocks.map((block) => (
            <ContentBlock key={block.id} block={block} />
          ))}
        </div>

        {contentBlocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">
              No content available. Please update your profile to see relevant resources.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function ActivityStat({ label, count, href, latest }: { label: string; count: number; href: string; latest: string | null }) {
  return (
    <Link href={href} className="block p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
      <p className="text-2xl font-bold text-zinc-900 dark:text-white">{count}</p>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      {latest && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 truncate">
          Latest: {latest}
        </p>
      )}
    </Link>
  );
}
