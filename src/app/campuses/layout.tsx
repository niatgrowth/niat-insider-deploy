import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All NIAT Campuses 2025 – Compare Universities, Locations & Reviews | NIAT Insider',
  description: 'Compare all NIAT campuses by university, city, hostel life and student experiences. Find the right fit faster with trusted NIAT campus reviews and guides.',
  alternates: {
    canonical: 'https://www.niatinsider.com/campuses',
  },
  openGraph: {
    title: 'All NIAT Campuses 2025 – Compare Universities, Locations & Reviews | NIAT Insider',
    description: 'Compare all NIAT campuses by university, city, hostel life and student experiences. Find the right fit faster with trusted NIAT campus reviews and guides.',
    url: 'https://www.niatinsider.com/campuses',
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
    title: 'All NIAT Campuses 2025 – Compare Universities, Locations & Reviews | NIAT Insider',
    description: 'Compare all NIAT campuses by university, city, hostel life and student experiences. Find the right fit faster with trusted NIAT campus reviews and guides.',
    images: ['https://www.niatinsider.com/og-default.png'],
  },
}

export default function CampusesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
