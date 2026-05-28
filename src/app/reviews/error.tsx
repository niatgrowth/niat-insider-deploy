'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ReviewsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-lg font-semibold text-gray-900">Reviews unavailable</h1>
      <p className="text-sm text-gray-600 text-center max-w-md">
        We could not load this page. Check your connection or sign in again.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-[#991b1b] px-4 py-2 text-sm font-medium text-white hover:bg-[#7f1d1d]"
        >
          Try again
        </button>
        <Link
          href="/reviews"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to reviews
        </Link>
      </div>
    </div>
  );
}
