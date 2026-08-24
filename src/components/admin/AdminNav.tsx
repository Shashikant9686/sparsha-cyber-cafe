'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  GraduationCap,
  Megaphone,
  ExternalLink,
  LogOut,
} from 'lucide-react';

const links = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Services Catalog', icon: Layers },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/counselling', label: 'Counselling Desk', icon: GraduationCap },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
];

interface AdminNavProps {
  userEmail?: string;
}

export default function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col md:min-h-screen text-slate-300 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-sm font-black text-white tracking-tight uppercase">
          Sparsha Admin
        </h2>
        <span className="text-[11px] text-blue-400 font-semibold block mt-0.5 truncate">
          {userEmail || 'siddumaindargi36@gmail.com'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== '/admin' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Actions / Sign Out Footer */}
      <div className="p-4 border-t border-slate-800 space-y-1.5">
        <Link
          href="/"
          className="w-full flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-800 transition"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span>Live Website</span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 px-3.5 py-2 rounded-xl hover:bg-rose-950/30 transition text-left"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}