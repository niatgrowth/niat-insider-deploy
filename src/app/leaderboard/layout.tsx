import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NIAT Insider Leaderboard – Top Student Contributors by Campus',
  description:
    'See NIAT Insider’s top student contributors across campuses by impact and reach. Discover active voices, track rankings and get inspired to contribute.',
  alternates: {
    canonical: 'https://www.niatinsider.com/leaderboard',
  },
  openGraph: {
    title: 'NIAT Insider Leaderboard – Top Student Contributors by Campus',
    description:
      'See NIAT Insider’s top student contributors across campuses by impact and reach. Discover active voices, track rankings and get inspired to contribute.',
    url: 'https://www.niatinsider.com/leaderboard',
    siteName: 'NIAT Insider',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: 'https://www.niatinsider.com/og-default.png',
        width: 1200,
        height: 630,
        alt: 'NIAT Insider',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NIAT Insider Leaderboard – Top Student Contributors by Campus',
    description:
      'See NIAT Insider’s top student contributors across campuses by impact and reach. Discover active voices, track rankings and get inspired to contribute.',
    images: ['https://www.niatinsider.com/og-default.png'],
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

