import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NIAT Student Articles & Reviews | NIAT Insider',
  description: 'Explore NIAT student articles on campus life, academics, internships and placements. Get practical stories and tips to make smarter college decisions.',
  alternates: {
    canonical: 'https://www.niatinsider.com/articles',
  },
  openGraph: {
    title: 'NIAT Student Articles & Reviews | NIAT Insider',
    description: 'Explore NIAT student articles on campus life, academics, internships and placements. Get practical stories and tips to make smarter college decisions.',
    url: 'https://www.niatinsider.com/articles',
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
    title: 'NIAT Student Articles & Reviews | NIAT Insider',
    description: 'Explore NIAT student articles on campus life, academics, internships and placements. Get practical stories and tips to make smarter college decisions.',
    images: ['https://www.niatinsider.com/og-default.png'],
  },
}

export default function ArticlesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
