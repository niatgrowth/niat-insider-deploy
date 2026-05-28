"use client";

import { NavbarLogo } from "./NavbarLogo";

/**
 * Placeholder navbar shown until auth role is known (isRoleReady).
 * Same layout as real navbars to avoid layout shift when real nav appears.
 */
export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full px-2 pt-2 sm:px-3 sm:pt-3">
      <div
        className="max-w-[88rem] mx-auto flex h-14 sm:h-16 md:h-20 items-center gap-2 sm:gap-4 px-3 sm:px-5 rounded-xl sm:rounded-2xl border border-niat-border shadow-soft"
        style={{ backgroundColor: "var(--niat-navbar)" }}
      >
        <NavbarLogo />
        <div className="flex-1 min-w-0" aria-hidden />
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 rounded-lg animate-pulse bg-niat-border/50" aria-hidden />
          <div className="h-9 w-20 rounded-lg animate-pulse bg-niat-border/50" aria-hidden />
          <div className="h-9 w-10 rounded-lg animate-pulse bg-niat-border/50" aria-hidden />
        </div>
      </div>
    </header>
  );
}
