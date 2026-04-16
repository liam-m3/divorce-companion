import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <main className="flex-1 flex items-center px-6 py-16">
        <div className="max-w-xl mx-auto w-full text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Divorce Companion
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            A quiet place to keep track of what&apos;s happening.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
