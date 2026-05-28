import type { Metadata } from 'next'
import { API_BASE } from '@/lib/apiBase'

interface Props { params: Promise<{ campusSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { campusSlug } = await params
  const canonical = `https://www.niatinsider.com/${campusSlug}/clubs`
  try {
    const res = await fetch(
      `${API_BASE}/api/campuses/${campusSlug}/`,
      { next: { revalidate: 3600 }, credentials: 'include' }
    )
    if (!res.ok) throw new Error()
    const campus = await res.json()
    return {
      title: `Clubs at ${campus.name}`,
      description: `Explore all student clubs and communities at ${campus.name}.`,
      alternates: { canonical },
      openGraph: {
        title: `Clubs at ${campus.name}`,
        description: `Explore all student clubs and communities at ${campus.name}.`,
        url: canonical,
        siteName: 'NIAT Insider',
        type: 'website',
        locale: 'en_IN',
        images: [
          {
            url: 'https://www.niatinsider.com/og-default.png',
            width: 1200,
            height: 630,
            alt: `Clubs at ${campus.name}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Clubs at ${campus.name}`,
        description: `Explore all student clubs and communities at ${campus.name}.`,
        images: ['https://www.niatinsider.com/og-default.png'],
      },
    }
  } catch {
    return {
      title: `${campusSlug.replace(/-/g, ' ')} Clubs — NIAT Insider`,
      description: `Explore student clubs and communities in ${campusSlug.replace(/-/g, ' ')} campus.`,
      alternates: { canonical },
      openGraph: {
        title: `${campusSlug.replace(/-/g, ' ')} Clubs — NIAT Insider`,
        description: `Explore student clubs and communities in ${campusSlug.replace(/-/g, ' ')} campus.`,
        url: canonical,
        siteName: 'NIAT Insider',
        type: 'website',
        locale: 'en_IN',
        images: [
          {
            url: 'https://www.niatinsider.com/og-default.png',
            width: 1200,
            height: 630,
            alt: `${campusSlug.replace(/-/g, ' ')} Clubs — NIAT Insider`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${campusSlug.replace(/-/g, ' ')} Clubs — NIAT Insider`,
        description: `Explore student clubs and communities in ${campusSlug.replace(/-/g, ' ')} campus.`,
        images: ['https://www.niatinsider.com/og-default.png'],
      },
    }
  }
}

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
