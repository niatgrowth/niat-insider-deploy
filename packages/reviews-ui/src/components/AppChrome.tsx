"use client";

import { usePathname } from "next/navigation";
import { useReviewsAuth, useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";
import { isQuestionDetailPath, isQuestionsListPath } from "@niat/reviews-ui/lib/paths";
import { MainLayout } from "@niat/reviews-ui/components/MainLayout";
import { SeniorNavbar } from "@niat/reviews-ui/components/nav/SeniorNavbar";
import { ProspectiveNavbar } from "@niat/reviews-ui/components/nav/ProspectiveNavbar";
import { MinimalNavbar } from "@niat/reviews-ui/components/nav/MinimalNavbar";
import { NavbarSkeleton } from "@niat/reviews-ui/components/nav/NavbarSkeleton";
import { SeniorMobileBottomBar } from "@niat/reviews-ui/components/nav/SeniorMobileBottomBar";
import { ProspectiveMobileBottomBar } from "@niat/reviews-ui/components/nav/ProspectiveMobileBottomBar";
import { MobileBottomBarSkeleton } from "@niat/reviews-ui/components/nav/MobileBottomBarSkeleton";
import { cn } from "@niat/reviews-ui/lib/utils";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, isRoleReady } = useReviewsAuth();
  const { p, footer } = useReviewsUi();
  const questionsPath = p("/questions");
  const isSenior = role === "senior";
  const showRealNav = isRoleReady;

  const isMinimalChrome =
    pathname.startsWith("/auth/setup") ||
    pathname.startsWith("/auth/magic") ||
    pathname.includes("/onboarding") ||
    pathname.includes("/profile/settings");

  const isQuestionsList = isQuestionsListPath(pathname, questionsPath);
  const isQuestionDetail = isQuestionDetailPath(pathname, questionsPath);
  const showFooter = !isMinimalChrome && !isQuestionsList;

  return (
    <div className="flex h-screen min-h-0 flex-col">
      {isMinimalChrome ? (
        <MinimalNavbar />
      ) : showRealNav ? (
        isSenior ? <SeniorNavbar /> : <ProspectiveNavbar />
      ) : (
        <NavbarSkeleton />
      )}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          isQuestionsList
            ? "overflow-hidden"
            : "overflow-x-hidden overflow-y-auto"
        )}
      >
        <div
          className={cn(
            "flex flex-col",
            isQuestionsList && "min-h-0 flex-1",
            isQuestionDetail && "min-h-full flex-1"
          )}
        >
          <MainLayout>{children}</MainLayout>
          {showFooter && footer}
        </div>
      </div>
      {!isMinimalChrome &&
        (showRealNav ? (
          isSenior ? <SeniorMobileBottomBar /> : <ProspectiveMobileBottomBar />
        ) : (
          <MobileBottomBarSkeleton />
        ))}
    </div>
  );
}
