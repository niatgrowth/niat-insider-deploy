'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { insiderReviewsClient } from '@/lib/reviews/insiderReviewsClient';
import {
  mapPaginatedQuestions,
  type PaginatedQuestionsResponse,
} from '@/lib/reviewsMappers';
import QuestionCard, { type ReviewsQuestionCardData } from '@/components/reviews/QuestionCard';
import EmptyState from '@/components/reviews/EmptyState';
import QuestionListSkeleton from '@/components/reviews/QuestionListSkeleton';
import { Button } from '@/components/ui/button';

export default function BrowseQuestionsTab() {
  const router = useRouter();
  const [questions, setQuestions] = useState<ReviewsQuestionCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = (await insiderReviewsClient.getQuestions({
          answered: 'false',
          page_size: '10',
        })) as PaginatedQuestionsResponse;
        if (cancelled) return;
        const mapped = mapPaginatedQuestions(data);
        setQuestions(mapped.items);
        setNextCursor(mapped.nextCursor);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = (await insiderReviewsClient.getQuestions({
        answered: 'false',
        page_size: '10',
        cursor: nextCursor,
      })) as PaginatedQuestionsResponse;
      const mapped = mapPaginatedQuestions(data);
      setQuestions((prev) => [...prev, ...mapped.items]);
      setNextCursor(mapped.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) return <QuestionListSkeleton />;

  if (questions.length === 0) {
    return (
      <EmptyState
        title="No open questions right now"
        description="Check back later — students are always curious about NIAT."
      />
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          onClick={() => router.push(`/reviews/questions/${q.slug}`)}
        />
      ))}
      {nextCursor ? (
        <div className="flex justify-center pt-2">
          <Button type="button" variant="outline" onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
