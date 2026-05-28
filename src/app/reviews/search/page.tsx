import { redirect } from 'next/navigation';

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ReviewsSearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const target = q?.trim()
    ? `/reviews/questions?q=${encodeURIComponent(q.trim())}`
    : '/reviews/questions';
  redirect(target);
}
