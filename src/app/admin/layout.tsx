import React from 'react';
import { requireAdminSession } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdminSession();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <AdminNav userEmail={user.email || ''} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}