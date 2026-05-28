'use client';

import { useRouter } from 'next/navigation';
import QuestionCard, { type ReviewsQuestionCardData } from '@/components/reviews/QuestionCard';
import EmptyState from '@/components/reviews/EmptyState';
import QuestionListSkeleton from '@/components/reviews/QuestionListSkeleton';
import { Button } from '@/components/ui/button';

export interface AnswerListItem {
  question: ReviewsQuestionCardData;
  answerPreview?: string;
}

interface MyAnswersTabProps {
  answers: AnswerListItem[];
  isLoading: boolean;
  onBrowse: () => void;
  nextCursor: string | null;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export default function MyAnswersTab({
  answers,
  isLoading,
  onBrowse,
  nextCursor,
  onLoadMore,
  isLoadingMore,
}: MyAnswersTabProps) {
  const router = useRouter();

  if (isLoading) return <QuestionListSkeleton />;

  if (answers.length === 0) {
    return (
      <EmptyState
        title="No answers yet"
        description="Browse open questions and share your experience"
        actionLabel="Browse Questions"
        onAction={onBrowse}
      />
    );
  }

  return (
    <div className="space-y-4">
      {answers.map(({ question, answerPreview }) => (
        <QuestionCard
          key={question.id}
          question={question}
          showAnswerPreview
          answerPreview={answerPreview}
          onClick={() => router.push(`/reviews/questions/${question.slug}`)}
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
