"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, HelpCircle } from "lucide-react";
import { useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";
import { cn } from "@niat/reviews-ui/lib/utils";

export function SeniorMobileBottomBar() {
  const pathname = usePathname();
  const { p } = useReviewsUi();

  const nav = [
    { href: p("/dashboard"), label: "Dashboard", icon: LayoutDashboard },
    { href: p("/questions"), label: "Questions", icon: HelpCircle },
  ];

  if (pathname.includes("/onboarding")) return null;

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-[env(safe-area-inset-bottom)]"
      style={{ backgroundColor: "var(--niat-navbar)" }}
    >
      <div className="flex items-center gap-1 px-2 py-2 border-t border-niat-border shadow-soft">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 min-h-[44px] transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-niat-text-secondary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
