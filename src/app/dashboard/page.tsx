import { redirect } from 'next/navigation';
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
