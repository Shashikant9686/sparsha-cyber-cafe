'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Layers, Bell, ArrowRight } from 'lucide-react';

interface SearchResult {
  title: string;
  category: 'Service' | 'Update' | 'Link';
  href: string;
}

const STATIC_LINKS: SearchResult[] = [
  { title: 'All Services & Applications', category: 'Link', href: '/services' },
  { title: 'Latest Updates & Deadlines', category: 'Link', href: '/updates' },
  { title: 'Admission & Counselling Desk', category: 'Link', href: '/counselling' },
  { title: 'Contact & Location', category: 'Link', href: '/contact' },
  { title: 'Bhoomi RTC / Land Records', category: 'Service', href: '/services?q=bhoomi' },
  { title: '371(J) Quota Certificate', category: 'Service', href: '/services?q=371' },
  { title: 'KCET / NEET Counselling Form', category: 'Service', href: '/counselling' },
  { title: 'Passport Application', category: 'Service', href: '/services?q=passport' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = STATIC_LINKS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-[15vh] backdrop-blur-sm animate-fade-in-up-1">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, admissions, updates (Esc to exit)..."
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching services or shortcuts found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item.href)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  {item.category === 'Service' && <Layers className="h-4 w-4 text-blue-600" />}
                  {item.category === 'Update' && <Bell className="h-4 w-4 text-amber-500" />}
                  {item.category === 'Link' && <Search className="h-4 w-4 text-slate-400" />}
                  <span className="font-medium text-slate-700">{item.title}</span>
                </div>
                <span className="flex items-center text-xs text-slate-400">
                  {item.category} <ArrowRight className="ml-1 h-3 w-3" />
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-right text-[11px] text-slate-400">
          Tip: Press <kbd className="rounded bg-slate-200 px-1 py-0.5 font-mono">Ctrl + K</kbd> to open anytime
        </div>
      </div>
    </div>
  );
}