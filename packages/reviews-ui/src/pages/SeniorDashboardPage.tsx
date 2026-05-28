"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  ThumbsUp,
  Users,
  HelpCircle,
  ArrowRight,
  Sparkles,
  FileQuestion,
  MessageCircle,
  BadgeCheck,
} from "lucide-react";
import { getSeniorDashboard } from "@niat/reviews-ui/lib/api";
import { getStoredUsername } from "@niat/reviews-ui/lib/auth";
import { useReviewsAuth, useReviewsUi } from "@niat/reviews-ui/context/ReviewsUiContext";
import { ReviewsLink } from "@niat/reviews-ui/components/ReviewsLink";
import { LoadingSpinner } from "@niat/reviews-ui/components/LoadingSpinner";
import type { Question } from "@niat/reviews-ui/types/question";
import type { SeniorDashboardStats } from "@niat/reviews-ui/lib/api-types";

/** Full time-based greeting for desktop (e.g. "Good afternoon") */
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** On mobile, use "Hi" + name; if name is long, use "Senior" so nothing is cut off */
const MOBILE_NAME_MAX_LENGTH = 14;

function getMobileGreetingName(displayName: string): string {
  if (displayName === "there") return displayName;
  return displayName.length > MOBILE_NAME_MAX_LENGTH ? "Senior" : displayName;
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week(s) ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-niat-border p-4 shadow-card bg-[var(--niat-section)]"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-niat-text tabular-nums">{value}</p>
        <p className="text-sm text-niat-text-secondary">{label}</p>
      </div>
    </div>
  );
}

function PendingQuestionRow({ question }: { question: Question }) {
  return (
    <ReviewsLink
      href={`/questions/${question.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-niat-border p-3 transition-colors hover:border-primary/30 hover:shadow-soft bg-[var(--niat-section)]"
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-niat-text group-hover:text-primary transition-colors line-clamp-2">
          {question.title}
        </h3>
        <p className="text-xs text-niat-text-secondary mt-0.5">
          {formatRelativeTime(question.created_at)}
        </p>
      </div>
      <span
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity group-hover:opacity-90"
        style={{ backgroundColor: "var(--primary)" }}
      >
        Answer
        <ArrowRight className="h-4 w-4" />
      </span>
    </ReviewsLink>
  );
}

function FollowUpRow({
  questionSlug,
  questionTitle,
  bodyPreview,
  createdAt,
}: {
  questionSlug: string;
  questionTitle: string;
  bodyPreview: string;
  createdAt: string;
}) {
  return (
    <ReviewsLink
      href={`/questions/${questionSlug}`}
      className="group flex flex-col gap-1 rounded-xl border border-niat-border p-3 transition-colors hover:border-primary/30 hover:shadow-soft bg-[var(--niat-section)]"
    >
      <h3 className="font-medium text-niat-text group-hover:text-primary transition-colors line-clamp-1">
        {questionTitle}
      </h3>
      <p className="text-sm text-niat-text-secondary line-clamp-2">{bodyPreview}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-niat-text-secondary">{formatRelativeTime(createdAt)}</span>
        <span className="text-sm font-medium text-primary group-hover:underline">
          View thread
          <ArrowRight className="inline h-3.5 w-3.5 ml-0.5" />
        </span>
      </div>
    </ReviewsLink>
  );
}

export function SeniorDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loginUrl, p } = useReviewsUi();
  const { role, isRoleReady } = useReviewsAuth();

  const { data: dashboard, status: dashboardStatus, error: dashboardError } = useQuery({
    queryKey: ["seniorDashboard"],
    queryFn: getSeniorDashboard,
    enabled: role === "senior",
  });

  // Guard: role is set only at login; no profile fetch here
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(loginUrl(p("/dashboard")));
      return;
    }
    if (isRoleReady && role !== "senior") {
      router.replace(p("/questions"));
    }
  }, [isAuthenticated, isRoleReady, role, router, loginUrl, p]);

  if (!isAuthenticated || (isRoleReady && role !== "senior")) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (dashboardStatus === "pending" && !dashboard) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-niat-text-secondary mb-4">
          This dashboard is only for verified seniors. You’ve been redirected.
        </p>
        <ReviewsLink
          href="/questions"
          className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Browse questions
        </ReviewsLink>
      </div>
    );
  }

  const stats: SeniorDashboardStats = dashboard!;
  const greeting = getTimeGreeting();
  const username = getStoredUsername();
  const displayName = username ?? "there";
  const pendingQuestions = stats.pending_questions ?? [];
  const recentFollowups = stats.recent_followups ?? [];

  return (
    <div className="flex flex-col min-h-full">
      <div className="space-y-8">
        {/* Header: greeting + Verified Senior badge + profile link */}
        <header className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles
              className="h-6 w-6 shrink-0 text-[var(--accent-1)]"
              aria-hidden
            />
            {/* Mobile: short "Hi" + name (or "Senior" if name is long) — no truncation */}
            <h1 className="text-xl sm:text-2xl font-semibold text-niat-text md:hidden">
              Hi, {getMobileGreetingName(displayName)}
            </h1>
            {/* Desktop: full greeting + full name */}
            <h1 className="hidden md:block text-xl sm:text-2xl font-semibold text-niat-text">
              {greeting}, {displayName}
            </h1>
          </div>
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            title="Verified Senior"
            aria-label="Verified Senior"
          >
            <BadgeCheck className="h-5 w-5" />
          </span>
          <Link href="/profile" className="text-sm font-medium text-primary hover:underline">
            Insider profile
          </Link>
        </header>

        {/* Stats row */}
        <section>
          <h2 className="sr-only">Your stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={MessageSquare}
              value={stats.my_answers?.total ?? 0}
              label="Answers"
            />
            <StatCard
              icon={ThumbsUp}
              value={stats.answer_upvotes_total ?? 0}
              label="Upvotes on answers"
            />
            <StatCard
              icon={Users}
              value={stats.follower_count ?? 0}
              label="Followers"
            />
          </div>
        </section>

        {/* Pending questions */}
        <section>
          <h2 className="text-lg font-semibold text-niat-text mb-3 flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            Questions waiting for your answer
          </h2>
          {pendingQuestions.length === 0 ? (
            <div
              className="rounded-2xl border border-niat-border border-dashed p-8 text-center bg-[var(--niat-section)]"
            >
              <HelpCircle className="mx-auto h-10 w-10 text-niat-text-secondary/60 mb-3" />
              <p className="text-niat-text-secondary font-medium">No pending questions right now</p>
              <p className="text-sm text-niat-text-secondary mt-1">
                Check back later or browse all questions.
              </p>
              <ReviewsLink
                href="/questions"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Browse questions
                <ArrowRight className="h-4 w-4" />
              </ReviewsLink>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingQuestions.map((q) => (
                <PendingQuestionRow key={q.id} question={q} />
              ))}
              <ReviewsLink
                href="/questions?answered=false"
                className="text-sm font-medium text-primary hover:underline mt-1"
              >
                View all unanswered questions →
              </ReviewsLink>
            </div>
          )}
        </section>

        {/* Recent follow-ups on my answers */}
        <section>
          <h2 className="text-lg font-semibold text-niat-text mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Recent follow-ups on your answers
          </h2>
          {recentFollowups.length === 0 ? (
            <div
              className="rounded-2xl border border-niat-border border-dashed p-8 text-center bg-[var(--niat-section)]"
            >
              <MessageCircle className="mx-auto h-10 w-10 text-niat-text-secondary/60 mb-3" />
              <p className="text-niat-text-secondary font-medium">No follow-ups yet</p>
              <p className="text-sm text-niat-text-secondary mt-1">
                When someone replies on a question you answered, it will show here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentFollowups.map((fu, i) => (
                <FollowUpRow
                  key={fu.id ?? `${fu.question_slug}-${i}`}
                  questionSlug={fu.question_slug ?? ""}
                  questionTitle={fu.question_title ?? "Question"}
                  bodyPreview={fu.body ?? ""}
                  createdAt={fu.created_at}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
