export default function Loading() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[var(--bg-app)]">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-[var(--brand-primary-muted)] rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[var(--brand-primary)] rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--brand-primary)]">
          LOAH
        </div>
      </div>
    </div>
  );
}
