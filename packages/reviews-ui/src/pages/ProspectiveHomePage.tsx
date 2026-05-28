'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { getStoredUsername } from '@niat/reviews-ui/lib/auth';
import { getTimeGreeting } from '@niat/reviews-ui/lib/utils';
import { useReviewsAuth, useReviewsUi } from '@niat/reviews-ui/context/ReviewsUiContext';
import { HomeSearchConsole } from '@niat/reviews-ui/components/HomeSearchConsole';
import { FAQPreviewSection } from '@niat/reviews-ui/components/FAQPreviewSection';
import { LoadingSpinner } from '@niat/reviews-ui/components/LoadingSpinner';

export function ProspectiveHomePage() {
  const router = useRouter();
  const { role } = useReviewsAuth();
  const { p, isAuthenticated } = useReviewsUi();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (role === 'senior') {
      router.replace(p('/dashboard'));
    }
  }, [role, router, p]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const auth = mounted && isAuthenticated;
  const greeting = getTimeGreeting();
  const displayName = auth ? (getStoredUsername() ?? 'there') : 'there';

  if (role === 'senior') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <section
        className="animate-niat-fade-in flex flex-col items-center justify-center min-h-[85vh] sm:min-h-[88vh] px-4 py-12 text-center opacity-0"
        style={{
          background: 'linear-gradient(180deg, var(--hero-from) 0%, var(--hero-to) 100%)',
        }}
      >
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-medium text-white/90 border border-white/20 mb-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          NIAT Insider · Q&amp;A
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-3xl flex items-center justify-center gap-2 flex-wrap leading-tight">
          {auth ? (
            <>
              <Sparkles className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" style={{ color: 'var(--accent-1)' }} aria-hidden />
              <span>
                {greeting}, {displayName}
              </span>
            </>
          ) : (
            <>
              <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                Real NIAT experiences.
              </span>
              <br className="sm:hidden" />
              <span style={{ color: 'var(--accent-1)' }}>Real answers.</span>
            </>
          )}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-white/85 max-w-xl font-medium tracking-tight">
          Ask anything — placements, hostel, fees, campus life. Answers from verified NIAT seniors who&apos;ve been
          there.
        </p>
        <div className="mt-8 w-full">
          <HomeSearchConsole />
        </div>
      </section>
      <section
        className="animate-niat-fade-in flex-1 pt-10 opacity-0"
        style={{ backgroundColor: 'var(--niat-section)', animationDelay: '120ms' }}
      >
        <FAQPreviewSection maxItems={8} />
      </section>
    </div>
  );
}
