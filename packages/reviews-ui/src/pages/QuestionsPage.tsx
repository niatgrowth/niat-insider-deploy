"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuestions, type UseQuestionsOptions } from "@niat/reviews-ui/hooks/useQuestions";
import { useSearchQuestions } from "@niat/reviews-ui/hooks/useSearchQuestions";
import { useQuestionCategories } from "@niat/reviews-ui/hooks/useQuestionCategories";
import { QuestionCard, QuestionSearchBar } from "@niat/reviews-ui/components/qa";
import { LoadingSpinner } from "@niat/reviews-ui/components/LoadingSpinner";
import { cn } from "@niat/reviews-ui/lib/utils";

const MOBILE_BREAKPOINT = 768;
const PAGE_SIZE_DESKTOP = 7;
const PAGE_SIZE_MOBILE = 5;

function useQuestionPageSize() {
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DESKTOP);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const set = () => setPageSize(mql.matches ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP);
    set();
    mql.addEventListener("change", set);
    return () => mql.removeEventListener("change", set);
  }, []);
  return pageSize;
}

type Filter = "all" | "answered" | "unanswered";

function QuestionsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const categoryFromUrl = searchParams.get("category") ?? "";
  const answeredParamFromUrl = searchParams.get("answered");
  const urlFilter: Filter =
    answeredParamFromUrl === "true" ? "answered" : answeredParamFromUrl === "false" ? "unanswered" : "all";
  const [filter, setFilter] = useState<Filter>(urlFilter);
  const [category, setCategory] = useState<string>(categoryFromUrl);
  const pageSize = useQuestionPageSize();
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const { data: categories = [] } = useQuestionCategories();

  useEffect(() => {
    setFilter(urlFilter);
  }, [urlFilter]);

  useEffect(() => {
    setCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  const answeredParam: UseQuestionsOptions["answered"] =
    filter === "answered" ? "true" : filter === "unanswered" ? "false" : undefined;

  const validCategory = category && categories.includes(category) ? category : undefined;

  const listQuery = useQuestions({
    answered: answeredParam,
    category: validCategory,
    pageSize,
  });

  const searchQuery = useSearchQuestions(q, "-rank");

  const isSearch = q.trim().length > 0;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = isSearch
    ? searchQuery
    : listQuery;

  const questions = data?.pages.flatMap((p) => p.results) ?? [];

  // Infinite scroll: when sentinel enters view, load next page
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || !hasNextPage || isFetchingNextPage) return;
      fetchNextPage();
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    if (isSearch) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect, isSearch, questions.length]);

  const handleCategoryClick = (cat: string) => {
    const next = category === cat ? "" : cat;
    setCategory(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("category", next);
    else url.searchParams.delete("category");
    window.history.replaceState({}, "", url.pathname + url.search);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-niat-text">All Questions</h1>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <QuestionSearchBar placeholder="Search questions..." initialQuery={q} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-niat-text-secondary">Status:</span>
              <div
                className="inline-flex rounded-lg border border-niat-border p-0.5"
                style={{ backgroundColor: "var(--niat-section)" }}
              >
                {(["all", "answered", "unanswered"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                      filter === f
                        ? "bg-primary text-primary-foreground"
                        : "text-niat-text-secondary hover:text-niat-text"
                    )}
                  >
                    {f === "all" ? "All" : f === "answered" ? "Answered" : "Unanswered"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {!isSearch && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-niat-text-secondary shrink-0">Category:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCategoryClick("")}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                    !category
                      ? "bg-primary text-primary-foreground"
                      : "text-niat-text-secondary hover:text-niat-text border border-niat-border"
                  )}
                  style={category ? { backgroundColor: "var(--niat-section)" } : undefined}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-md transition-colors border border-niat-border",
                      category === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "text-niat-text-secondary hover:text-niat-text"
                    )}
                    style={category !== cat ? { backgroundColor: "var(--niat-section)" } : undefined}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {status === "pending" && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {status === "error" && (
          <div className="py-12 text-center text-primary">
            Failed to load questions. {error?.message}
          </div>
        )}

        {status === "success" && (
          <>
            {questions.length === 0 ? (
              <div
                className="rounded-2xl border border-niat-border p-8 text-center"
                style={{ backgroundColor: "var(--niat-section)" }}
              >
                <p className="text-niat-text-secondary">
                  {isSearch ? "No questions match your search." : "No questions yet."}
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-4">
                  {questions.map((question) => (
                    <li key={question.id}>
                      <QuestionCard question={question} />
                    </li>
                  ))}
                </ul>

                {/* Sentinel for infinite scroll (list mode): when visible, load next page */}
                {!isSearch && hasNextPage && (
                  <div ref={loadMoreSentinelRef} className="min-h-[1px] w-full" aria-hidden />
                )}

                {/* Loading indicator when fetching next page */}
                {isFetchingNextPage && (
                  <div className="flex justify-center py-8">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-niat-border px-5 py-3 text-sm text-niat-text-secondary" style={{ backgroundColor: "var(--niat-section)" }}>
                      <LoadingSpinner size="sm" />
                      <span>Loading more questions…</span>
                    </div>
                  </div>
                )}

                {/* Optional: "Load more" button fallback if intersection isn't firing */}
                {!isSearch && hasNextPage && !isFetchingNextPage && (
                  <div className="flex justify-center pt-2 pb-4">
                    <button
                      type="button"
                      onClick={() => fetchNextPage()}
                      className="rounded-xl border border-niat-border px-5 py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 transition-colors"
                      style={{ backgroundColor: "var(--niat-section)" }}
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      }
    >
      <QuestionsContent />
    </Suspense>
  );
}
