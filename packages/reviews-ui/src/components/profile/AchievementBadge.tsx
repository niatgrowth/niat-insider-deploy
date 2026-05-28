"use client";

import { cn } from "@niat/reviews-ui/lib/utils";

export interface AchievementBadgeProps {
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function AchievementBadge({
  icon,
  label,
  className,
}: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-niat-border bg-[var(--niat-section)] text-niat-text transition-colors hover:border-primary/30",
        className
      )}
      title={label}
      role="img"
      aria-label={label ?? "Achievement"}
    >
      {icon ?? (
        <span className="text-sm font-medium">
          {label?.slice(0, 1).toUpperCase() ?? "?"}
        </span>
      )}
    </div>
  );
}
