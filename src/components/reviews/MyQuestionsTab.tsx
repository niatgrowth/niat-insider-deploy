'use client';

import { useRouter } from 'next/navigation';
import QuestionCard, { type ReviewsQuestionCardData } from '@/components/reviews/QuestionCard';
import EmptyState from '@/components/reviews/EmptyState';
import QuestionListSkeleton from '@/components/reviews/QuestionListSkeleton';
import { Button } from '@/components/ui/button';

interface MyQuestionsTabProps {
  questions: ReviewsQuestionCardData[];
  isLoading: boolean;
  onAskQuestion: () => void;
  nextCursor: string | null;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export default function MyQuestionsTab({
  questions,
  isLoading,
  onAskQuestion,
  nextCursor,
  onLoadMore,
  isLoadingMore,
}: MyQuestionsTabProps) {
  const router = useRouter();

  if (isLoading) return <QuestionListSkeleton />;

  if (questions.length === 0) {
    return (
      <EmptyState
        title="No questions yet"
        description="Ask your first question to NIAT seniors"
        actionLabel="Ask a Question"
        onAction={onAskQuestion}
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
          <Button
            type="button"
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
