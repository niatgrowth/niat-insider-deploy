"use client";

/**
 * Placeholder mobile bottom bar until auth role is known. Reserves space to avoid layout jump.
 */
export function MobileBottomBarSkeleton() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-[env(safe-area-inset-bottom)]"
      style={{ backgroundColor: "var(--niat-navbar)" }}
    >
      <div className="flex items-center gap-1 px-2 py-2 border-t border-niat-border shadow-soft">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-11 rounded-xl animate-pulse bg-niat-border/50"
            aria-hidden
          />
        ))}
      </div>
    </footer>
  );
}
