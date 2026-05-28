"use client";

import Image from "next/image";
import { Share2, Pencil } from "lucide-react";
import { cn } from "@niat/reviews-ui/lib/utils";

export interface ProfileCardProps {
  username: string;
  avatarUrl?: string | null;
  onShare?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function ProfileCard({
  username,
  avatarUrl = null,
  onShare,
  onEdit,
  className,
}: ProfileCardProps) {
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `${username} - NIATReviews`,
        url: window.location.href,
        text: `View ${username}'s profile on NIATReviews`,
      });
    }
  };

  return (
    <aside
      className={cn(
        "w-full rounded-lg border border-niat-border bg-[var(--niat-section)] p-3 sm:p-4 shadow-soft transition-colors duration-200",
        "sm:max-w-[280px] md:w-[300px] sm:shrink-0",
        className
      )}
      aria-label="Profile"
    >
      <div className="flex flex-col items-center">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border-2 border-niat-border bg-[var(--niat-section)]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-xl sm:text-2xl font-bold text-primary"
              aria-hidden
            >
              {username.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <h2 className="mt-2 sm:mt-3 text-lg sm:text-xl font-semibold text-niat-text truncate max-w-full text-center px-1">
          {username}
        </h2>
        <div className="mt-2 sm:mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-niat-border px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-niat-text transition-colors duration-200 hover:bg-niat-border/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px] sm:min-h-0 touch-manipulation"
            aria-label="Share profile"
          >
            <Share2 className="h-4 w-4 shrink-0" />
            <span>Share</span>
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-primary px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-primary-foreground transition-colors duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px] sm:min-h-0 touch-manipulation"
              aria-label="Edit profile"
            >
              <Pencil className="h-4 w-4 shrink-0" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
