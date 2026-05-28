'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { insiderReviewsClient } from '@/lib/reviews/insiderReviewsClient';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/toast';
import { Spinner } from '@/components/ui/spinner';

const TITLE_MIN = 10;
const TITLE_MAX = 300;

interface AskQuestionFormProps {
  onSuccess: (slug: string) => void;
}

export default function AskQuestionForm({ onSuccess }: AskQuestionFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const titleError =
    title.length > 0 && title.length < TITLE_MIN
      ? `At least ${TITLE_MIN} characters`
      : title.length > TITLE_MAX
        ? `At most ${TITLE_MAX} characters`
        : null;

  const canSubmit =
    title.trim().length >= TITLE_MIN &&
    title.trim().length <= TITLE_MAX &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const data = (await insiderReviewsClient.createQuestion({
        title: title.trim(),
        body: body.trim(),
      })) as { slug?: string; detail?: string };
      if (data.slug) {
        notify.success('Question posted! A senior will answer soon.');
        onSuccess(data.slug);
        return;
      }
      notify.error(
        typeof data.detail === 'string' ? data.detail : 'Could not submit your question.'
      );
    } catch {
      notify.error('Could not submit your question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Ask a Question</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Get answers from verified NIAT seniors.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="ask-title" className="block text-sm font-medium text-foreground">
            Your question <span className="text-[#991b1b]">*</span>
          </label>
          <input
            id="ask-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. What is the fee structure?"
            maxLength={TITLE_MAX}
            className={cn(
              'mt-2 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]/30',
              titleError ? 'border-red-500' : 'border-border'
            )}
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>
              {title.length}/{TITLE_MAX}
            </span>
            {titleError ? <span className="text-red-600">{titleError}</span> : null}
          </div>
        </div>
        <div>
          <label htmlFor="ask-body" className="block text-sm font-medium text-foreground">
            Details (optional)
          </label>
          <textarea
            id="ask-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Add context to help seniors answer better…"
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]/30"
          />
        </div>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="bg-[#991b1b] text-white hover:bg-[#991b1b]/90"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner size="sm" className="border-white/30 border-t-white" />
              Posting…
            </span>
          ) : (
            'Post Question'
          )}
        </Button>
      </form>
    </div>
  );
}
