"use client";

/**
 * Placeholder left sidebar shown until auth role is known (isRoleReady).
 * Matches SeniorLeftSidebar/ProspectiveLeftSidebar layout to avoid shift when real sidebar appears.
 */
export function LeftSidebarSkeleton() {
  return (
    <aside className="hidden lg:block w-[220px] shrink-0 min-h-0 overflow-y-auto scrollbar-hide">
      <nav className="rounded-2xl bg-niat-section border border-niat-border p-3 shadow-soft">
        <ul className="space-y-0.5">
          {[1, 2, 3].map((i) => (
            <li key={i}>
              <div
                className="block rounded-xl px-3 py-2.5 h-10 animate-pulse bg-niat-border/50"
                style={{ width: i === 1 ? "80%" : i === 2 ? "90%" : "70%" }}
                aria-hidden
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
