'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, MOCK_USERS } from '../../lib/auth-context';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { activeUserId, switchUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/projects', label: 'Discover' },
    { href: '/projects/my', label: 'My Projects' },
    { href: '/requests', label: 'Requests' },
    { href: '/profile', label: 'Profile' },
  ];

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || (pathname.startsWith(href) && href !== '/projects');

  return (
    <header
      className={`sticky top-0 z-50 transition-[backdrop-filter,background-color] duration-300 ${
        scrolled
          ? 'bg-background/60 backdrop-blur-md border-b border-[var(--card-edge)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between gap-5 px-6 py-4 sm:px-12">
        {/* Wordmark */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="font-brand text-xl font-semibold tracking-tight text-foreground">
            Project<span className="text-brand">Hub</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive(link.href)
                  ? 'text-foreground bg-[var(--card-fill)] border border-[var(--card-edge)]'
                  : 'text-muted-foreground hover:text-brand'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Coming soon — low-opacity, no interactivity */}
          <span className="px-3.5 py-2 text-sm font-medium text-muted-foreground/40 cursor-default select-none">
            Mentors
          </span>
          <span className="px-3.5 py-2 text-sm font-medium text-muted-foreground/40 cursor-default select-none">
            Events
          </span>
        </div>

        {/* Right side: CTA + user switcher */}
        <div className="flex items-center gap-3">
          {/* Primary CTA — asymmetric solid button */}
          <Link
            href="/projects/create"
            className="btn-asym hidden sm:inline-flex h-9 items-center gap-1.5 bg-foreground px-4 text-sm font-medium text-background transition-colors duration-200 hover:bg-foreground/90"
          >
            New project
          </Link>

          {/* Dev user switcher */}
          <div className="card-chai flex items-center gap-2 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
              User:
            </span>
            <select
              value={activeUserId}
              onChange={e => switchUser(e.target.value)}
              className="bg-transparent text-xs text-foreground font-medium focus:outline-none cursor-pointer max-w-[120px] sm:max-w-[180px]"
            >
              {MOCK_USERS.map(u => (
                <option key={u.id} value={u.id} className="bg-background text-foreground">
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--card-edge)] bg-background/95 backdrop-blur-md px-6 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-foreground bg-[var(--card-fill)]'
                  : 'text-muted-foreground hover:text-brand'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/projects/create"
            onClick={() => setMenuOpen(false)}
            className="block mt-3 btn-asym px-4 py-2.5 bg-foreground text-background text-sm font-medium text-center"
          >
            New project
          </Link>
        </div>
      )}
    </header>
  );
};
