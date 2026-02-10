'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/journal', label: 'Journal' },
  { href: '/vault', label: 'Vault' },
  { href: '/finances', label: 'Finances' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/brief', label: 'Brief' },
  { href: '/profile', label: 'Edit Profile' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 relative" ref={menuRef}>
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-zinc-900 dark:text-white">
          Divorce Companion
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                isActive(link.href)
                  ? 'text-zinc-900 dark:text-white font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span
            className={`block w-5 h-0.5 bg-zinc-700 dark:bg-zinc-300 transition-all duration-200 ${
              menuOpen ? 'rotate-45 translate-y-[3px]' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-zinc-700 dark:bg-zinc-300 transition-all duration-200 mt-1 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-zinc-700 dark:bg-zinc-300 transition-all duration-200 mt-1 ${
              menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-zinc-200 dark:border-zinc-800 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                Log out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
