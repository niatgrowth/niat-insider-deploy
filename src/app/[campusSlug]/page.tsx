import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { CampusListItem } from '@/types/campusApi';
import CampusPageClient from './CampusPageClient';

type PageProps = {
  params: Promise<{ campusSlug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { campusSlug } = await params;

  return {
    alternates: {
      canonical: `https://www.niatinsider.com/${campusSlug}`,
    },
  };
}

export default async function CampusPage({ params }: PageProps) {
  const { campusSlug } = await params;

  const campusRes = await fetch(`${API_BASE}/api/campuses/${campusSlug}/`, {
    cache: 'force-cache',
    credentials: 'include',
  });

  if (!campusRes.ok) {
    notFound();
  }

  const campusApi = (await campusRes.json()) as CampusListItem | null;
  if (!campusApi) {
    notFound();
  }

  const [campusesRes, articleCountRes] = await Promise.all([
    fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
      credentials: 'include',
    }),
    fetch(`${API_BASE}/api/articles/articles/?campus=${encodeURIComponent(String(campusApi.id))}`, {
      next: { revalidate: 3600 },
      credentials: 'include',
    }),
  ]);

  const campus = apiCampusToCampus(campusApi);

  const campusesJson = campusesRes.ok ? await campusesRes.json() : [];
  const apiCampuses = (Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? [])) as CampusListItem[];

  const articleCountJson = articleCountRes.ok
    ? await articleCountRes.json() as { count?: number }
    : {};
  const articleCount = articleCountJson.count ?? 0;

  return (
    <CampusPageClient
      campus={campus}
      campusSlug={campusSlug}
      articleCount={articleCount}
      apiCampuses={apiCampuses}
    />
  );
}
