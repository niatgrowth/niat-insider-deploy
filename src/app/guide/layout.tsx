import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NIAT Campus Life Guide – Student Tips, Hostels & Academics | NIAT Insider',
  description: 'Explore NIAT campus life with practical tips on hostels, academics, clubs and routines. Use this NIAT student guide to adapt quickly and thrive on campus.',
  alternates: {
    canonical: 'https://www.niatinsider.com/guide',
  },
  openGraph: {
    title: 'NIAT Campus Life Guide – Student Tips, Hostels & Academics | NIAT Insider',
    description: 'Explore NIAT campus life with practical tips on hostels, academics, clubs and routines. Use this NIAT student guide to adapt quickly and thrive on campus.',
    url: 'https://www.niatinsider.com/guide',
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
    title: 'NIAT Campus Life Guide – Student Tips, Hostels & Academics | NIAT Insider',
    description: 'Explore NIAT campus life with practical tips on hostels, academics, clubs and routines. Use this NIAT student guide to adapt quickly and thrive on campus.',
    images: ['https://www.niatinsider.com/og-default.png'],
  },
}

export default function GuideLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
