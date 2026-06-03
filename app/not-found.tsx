import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-app)] text-[var(--text-primary)] p-6 font-sans">
      <div className="max-w-md w-full bg-[var(--bg-surface-elevated)] p-10 rounded-[2rem] shadow-xl border border-[var(--border-subtle)] text-center">
        <h1 className="text-8xl font-black text-[var(--brand-primary-muted)] mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-[var(--text-secondary)] mb-8 font-medium">
          The sanctuary you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex px-8 py-3 bg-[var(--brand-primary)] text-white rounded-xl font-bold transition-all hover:opacity-90 active:scale-95 shadow-md"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
