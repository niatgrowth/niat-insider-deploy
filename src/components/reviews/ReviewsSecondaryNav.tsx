'use client';

import { cn } from '@/lib/utils';

const NON_SENIOR_TABS: { label: string; value: string }[] = [
  { label: 'My Questions', value: 'my-questions' },
  { label: 'Ask a Question', value: 'ask' },
];

const SENIOR_TABS: { label: string; value: string }[] = [
  { label: 'My Answers', value: 'my-answers' },
  { label: 'Browse Questions', value: 'browse' },
  { label: 'Dashboard', value: 'dashboard' },
];

interface ReviewsSecondaryNavProps {
  role: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ReviewsSecondaryNav({
  role,
  activeTab,
  onTabChange,
}: ReviewsSecondaryNavProps) {
  const tabs = role === 'verified_niat_student' ? SENIOR_TABS : NON_SENIOR_TABS;

  return (
    <nav
      className="sticky top-16 z-40 w-full border-b border-border bg-white"
      aria-label="Reviews section"
    >
      <div className="mx-auto max-w-7xl overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-max gap-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={cn(
                  'shrink-0 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px',
                  isActive
                    ? 'border-[#991b1b] text-[#991b1b]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
