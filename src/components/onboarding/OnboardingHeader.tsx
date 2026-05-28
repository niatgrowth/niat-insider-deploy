'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/authApi';

/**
 * Minimal header for onboarding — logo + logout only (no app nav).
 */
export default function OnboardingHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(30,41,59,0.1)] bg-navbar">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <img src="/niat.svg" alt="NIAT" className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
          <span className="font-display text-xl font-bold tracking-tight text-[#991b1b] sm:text-2xl">
            NIAT
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-black sm:text-xl">
            Insider
          </span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-[#64748b] transition-colors hover:text-[#991b1b]"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
