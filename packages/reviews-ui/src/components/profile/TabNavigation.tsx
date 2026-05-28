"use client";

import { cn } from "@niat/reviews-ui/lib/utils";

export type ProfileTabId =
  | "overview"
  | "questions"
  | "answers"
  | "posts"
  | "comments"
  | "history"
  | "hidden"
  | "upvoted"
  | "downvoted";

export interface TabItem {
  id: ProfileTabId;
  label: string;
}

const DEFAULT_TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "posts", label: "Posts" },
  { id: "comments", label: "Comments" },
  { id: "history", label: "History" },
  { id: "hidden", label: "Hidden" },
  { id: "upvoted", label: "Upvoted" },
  { id: "downvoted", label: "Downvoted" },
];

export interface TabNavigationProps {
  tabs?: TabItem[];
  activeTab: ProfileTabId;
  onTabChange: (id: ProfileTabId) => void;
  className?: string;
}

export function TabNavigation({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  className,
}: TabNavigationProps) {
  return (
    <nav
      className={cn("border-b border-niat-border", className)}
      role="tablist"
      aria-label="Profile sections"
    >
      <div className="flex gap-0.5 overflow-x-auto overflow-y-hidden scrollbar-thin scroll-smooth touch-pan-x -mb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-manipulation whitespace-nowrap",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-niat-text-secondary hover:text-niat-text hover:border-niat-border"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
