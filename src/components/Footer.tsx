'use client';

import InsiderFooter, { type InsiderFooterProps } from '@/components/InsiderFooter';

/** Site-wide footer (Insider home, articles, login, etc.). */
export default function Footer(props: Omit<InsiderFooterProps, 'reviewsBasePath'>) {
  return <InsiderFooter reviewsBasePath="/reviews" {...props} />;
}
