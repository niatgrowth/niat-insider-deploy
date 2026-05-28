import type { Metadata } from 'next'
import { API_BASE } from '@/lib/apiBase'

interface Props { params: Promise<{ campusSlug: string; clubId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { campusSlug, clubId } = await params
  const canonical = `https://www.niatinsider.com/${campusSlug}/clubs/${clubId}`
  const campusRes = await fetch(`${API_BASE}/api/campuses/${campusSlug}/`, { next: { revalidate: 3600 }, credentials: 'include' })
  const campus = campusRes.ok ? await campusRes.json() : null
  const campusId = campus?.id
  try {
    const res = await fetch(
      `${API_BASE}/api/articles/clubs/${clubId}/${campusId ? `?campus=${campusId}` : ''}`,
      { next: { revalidate: 3600 }, credentials: 'include' }
    )
    if (!res.ok) throw new Error()
    const club = await res.json()
    const description = club.chapter_description || club.objective || club.about || `Learn about ${club.name} at NIAT.`
    return {
      title: `${club.name} — Club at NIAT`,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${club.name} — Club at NIAT`,
        description,
        url: canonical,
        siteName: 'NIAT Insider',
        type: 'website',
        locale: 'en_IN',
        images: [
          {
            url: 'https://www.niatinsider.com/og-default.png',
            width: 1200,
            height: 630,
            alt: `${club.name} — Club at NIAT`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${club.name} — Club at NIAT`,
        description,
        images: ['https://www.niatinsider.com/og-default.png'],
      },
    }
  } catch {
    return {
      title: `Club at ${campusSlug.replace(/-/g, ' ')} — NIAT Insider`,
      description: `Discover this student club at ${campusSlug.replace(/-/g, ' ')} campus on NIAT Insider.`,
      alternates: { canonical },
      openGraph: {
        title: `Club at ${campusSlug.replace(/-/g, ' ')} — NIAT Insider`,
        description: `Discover this student club at ${campusSlug.replace(/-/g, ' ')} campus on NIAT Insider.`,
        url: canonical,
        siteName: 'NIAT Insider',
        type: 'website',
        locale: 'en_IN',
        images: [
          {
            url: 'https://www.niatinsider.com/og-default.png',
            width: 1200,
            height: 630,
            alt: `Club at ${campusSlug.replace(/-/g, ' ')} — NIAT Insider`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Club at ${campusSlug.replace(/-/g, ' ')} — NIAT Insider`,
        description: `Discover this student club at ${campusSlug.replace(/-/g, ' ')} campus on NIAT Insider.`,
        images: ['https://www.niatinsider.com/og-default.png'],
      },
    }
  }
}

export default function ClubDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
