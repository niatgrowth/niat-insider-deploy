"use client";

import { cn } from "@niat/reviews-ui/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  /** Optional illustration (e.g. Snoo-style mascot) */
  illustration?: React.ReactNode;
}

export function EmptyState({
  title = "You don't have any posts yet",
  description = "Share your first post with the community to get started.",
  actionLabel = "Create Post",
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  illustration,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-niat-border bg-[var(--niat-section)] py-16 px-6 text-center",
        className
      )}
    >
      {illustration && (
        <div className="mb-6 flex justify-center" aria-hidden>
          {illustration}
        </div>
      )}
      {!illustration && (
        <div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-niat-border text-niat-text-secondary"
          aria-hidden
        >
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
      )}
      <h2 className="text-xl font-semibold text-niat-text">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-niat-text-secondary">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {actionLabel}
          </button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="rounded-xl border border-niat-border px-4 py-2.5 text-sm font-medium text-niat-text transition-colors duration-200 hover:bg-niat-border/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
