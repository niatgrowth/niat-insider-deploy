'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
      <p className="text-sm text-gray-600 text-center max-w-md">
        An unexpected error occurred. You can try again or return home.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-[#991b1b] px-4 py-2 text-sm font-medium text-white hover:bg-[#7f1d1d]"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
