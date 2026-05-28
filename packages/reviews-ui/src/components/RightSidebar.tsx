"use client";

import Link from "next/link";
import { useReviewsAuth, useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";
import { HelpCircle, FileQuestion, CheckCircle, LayoutDashboard } from "lucide-react";

export function RightSidebar() {
  const { role } = useReviewsAuth();
  const { p } = useReviewsUi();
  const isSenior = role === "senior";

  return (
    <aside className="hidden xl:block w-72 shrink-0 min-h-0 overflow-y-auto scrollbar-hide space-y-4">
      {isSenior ? (
        <section className="rounded-2xl border border-niat-border bg-[var(--niat-section)] p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-niat-text mb-3">Verified senior</h3>
          <p className="text-sm text-niat-text-secondary mb-3">
            Answer questions from prospective students on NIAT Insider.
          </p>
          <Link href={p("/dashboard")} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </section>
      ) : (
        <section className="rounded-2xl border border-niat-border bg-[var(--niat-section)] p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-niat-text mb-3 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Get started
          </h3>
          <ul className="space-y-2 text-sm text-niat-text-secondary">
            <li className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4 shrink-0 text-primary" />
              <Link href={p("/ask")} className="hover:text-primary">
                Ask a question
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
              <Link href={p("/questions")} className="hover:text-primary">
                Browse answered questions
              </Link>
            </li>
          </ul>
        </section>
      )}
    </aside>
  );
}
