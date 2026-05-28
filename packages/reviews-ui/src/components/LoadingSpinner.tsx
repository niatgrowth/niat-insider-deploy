"use client";

import { cn } from "@niat/reviews-ui/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-10 w-10 border-[3px]",
};

/**
 * Round circle spinner to indicate loading. Use instead of "Loading…" text.
 */
export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-full border-niat-border border-t-primary animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Centered block with spinner (for full-page or section loading states).
 */
export function LoadingBlock({ className }: { className?: string } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12",
        className
      )}
    >
      <LoadingSpinner size="lg" />
    </div>
  );
}
