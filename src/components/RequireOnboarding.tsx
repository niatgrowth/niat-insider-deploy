"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AUTH_ROLES, useAuthStore } from '@/store/authStore';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div
        className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

/**
 * Client guard: guests never render protected children. Learners may be sent to onboarding.
 * Server session + proxy enforce cookies; this aligns Zustand after hydration.
 */
export default function RequireOnboarding({ children }: RequireOnboardingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const authChecked = useAuthStore((state) => state.authChecked);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isOnboarded = useAuthStore((state) => state.isOnboarded);
  const isAuthenticated = user !== null;
  const [allowRender, setAllowRender] = useState(false);

  useEffect(() => {
    if (!authChecked) return;

    if (!user || !isAuthenticated) {
      setAllowRender(false);
      router.replace(`/login?from=${encodeURIComponent(pathname || '/')}`);
      return;
    }

    const isLearnerRole = role === AUTH_ROLES.intermediate || role === AUTH_ROLES.niat;
    const isPrivilegedRole =
      role === AUTH_ROLES.verifiedNiat || role === AUTH_ROLES.moderator || role === AUTH_ROLES.admin;
    const hasKnownRole = isLearnerRole || isPrivilegedRole;
    const isReviewPath = pathname === '/onboarding/review' || pathname?.startsWith('/onboarding/review/');
    const needsOnboarding =
      isAuthenticated && (!hasKnownRole || (isLearnerRole && !isOnboarded)) && !isReviewPath;

    if (needsOnboarding) {
      setAllowRender(false);
      const from = pathname || '/';
      router.replace(`/onboarding/role?from=${encodeURIComponent(from)}`);
      return;
    }

    setAllowRender(true);
  }, [authChecked, isAuthenticated, user, role, isOnboarded, pathname, router]);

  if (!authChecked || !allowRender) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
}
