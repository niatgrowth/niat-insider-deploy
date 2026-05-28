"use client";

import Link from "next/link";
import { useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";

export function NavbarLogo() {
  const { paths } = useReviewsUi();
  return (
    <Link
      href={paths.base}
      className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0"
      style={{ color: "var(--primary)" }}
    >
      <span className="inline text-sm sm:text-lg md:text-xl font-bold truncate">
        NIAT Insider · Q&amp;A
      </span>
    </Link>
  );
}
