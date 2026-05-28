import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About NIAT Insider – Built by NIAT Students, for NIAT Students',
  description: 'Discover how NIAT Insider helps students with trusted campus reviews, practical guidance and real stories. Join a student-first platform built for better choices.',
  alternates: {
    canonical: 'https://www.niatinsider.com/about',
  },
  openGraph: {
    title: 'About NIAT Insider – Built by NIAT Students, for NIAT Students',
    description: 'Discover how NIAT Insider helps students with trusted campus reviews, practical guidance and real stories. Join a student-first platform built for better choices.',
    url: 'https://www.niatinsider.com/about',
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
    title: 'About NIAT Insider – Built by NIAT Students, for NIAT Students',
    description: 'Discover how NIAT Insider helps students with trusted campus reviews, practical guidance and real stories. Join a student-first platform built for better choices.',
    images: ['https://www.niatinsider.com/og-default.png'],
  },
}

export default function AboutLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
