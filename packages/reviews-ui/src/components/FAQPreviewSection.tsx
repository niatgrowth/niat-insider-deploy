"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFAQs } from "@niat/reviews-ui/hooks/useFAQs";
import { FAQAccordion } from "@niat/reviews-ui/components/qa";
import { LoadingSpinner } from "@niat/reviews-ui/components/LoadingSpinner";
import { ReviewsLink } from "@niat/reviews-ui/components/ReviewsLink";
import { cn } from "@niat/reviews-ui/lib/utils";
import { useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";

const MAX_FAQ_ITEMS = 8;

interface FAQPreviewSectionProps {
  className?: string;
  maxItems?: number;
}

export function FAQPreviewSection({
  className,
  maxItems = MAX_FAQ_ITEMS,
}: FAQPreviewSectionProps) {
  const router = useRouter();
  const { isAuthenticated, loginUrl, p } = useReviewsUi();
  const sectionRef = useRef<HTMLElement>(null);
  const [fetchEnabled, setFetchEnabled] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setFetchEnabled(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { data: faqs, status, error } = useFAQs({
    enabled: fetchEnabled,
    previewLimit: maxItems,
  });
  const list = faqs?.slice(0, maxItems) ?? [];

  const handleViewAllQuestions = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push(loginUrl(p("/questions")));
    }
  };

  const showPlaceholder = !fetchEnabled || status === "pending";

  return (
    <section
      ref={sectionRef}
      className={cn("w-full max-w-4xl mx-auto px-4 pb-12 sm:pb-16", className)}
    >
      <h2 className="text-lg font-semibold text-niat-text mb-4">Frequently Asked Questions</h2>

      {showPlaceholder && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {fetchEnabled && status === "error" && (
        <div className="rounded-2xl border border-niat-border p-8 text-center bg-[var(--niat-section)]">
          <p className="text-niat-text-secondary">Could not load FAQs. {error?.message}</p>
          <ReviewsLink
            href="/questions"
            onClick={handleViewAllQuestions}
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Browse all questions
          </ReviewsLink>
        </div>
      )}

      {fetchEnabled && status === "success" && list.length > 0 && (
        <>
          <div
            className="rounded-2xl border border-niat-border p-4 sm:p-6 shadow-soft"
            style={{ backgroundColor: "var(--niat-section)" }}
          >
            <FAQAccordion items={list} maxItems={maxItems} />
          </div>
          <div className="mt-6 text-center">
            <ReviewsLink
              href="/questions"
              onClick={handleViewAllQuestions}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all questions →
            </ReviewsLink>
          </div>
        </>
      )}

      {fetchEnabled && status === "success" && list.length === 0 && (
        <div className="rounded-2xl border border-niat-border p-8 text-center bg-[var(--niat-section)]">
          <p className="text-niat-text-secondary">No FAQs yet.</p>
          <ReviewsLink
            href="/questions"
            onClick={handleViewAllQuestions}
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Browse all questions
          </ReviewsLink>
        </div>
      )}
    </section>
  );
}
