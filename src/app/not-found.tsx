import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
        <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-3xl">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full">
            404 Error
          </span>
          <h1 className="text-2xl font-black text-slate-900">Service Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The service or page you are looking for might have expired, been deactivated, or moved to another URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/services"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Browse All Services</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}