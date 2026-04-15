import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During static prerender on the server env vars may be absent. The real
  // browser render always has them inlined, so return a stub here to let the
  // prerender complete. Any actual supabase calls only fire from useEffect
  // or event handlers, which run client-side.
  if (!url || !key) {
    if (typeof window === 'undefined') {
      return null as unknown as ReturnType<typeof createBrowserClient>;
    }
    throw new Error('Supabase env vars missing');
  }

  return createBrowserClient(url, key);
}
