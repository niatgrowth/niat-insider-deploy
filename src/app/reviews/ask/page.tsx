'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/toast';
import { Spinner } from '@/components/ui/spinner';
import { FadeIn } from '@/components/ui/fade-in';
import { useReviewsAuth } from '@niat/reviews-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Permissions } from '@/lib/permissions';
import { insiderReviewsClient } from '@/lib/reviews/insiderReviewsClient';
import { reviewsErrorMessage } from '@/lib/reviewsUser';
import type { AuthRole } from '@/store/authStore';

const TITLE_MIN = 10;
const TITLE_MAX = 200;
const BODY_MIN = 20;

export default function AskQuestionPage() {
  const router = useRouter();
  const { user } = useReviewsAuth();
  const role = (user?.role ?? null) as AuthRole;
  const canAsk = Permissions.canAskQuestion(role);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const titleInvalid =
    title.length > 0 && (title.trim().length < TITLE_MIN || title.length > TITLE_MAX);
  const bodyInvalid = body.length > 0 && body.trim().length < BODY_MIN;
  const canSubmit =
    title.trim().length >= TITLE_MIN &&
    title.length <= TITLE_MAX &&
    body.trim().length >= BODY_MIN &&
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
        router.push(`/reviews/questions/${data.slug}`);
        return;
      }

      notify.error(reviewsErrorMessage(data, 'Could not submit your question.'));
    } catch {
      notify.error('Could not submit your question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FadeIn as="main" className="mx-auto max-w-2xl px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Q&amp;A
      </button>

      <h1 className="mb-2 text-2xl font-semibold">Ask a Question</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        NIAT seniors will answer your question based on their real experience.
      </p>

      {!canAsk ? (
        <div
          className="rounded-lg border border-niat-border bg-[var(--niat-section)] px-4 py-6 text-center text-sm text-muted-foreground"
          role="status"
        >
          Only prospective students can ask questions.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ask-title">
              Question title <span className="text-[#991b1b]">*</span>
            </Label>
            <Input
              id="ask-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. What is the fee structure?"
              maxLength={TITLE_MAX}
              aria-invalid={titleInvalid}
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {title.trim().length}/{TITLE_MAX} (min {TITLE_MIN})
              </span>
              {titleInvalid ? (
                <span className="text-destructive">
                  Title must be {TITLE_MIN}–{TITLE_MAX} characters
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ask-body">
              Details <span className="text-[#991b1b]">*</span>
            </Label>
            <Textarea
              id="ask-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add context so seniors can give a helpful answer…"
              rows={6}
              aria-invalid={bodyInvalid}
              required
            />
            {bodyInvalid ? (
              <p className="text-xs text-destructive">At least {BODY_MIN} characters required</p>
            ) : null}
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
      )}
    </FadeIn>
  );
}
