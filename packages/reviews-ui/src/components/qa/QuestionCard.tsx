"use client";

import { User, CheckCircle, Clock } from "lucide-react";
import { ReviewsLink } from "@niat/reviews-ui/components/ReviewsLink";
import type { Question } from "@niat/reviews-ui/types/question";
import { cn } from "@niat/reviews-ui/lib/utils";

interface QuestionCardProps {
  question: Question;
}

function formatRelativeTime(dateStr: string) {
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

export function QuestionCard({ question }: QuestionCardProps) {
  const answered = question.is_answered ?? question.has_answer;
  const firstAnswer = question.answer ?? question.answers?.[0];
  const answerAuthor = firstAnswer?.author?.username;
  const answerCount = question.answer_count ?? (answered ? 1 : 0);

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-niat-border shadow-card transition-shadow",
        "hover:shadow-soft bg-[var(--niat-section)]"
      )}
    >
      <div className="p-4 sm:p-5 flex flex-col gap-3 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <ReviewsLink href={`/questions/${question.slug}`} className="group block">
              <h2 className="font-semibold text-lg text-niat-text group-hover:text-primary transition-colors line-clamp-2">
                {question.title}
              </h2>
            </ReviewsLink>
          </div>
        </div>

        {question.category && (
          <ReviewsLink
            href={`/questions?category=${encodeURIComponent(question.category)}`}
            className="inline-flex text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md transition-colors w-fit"
          >
            {question.category}
          </ReviewsLink>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-niat-text-secondary">
          <span
            className="inline-flex items-center gap-1 text-niat-text-secondary"
          >
            <User className="h-4 w-4 shrink-0" />
            @{question.author?.username ?? "unknown"}
          </span>
          <span aria-hidden>·</span>
          <time dateTime={question.created_at}>{formatRelativeTime(question.created_at)}</time>
          {answered ? (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                <CheckCircle className="h-3.5 w-3.5" />
                Answered{answerAuthor ? ` by @${answerAuthor}` : ""}
                {answerCount > 1 ? ` and ${answerCount - 1} other${answerCount - 1 === 1 ? "" : "s"}` : ""}
                {firstAnswer?.author?.is_verified_senior && " ✓"}
              </span>
            </>
          ) : (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium">
                <Clock className="h-3.5 w-3.5" />
                Awaiting senior answer
              </span>
            </>
          )}
        </div>

        {answered && firstAnswer?.body && (
          <div className="mt-2 pl-1 border-l-2 border-niat-border">
            <p className="text-sm text-niat-text-secondary line-clamp-3">{firstAnswer.body}</p>
          </div>
        )}
      </div>
    </article>
  );
}
