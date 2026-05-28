'use client';

import { useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppChrome } from '@niat/reviews-ui/components/AppChrome';
import { ReviewsUiProvider } from '@niat/reviews-ui/context/ReviewsUiContext';
import '@niat/reviews-ui/styles.css';
import { logout } from '@/lib/authApi';
import { fetchReviewsUser } from '@/lib/reviewsUser';
import { createInsiderReviewsClient } from '@/lib/reviews/insiderReviewsClient';
import { toReviewsUiUser } from '@/lib/reviews/mapPersona';
import { useAuthStore, type AuthRole } from '@/store/authStore';
import type { ReviewsUser } from '@/store/reviewsStore';
import { LoadingScreen } from '@/components/ui/spinner';
import ReviewsFooter from '@/components/reviews/ReviewsFooter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const reviewsApi = createInsiderReviewsClient();

type AuthStoreSnapshot = {
  user: { id: string; username: string; phone: string } | null;
  role: AuthRole;
  isOnboarded: boolean;
  niat_review_completed: boolean;
  badge: { type: string; awarded_at: string } | null;
};

/** Fields required to drive ReviewsUiProvider without proxy /me. */
function hasReviewsIdentityFromAuth(
  user: AuthStoreSnapshot['user'],
  role: AuthRole
): boolean {
  if (!role) return false;
  if (!user) return false;
  return Boolean(user.id || user.username);
}

function reviewsUserFromAuthStore(snapshot: AuthStoreSnapshot): ReviewsUser | null {
  const { user, role, isOnboarded, niat_review_completed, badge } = snapshot;
  if (!hasReviewsIdentityFromAuth(user, role)) return null;

  const isVerifiedSenior = role === 'verified_niat_student';

  return {
    id: user!.id || '',
    username: user!.username || '',
    email: null,
    phone_number: user!.phone || null,
    role: String(role),
    is_verified_senior: isVerifiedSenior,
    is_onboarded: isOnboarded,
    niat_review_completed,
    needs_password_set: false,
    profile: null,
    badge,
  };
}

export default function ReviewsShell({ children }: { children: React.ReactNode }) {
  const authUser = useAuthStore((s) => s.user);
  const authRole = useAuthStore((s) => s.role);
  const authChecked = useAuthStore((s) => s.authChecked);
  const authIsOnboarded = useAuthStore((s) => s.isOnboarded);
  const authNiatReviewCompleted = useAuthStore((s) => s.niat_review_completed);
  const authBadge = useAuthStore((s) => s.badge);

  const [reviewsUser, setReviewsUser] = useState<ReviewsUser | null>(null);
  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    if (!authChecked) return;

    let cancelled = false;
    const authSnapshot: AuthStoreSnapshot = {
      user: authUser,
      role: authRole,
      isOnboarded: authIsOnboarded,
      niat_review_completed: authNiatReviewCompleted,
      badge: authBadge,
    };
    const fromAuth = reviewsUserFromAuthStore(authSnapshot);

    if (fromAuth) {
      setReviewsUser(fromAuth);
      setUserReady(true);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      const { ok, user } = await fetchReviewsUser();
      if (cancelled) return;
      if (ok && user) setReviewsUser(user);
      setUserReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    authChecked,
    authUser,
    authRole,
    authIsOnboarded,
    authNiatReviewCompleted,
    authBadge,
  ]);

  const handleLogout = useCallback(async () => {
    await logout();
    window.location.href = '/';
  }, []);

  // Layer 1: global auth bootstrap not finished yet
  if (!authChecked) {
    return <LoadingScreen className="min-h-screen" />;
  }

  // Layer 2–3: chrome + page content mount immediately; nav skeleton until userReady
  return (
    <QueryClientProvider client={queryClient}>
      <ReviewsUiProvider
        basePath="/reviews"
        api={reviewsApi}
        user={reviewsUser ? toReviewsUiUser(reviewsUser) : null}
        isLoading={!userReady}
        logout={handleLogout}
        footer={<ReviewsFooter />}
      >
        <div className="reviews-ui-root h-screen min-h-0 overflow-hidden bg-[var(--niat-section)] text-[var(--niat-text)]">
          <AppChrome>{children}</AppChrome>
        </div>
      </ReviewsUiProvider>
    </QueryClientProvider>
  );
}
