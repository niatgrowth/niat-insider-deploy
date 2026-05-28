"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";
import { cn } from "@niat/reviews-ui/lib/utils";

export function ProspectiveLeftSidebar() {
  const pathname = usePathname();
  const { p, paths } = useReviewsUi();

  const nav = [
    { href: paths.base, label: "Home" },
    { href: p("/questions"), label: "Questions" },
    { href: p("/ask"), label: "Ask a Question" },
  ];

  return (
    <aside className="hidden lg:block w-[220px] shrink-0 min-h-0 overflow-y-auto scrollbar-hide">
      <nav className="rounded-2xl bg-niat-section border border-niat-border p-3 shadow-soft">
        <ul className="space-y-0.5">
          {nav.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === href || (href !== paths.base && pathname.startsWith(href))
                    ? "bg-primary text-primary-foreground"
                    : "text-niat-text hover:bg-niat-border/50"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
