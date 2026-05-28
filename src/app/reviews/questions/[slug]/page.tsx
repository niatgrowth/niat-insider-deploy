'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/toast';
import { useReviewsAuth, useReviewsUi } from '@niat/reviews-ui/context/ReviewsUiContext';
import { Permissions } from '@/lib/permissions';
import { insiderReviewsClient } from '@/lib/reviews/insiderReviewsClient';
import { reviewsErrorMessage } from '@/lib/reviewsUser';
import { formatDate } from '@/lib/utils';
import type { AuthRole } from '@/store/authStore';

interface QuestionAnswer {
  id: string;
  body: string;
  created_at: string;
  author: {
    username: string;
    is_verified_senior?: boolean;
    is_verified_niat_student?: boolean;
  };
}

interface QuestionDetail {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string | null;
  is_answered: boolean;
  upvote_count: number;
  user_vote: number | null;
  vote_count: number;
  created_at: string;
  author: { username: string; id?: string };
  answers: QuestionAnswer[];
}

function mapQuestionDetail(raw: Record<string, unknown>): QuestionDetail | null {
  if (raw.detail && !raw.slug) return null;

  const author = (raw.author as Record<string, unknown>) ?? {};
  const answers = Array.isArray(raw.answers) ? raw.answers : [];
  const userVote = raw.user_vote as number | null | undefined;

  return {
    id: String(raw.id ?? ''),
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    body: String(raw.body ?? ''),
    category: raw.category ? String(raw.category) : null,
    is_answered: Boolean(raw.is_answered),
    upvote_count: Number(raw.upvote_count ?? 0),
    user_vote: userVote ?? null,
    vote_count: Number(raw.upvote_count ?? 0),
    created_at: String(raw.created_at ?? ''),
    author: {
      id: author.id ? String(author.id) : undefined,
      username: String(author.username ?? 'Unknown'),
    },
    answers: answers.map((a) => {
      const row = a as Record<string, unknown>;
      const ansAuthor = (row.author as Record<string, unknown>) ?? {};
      return {
        id: String(row.id ?? ''),
        body: String(row.body ?? ''),
        created_at: String(row.created_at ?? ''),
        author: {
          username: String(ansAuthor.username ?? 'Unknown'),
          is_verified_senior: Boolean(
            ansAuthor.is_verified_senior ?? ansAuthor.is_verified_niat_student
          ),
          is_verified_niat_student: Boolean(ansAuthor.is_verified_niat_student),
        },
      };
    }),
  };
}

async function fetchQuestionBySlug(slug: string): Promise<QuestionDetail | null> {
  const raw = (await insiderReviewsClient.getQuestionDetail(slug)) as unknown as Record<
    string,
    unknown
  >;
  return mapQuestionDetail(raw);
}

function QuestionDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 animate-pulse flex-col space-y-6 px-4 py-8">
      <div className="h-4 w-28 rounded bg-muted" />
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-5 w-24 rounded-full bg-muted" />
      </div>
      <div className="h-8 w-3/4 max-w-lg rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
      <div className="h-3 w-48 rounded bg-muted" />
      <hr className="border-border" />
      <div className="h-5 w-32 rounded bg-muted" />
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-4/5 rounded bg-muted" />
      </div>
      <div className="space-y-3 rounded-lg border p-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-[120px] w-full rounded-md bg-muted" />
        <div className="h-9 w-32 rounded-md bg-muted" />
      </div>
    </div>
  );
}

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { user } = useReviewsAuth();
  const { p } = useReviewsUi();
  const questionsPath = p('/questions');

  const [answerText, setAnswerText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const {
    data: question,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['question', slug],
    queryFn: () => fetchQuestionBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (question) setHasUpvoted(question.user_vote === 1);
  }, [question]);

  const handleUpvote = async () => {
    if (!question || !slug) return;

    const prevUpvoted = hasUpvoted;
    const prevCount = question.vote_count;

    setHasUpvoted(!prevUpvoted);
    queryClient.setQueryData<QuestionDetail>(['question', slug], (q) =>
      q
        ? {
            ...q,
            vote_count: prevUpvoted ? Math.max(0, prevCount - 1) : prevCount + 1,
            user_vote: prevUpvoted ? null : 1,
          }
        : q
    );

    try {
      const data = (await (prevUpvoted
        ? insiderReviewsClient.downvoteQuestion(slug)
        : insiderReviewsClient.upvoteQuestion(slug))) as {
        upvote_count?: number;
        detail?: string;
      };

      if (data.detail) {
        throw new Error(String(data.detail));
      }
      if (typeof data.upvote_count === 'number') {
        queryClient.setQueryData<QuestionDetail>(['question', slug], (q) =>
          q
            ? {
                ...q,
                vote_count: data.upvote_count!,
                upvote_count: data.upvote_count!,
              }
            : q
        );
      }
    } catch {
      setHasUpvoted(prevUpvoted);
      queryClient.setQueryData<QuestionDetail>(['question', slug], (q) =>
        q
          ? {
              ...q,
              vote_count: prevCount,
              user_vote: prevUpvoted ? 1 : null,
            }
          : q
      );
      notify.error('Could not update your vote.');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!slug || answerText.trim().length < 20) return;

    setIsSubmittingAnswer(true);
    try {
      const data = (await insiderReviewsClient.submitAnswer(slug, answerText.trim())) as {
        id?: string;
        detail?: string;
      };

      if (!data.id && data.detail) {
        notify.error(reviewsErrorMessage(data, 'Could not submit your answer.'));
        return;
      }

      setAnswerText('');
      await queryClient.invalidateQueries({ queryKey: ['question', slug] });
      notify.success('Answer submitted! Thanks for helping fellow students.');
    } catch {
      notify.error('Could not submit your answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  if (!slug) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 text-center">
        <p className="text-muted-foreground">Invalid question link.</p>
      </div>
    );
  }

  if (isLoading) {
    return <QuestionDetailSkeleton />;
  }

  if (isError || !question) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 text-center">
        <button
          type="button"
          onClick={() => router.push(questionsPath)}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Questions
        </button>
        <p className="text-muted-foreground">Question not found or could not be loaded.</p>
      </div>
    );
  }

  const answerCount = question.answers?.length ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col space-y-6 px-4 py-8">
      <button
        type="button"
        onClick={() => router.push(questionsPath)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Questions
      </button>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {question.category ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {question.category}
            </span>
          ) : null}
          {question.is_answered ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
              Answered
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              Waiting for answer
            </span>
          )}
        </div>

        <h1 className="text-xl font-semibold">{question.title}</h1>
        <p className="text-sm text-muted-foreground">{question.body}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Asked by {question.author.username}</span>
          <span>{formatDate(question.created_at)}</span>
          <button
            type="button"
            onClick={handleUpvote}
            className={`flex items-center gap-1 hover:text-[#991b1b] ${
              hasUpvoted ? 'font-medium text-[#991b1b]' : ''
            }`}
          >
            ▲ {question.vote_count}
          </button>
        </div>
      </div>

      <hr />

      <div className="space-y-4">
        <h2 className="text-base font-semibold">
          {answerCount === 0
            ? 'No answers yet'
            : `${answerCount} Answer${answerCount !== 1 ? 's' : ''}`}
        </h2>

        {question.answers?.map((answer) => (
          <div key={answer.id} className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#991b1b] text-xs font-medium text-white">
                {answer.author.username[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm font-medium">{answer.author.username}</span>
              {(answer.author.is_verified_senior || answer.author.is_verified_niat_student) && (
                <span className="rounded bg-[#991b1b] px-1.5 py-0.5 text-xs text-white">
                  Senior
                </span>
              )}
            </div>
            <p className="text-sm text-foreground">{answer.body}</p>
            <span className="text-xs text-muted-foreground">{formatDate(answer.created_at)}</span>
          </div>
        ))}
      </div>

      {Permissions.canAnswerQuestion(user?.role as AuthRole) && (
        <div className="space-y-3 rounded-lg border p-4">
          <h3 className="text-sm font-semibold">Your Answer</h3>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Share your experience as a NIAT student..."
            className="min-h-[120px] w-full resize-none rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
          />
          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={isSubmittingAnswer || answerText.trim().length < 20}
            className="rounded-md bg-[#991b1b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7f1d1d] disabled:opacity-50"
          >
            {isSubmittingAnswer ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
}
