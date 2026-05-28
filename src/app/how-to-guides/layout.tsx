import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NIAT Student Guides – Placements, Internships, GSoC & More | NIAT Insider',
  description: 'Use NIAT student guides for placements, internships, GSoC prep and career growth. Follow proven steps from real experiences and level up with confidence.',
  alternates: {
    canonical: 'https://www.niatinsider.com/how-to-guides',
  },
  openGraph: {
    title: 'NIAT Student Guides – Placements, Internships, GSoC & More | NIAT Insider',
    description: 'Use NIAT student guides for placements, internships, GSoC prep and career growth. Follow proven steps from real experiences and level up with confidence.',
    url: 'https://www.niatinsider.com/how-to-guides',
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
    title: 'NIAT Student Guides – Placements, Internships, GSoC & More | NIAT Insider',
    description: 'Use NIAT student guides for placements, internships, GSoC prep and career growth. Follow proven steps from real experiences and level up with confidence.',
    images: ['https://www.niatinsider.com/og-default.png'],
  },
}

export default function HowToGuidesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
