import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <main className="max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
          Navigate your separation with clarity
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          Structured support and organisation tools for individuals going through divorce
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            Log In
          </Link>
        </div>
      </main>
    </div>
  );
}
