"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@niat/reviews-ui/lib/utils";
import { isAuthenticated, getLoginUrl } from "@niat/reviews-ui/lib/auth";

const PLACEHOLDER = "Search questions like: placements, fees, hostel, NIAT life...";

interface HomeSearchBoxProps {
  className?: string;
  /** Initial value (e.g. from URL ?q=) */
  initialQuery?: string;
}

export function HomeSearchBox({ className, initialQuery = "" }: HomeSearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (!isAuthenticated()) {
      router.push(getLoginUrl(`/search?q=${encodeURIComponent(q)}`));
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-2xl mx-auto", className)}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-niat-border",
          "bg-white/80 backdrop-blur-md shadow-soft",
          "focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50",
          "transition-shadow"
        )}
      >
        <Search className="ml-4 h-5 w-5 text-niat-text-secondary shrink-0" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={PLACEHOLDER}
          autoComplete="off"
          className={cn(
            "flex-1 min-w-0 py-4 pl-2 pr-4 text-base text-niat-text placeholder-niat-text-secondary",
            "bg-transparent focus:outline-none"
          )}
          aria-label="Search questions"
        />
      </div>
    </form>
  );
}
