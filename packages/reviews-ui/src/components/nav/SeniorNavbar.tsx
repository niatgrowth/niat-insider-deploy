"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useLayoutEffect } from "react";
import { useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";
import { useDeferredUnreadCount } from "@niat/reviews-ui/hooks/useNotifications";
import { Bell, User, ChevronDown, LogIn, LayoutDashboard } from "lucide-react";
import { cn } from "@niat/reviews-ui/lib/utils";
import { NavbarLogo } from "./NavbarLogo";

export function SeniorNavbar() {
  const pathname = usePathname();
  const { p, logout, paths, isAuthenticated } = useReviewsUi();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: unreadData } = useDeferredUnreadCount(isAuthenticated, paths.base);
  const unreadCount = unreadData?.count ?? unreadData?.unread_count ?? 0;

  useLayoutEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dashboardPath = p("/dashboard");
  const questionsPath = p("/questions");

  return (
    <header className="sticky top-0 z-50 w-full px-2 pt-2 sm:px-3 sm:pt-3">
      <div
        className="max-w-[88rem] mx-auto flex h-14 sm:h-16 md:h-20 items-center gap-2 sm:gap-4 px-3 sm:px-5 rounded-xl sm:rounded-2xl border border-niat-border shadow-soft"
        style={{ backgroundColor: "var(--niat-navbar)" }}
      >
        <NavbarLogo />
        <div className="flex-1 min-w-0" aria-hidden />
        <nav className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
          <Link
            href={dashboardPath}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg text-niat-text-secondary hover:text-primary transition-colors",
              "min-h-[44px] sm:px-3 sm:py-2 text-sm font-medium",
              pathname === dashboardPath ? "text-primary" : ""
            )}
          >
            <LayoutDashboard className="h-5 w-5 sm:h-4 sm:w-4 md:hidden" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link
            href={questionsPath}
            className={cn(
              "hidden md:flex items-center gap-1.5 rounded-lg text-niat-text-secondary hover:text-primary sm:px-3 sm:py-2 text-sm font-medium",
              pathname === questionsPath || pathname.startsWith(`${questionsPath}/`) ? "text-primary" : ""
            )}
          >
            Questions
          </Link>
          <Link
            href={p("/notifications")}
            className="relative flex items-center gap-1.5 rounded-lg text-niat-text-secondary hover:text-primary sm:px-2 sm:py-1.5"
          >
            <Bell className="h-5 w-5" />
            <span className="hidden md:inline text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <div className="relative" ref={ref}>
            <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-niat-text hover:bg-niat-border/50">
              <User className="h-5 w-5" />
              <span className="hidden md:inline">Profile</span>
              <ChevronDown className={cn("h-4 w-4", open && "rotate-180")} />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-niat-border py-1 z-50" style={{ backgroundColor: "var(--niat-section)" }}>
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-niat-border/50" onClick={() => setOpen(false)}>
                  Insider profile
                </Link>
                <Link href={paths.insiderHome} className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-niat-border/50" onClick={() => setOpen(false)}>
                  NIAT Insider home
                </Link>
                <button type="button" onClick={() => { setOpen(false); void logout(); }} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-primary text-left hover:bg-niat-border/50">
                  <LogIn className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
