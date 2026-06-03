'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-app)] text-[var(--text-primary)] p-6 font-sans">
      <div className="max-w-md w-full bg-[var(--bg-surface-elevated)] p-8 rounded-2xl shadow-lg border border-[var(--danger-border)] text-center">
        <div className="w-16 h-16 bg-[var(--danger-surface)] text-[var(--danger-default)] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <h2 className="text-2xl font-black mb-4">Something went wrong!</h2>
        <p className="text-[var(--text-secondary)] mb-8 text-sm">
          We experienced an unexpected error. Please try again or return to the dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[var(--bg-canvas)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)] rounded-xl font-bold transition-all text-sm"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl font-bold transition-all hover:opacity-90 text-sm"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
