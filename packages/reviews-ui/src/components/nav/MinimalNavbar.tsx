"use client";

import { NavbarLogo } from "./NavbarLogo";

/**
 * Navbar with only the NIAT logo. Used for auth/setup and onboarding flows
 * where we don't show full nav, sidebars, or footer.
 */
export function MinimalNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full px-2 pt-2 sm:px-3 sm:pt-3">
      <div
        className="max-w-[88rem] mx-auto flex h-14 sm:h-16 md:h-20 items-center justify-center px-3 sm:px-5 rounded-xl sm:rounded-2xl border border-niat-border shadow-soft"
        style={{ backgroundColor: "var(--niat-navbar)" }}
      >
        <NavbarLogo />
      </div>
    </header>
  );
}
