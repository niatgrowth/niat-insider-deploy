"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText } from "lucide-react";
import { useSearchSuggestions } from "@niat/reviews-ui/hooks/useSearchQuestions";
import { cn } from "@niat/reviews-ui/lib/utils";
import { useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";

interface QuestionSearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  /** Initial query (e.g. from URL ?q=) */
  initialQuery?: string;
}

export function QuestionSearchBar({
  className,
  placeholder = "Search questions...",
  autoFocus = false,
  onSearch,
  initialQuery = "",
}: QuestionSearchBarProps) {
  const router = useRouter();
  const { p } = useReviewsUi();
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
    setDebouncedQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestions } = useSearchSuggestions(debouncedQuery, showSuggestions && debouncedQuery.length >= 1);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(p(`/questions?q=${encodeURIComponent(query.trim())}`));
      }
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    router.push(p(`/questions/${slug}`));
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-niat-text-secondary" />
        <input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-niat-border bg-[var(--niat-section)] pl-10 pr-10 py-2.5 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-niat-text-secondary hover:text-niat-text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {showSuggestions && debouncedQuery.length >= 1 && suggestions && suggestions.length > 0 && (
        <div
          className="absolute top-full mt-2 w-full rounded-xl border border-niat-border shadow-card z-50 max-h-96 overflow-y-auto"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          <div className="p-2">
            {suggestions.slice(0, 7).map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSuggestionClick(q.slug)}
                className="w-full flex items-start gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 rounded-lg text-left"
              >
                <FileText className="h-4 w-4 text-niat-text-secondary shrink-0 mt-0.5" />
                <span className="line-clamp-2">{q.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showSuggestions && debouncedQuery.length >= 1 && suggestions && suggestions.length === 0 && (
        <div
          className="absolute top-full mt-2 w-full rounded-xl border border-niat-border shadow-card z-50 p-4 text-center text-sm text-niat-text-secondary"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          No questions found. Press Enter to search.
        </div>
      )}
    </div>
  );
}
