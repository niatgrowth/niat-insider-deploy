/** Route-level nav hint only — ReviewsShell owns the full loading chrome. */
export default function ReviewsLoading() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-[var(--niat-border)]"
      aria-hidden
    >
      <div className="h-full w-1/3 animate-pulse bg-primary" />
    </div>
  );
}
