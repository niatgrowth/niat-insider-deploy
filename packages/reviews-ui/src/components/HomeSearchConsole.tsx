"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@niat/reviews-ui/lib/utils";
import { isAuthenticated } from "@niat/reviews-ui/lib/auth";
import { useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";

const PLACEHOLDER = "How can NIAT seniors help you today?";

const SUGGESTION_CHIPS = [
  "Placements",
  "Fees",
  "Hostel",
  "Entrance Test",
  "NIAT Campus Life",
] as const;

interface HomeSearchConsoleProps {
  className?: string;
  initialQuery?: string;
}

export function HomeSearchConsole({
  className,
  initialQuery = "",
}: HomeSearchConsoleProps) {
  const router = useRouter();
  const { p, loginUrl } = useReviewsUi();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-expand height — reset to "auto" first so it shrinks when text is deleted
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [query]);

  const goToSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    if (!isAuthenticated()) {
      router.push(loginUrl(p(`/search?q=${encodeURIComponent(trimmed)}`)));
      return;
    }
    router.push(p(`/search?q=${encodeURIComponent(trimmed)}`));
  };

  const handleChipClick = (label: string) => {
    setQuery(label);
    // Focus textarea after chip click so user can continue editing
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const canSubmit = query.trim().length > 0;

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Search composer */}
      <div
        className={cn(
          "rounded-2xl border",
          "bg-white/10 backdrop-blur-md shadow-lg",
          "transition-all duration-200",
          isFocused
            ? "border-white/40 ring-2 ring-white/20 shadow-xl"
            : "border-white/20 shadow-soft",
        )}
      >
        {/* Text input area */}
        <div className="px-5 pt-4 pb-2 sm:px-6 sm:pt-5">
          {/*
           * FIX: The placeholder is now the native `placeholder` attribute on
           * the <textarea> itself — not a separate <p> above it. This means
           * clicking anywhere in the box correctly places the cursor at the
           * very beginning of line 1, not below a phantom element.
           *
           * We style the placeholder via a global CSS class below (or you can
           * add `placeholder:text-white/50` with Tailwind's placeholder variant).
           */}
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={PLACEHOLDER}
            rows={1}
            className={cn(
              "w-full resize-none overflow-hidden",
              "bg-transparent focus:outline-none",
              "text-white text-base sm:text-lg leading-relaxed",
              "placeholder:text-white/50",
              // Align cursor + text to the top-left — this is the key fix
              "align-top text-left",
              "min-h-[1.75rem]", // prevents 0-height flash on mount
              "pb-3", // space below placeholder / typed text before the action bar
            )}
            style={{ verticalAlign: "top" }}
            aria-label="Search questions"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                goToSearch(query);
              }
            }}
          />
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between px-5 pb-3 sm:px-6 sm:pb-4">
          {/* Character hint */}
          <p className="text-xs text-white/30 select-none">
            {canSubmit ? "↵ Enter to search" : "Shift+Enter for new line"}
          </p>

          {/* Submit button */}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => goToSearch(query)}
            aria-label="Submit search"
            className={cn(
              "flex items-center justify-center",
              "h-8 w-8 rounded-full",
              "transition-all duration-200",
              canSubmit
                ? "bg-white text-black hover:scale-105 hover:shadow-lg cursor-pointer"
                : "bg-white/20 text-white/30 cursor-not-allowed",
            )}
          >
            {/* Arrow-up icon (send) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M12 4l8 8h-5v8H9v-8H4l8-8z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {SUGGESTION_CHIPS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => handleChipClick(label)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              "bg-white/10 border border-white/20 text-white/80",
              "hover:bg-white/20 hover:border-white/40 hover:text-white",
              "active:scale-95",
              "transition-all duration-150",
              // Highlight chip if it matches current query
              query.trim().toLowerCase() === label.toLowerCase() &&
                "bg-white/25 border-white/40 text-white",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}