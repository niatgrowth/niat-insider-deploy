'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useReviewsUi } from '@niat/reviews-ui/context/ReviewsUiContext';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

/** Link with `/reviews` base prefix for legacy niatreviews paths. */
export function ReviewsLink({ href, ...rest }: Props) {
  const { p } = useReviewsUi();
  const target = href.startsWith('/reviews') || href.startsWith('http') ? href : p(href);
  return <Link href={target} {...rest} />;
}
