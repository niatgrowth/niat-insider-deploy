"use client";

import { usePathname } from "next/navigation";
import { useReviewsAuth, useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";
import { SeniorLeftSidebar } from "@niat/reviews-ui/components/nav/SeniorLeftSidebar";
import { ProspectiveLeftSidebar } from "@niat/reviews-ui/components/nav/ProspectiveLeftSidebar";
import { isQuestionDetailPath, isQuestionsListPath } from "@niat/reviews-ui/lib/paths";
import { cn } from "@niat/reviews-ui/lib/utils";
import { RightSidebar } from "./RightSidebar";

function matches(pathname: string, target: string): boolean {
  return pathname === target || pathname.startsWith(`${target}/`);
}

function SidebarColumn({ isSenior, sticky }: { isSenior: boolean; sticky?: boolean }) {
  return (
    <div
      className={cn(
        "hidden lg:block shrink-0",
        sticky ? "self-start sticky top-4" : "min-h-0 overflow-y-auto scrollbar-hide"
      )}
    >
      {isSenior ? <SeniorLeftSidebar /> : <ProspectiveLeftSidebar />}
    </div>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { p, paths } = useReviewsUi();
  const { role, isRoleReady } = useReviewsAuth();
  const questionsPath = p("/questions");
  const isProfileSection = pathname.startsWith("/profile") && !pathname.startsWith(paths.base);
  const isOnboarding = pathname.includes("/onboarding");
  const isAuthSetup = pathname.includes("/auth/setup") || pathname.includes("/auth/magic");
  const isSettingsPage = pathname.includes("/profile/settings");
  const isMinimalLayout = isOnboarding || isAuthSetup || isSettingsPage;
  const isHomePage = pathname === paths.base;
  const isSearchPage = matches(pathname, p("/search"));
  const isDashboard = matches(pathname, p("/dashboard"));
  const isQuestionsList = isQuestionsListPath(pathname, questionsPath);
  const isQuestionDetail = isQuestionDetailPath(pathname, questionsPath);
  const isSenior = role === "senior";
  const isLoggedIn = isRoleReady && role !== null;
  const showSidebars = isLoggedIn;

  if (isMinimalLayout) {
    return <main className="flex-1 min-w-0">{children}</main>;
  }

  if (isHomePage || isSearchPage) {
    return (
      <main className="flex-1 min-w-0 scrollbar-hide pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4">
        {children}
      </main>
    );
  }

  if (!showSidebars) {
    return (
      <main className="flex-1 min-w-0 scrollbar-hide pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4">
        {children}
      </main>
    );
  }

  if (isProfileSection) {
    return (
      <main className="flex-1 min-w-0 scrollbar-hide w-full px-2 pt-2 sm:px-3 sm:pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4">
        <div className="max-w-[88rem] mx-auto">{children}</div>
      </main>
    );
  }

  if (isDashboard) {
    return (
      <div className="flex gap-6 max-w-7xl mx-auto px-6 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4 w-full min-w-0">
        {showSidebars && (isSenior ? <SeniorLeftSidebar /> : <ProspectiveLeftSidebar />)}
        <main className="flex-1 min-w-0 scrollbar-hide max-w-4xl ml-0">{children}</main>
      </div>
    );
  }

  /** List only: fixed sidebars, middle column scrolls. */
  if (isQuestionsList) {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full">
        <div className="flex flex-1 min-h-0 gap-6 max-w-7xl mx-auto px-6 pt-2 pb-2 md:pt-4 md:pb-4 w-full min-w-0">
          {showSidebars && <SidebarColumn isSenior={isSenior} sticky />}
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide max-w-2xl ml-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4">
            {children}
          </main>
          {showSidebars && (
            <div className="hidden xl:block shrink-0 self-start sticky top-4">
              <RightSidebar />
            </div>
          )}
        </div>
      </div>
    );
  }

  /**
   * Detail only: grow to fill viewport between navbar and footer when content is short;
   * footer follows naturally when content is long (outer shell scrolls).
   */
  if (isQuestionDetail) {
    return (
      <div className="flex flex-1 flex-col min-h-full w-full">
        <div className="flex flex-1 gap-6 max-w-7xl mx-auto w-full min-w-0 px-6 pt-2 pb-6 md:pt-4 md:pb-8">
          {showSidebars && <SidebarColumn isSenior={isSenior} />}
          <main className="flex flex-1 min-w-0 max-w-2xl flex-col ml-0">{children}</main>
          {showSidebars && (
            <div className="hidden xl:block shrink-0 self-start sticky top-4">
              <RightSidebar />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-6 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4 md:pt-4 w-full min-w-0">
      {showSidebars && (isSenior ? <SeniorLeftSidebar /> : <ProspectiveLeftSidebar />)}
      <main className="flex-1 min-w-0 scrollbar-hide max-w-2xl ml-0">{children}</main>
      {showSidebars && <RightSidebar />}
    </div>
  );
}
