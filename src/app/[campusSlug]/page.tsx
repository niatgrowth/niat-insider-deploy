import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { CampusListItem } from '@/types/campusApi';
import CampusPageClient from './CampusPageClient';

type PageProps = {
  params: Promise<{ campusSlug: string }>;
};

const campusMetaMap: Record<
  string,
  {
    title: string;
    description: string;
    canonical: string;
    ogImage?: string;
  }
> = {
  'niat-yenepoya-university': {
    title: 'NIAT at Yenepoya University Mangalore – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Discover NIAT Yenepoya University in Mangalore with student-led insights on hostel life, academics and campus culture. Read reviews and plan your move better.',
    canonical: 'https://www.niatinsider.com/niat-yenepoya-university',
  },
  'niat-vivekananda-global-university': {
    title: 'NIAT at VGU Jaipur – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Explore NIAT Vivekananda Global University Jaipur through real student reviews on campus life, hostels and academics. Compare experiences before you choose.',
    canonical: 'https://www.niatinsider.com/niat-vivekananda-global-university',
  },
  'kkh-niat': {
    title: 'NIAT at Kapil Kavuri Hub Hyderabad – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Read NIAT Kapil Kavuri Hub Hyderabad stories on learning environment, hostel setup and student life. Get practical tips and honest campus perspectives.',
    canonical: 'https://www.niatinsider.com/kkh-niat',
  },
  'niat-chaitanya-university': {
    title: 'NIAT at Chaitanya University Hyderabad – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Explore NIAT Chaitanya University Hyderabad with real student insights on classes, campus life and hostel routines. Make informed decisions with trusted reviews.',
    canonical: 'https://www.niatinsider.com/niat-chaitanya-university',
  },
  'niat-nri-university': {
    title: 'NIAT at NRI University Vijayawada – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Discover NIAT NRI University Vijayawada through student reviews on hostel life, peer culture and academics. Use real experiences to choose your campus confidently.',
    canonical: 'https://www.niatinsider.com/niat-nri-university',
  },
  'niat-sanjay-ghodawat-university': {
    title: 'NIAT at SGU Kolhapur – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Explore NIAT Sanjay Ghodawat University Kolhapur with student-backed stories on hostels, campus life and learning support. Compare and decide with clarity.',
    canonical: 'https://www.niatinsider.com/niat-sanjay-ghodawat-university',
  },
  'niat-nsrit': {
    title: 'NIAT at NSRIT Visakhapatnam – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Read NIAT NSRIT Visakhapatnam student experiences on campus environment, hostels and academics. Get practical guidance before finalizing your NIAT campus.',
    canonical: 'https://www.niatinsider.com/niat-nsrit',
  },
  'niat-malla-reddy-vishwavidyapeeth': {
    title: 'NIAT at MRV Hyderabad – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Discover NIAT Malla Reddy Vishwavidyapeeth Hyderabad with authentic student reviews on hostel life, campus vibe and classroom experience. Start with real insights.',
    canonical: 'https://www.niatinsider.com/niat-malla-reddy-vishwavidyapeeth',
  },
  'niat-annamacharya-university': {
    title: 'NIAT at Annamacharya University Kadapa – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Explore NIAT Annamacharya University Kadapa through student reviews on hostels, academics and day-to-day campus life. Compare options and choose wisely.',
    canonical: 'https://www.niatinsider.com/niat-annamacharya-university',
  },
  'niat-noida-international-university': {
    title: 'NIAT at NIU Noida – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Read NIAT Noida International University insights on hostel quality, campus life and student opportunities. Use honest reviews to plan your NIAT journey.',
    canonical: 'https://www.niatinsider.com/niat-noida-international-university',
  },
  'niat-chalapathi-institute-of-engineering-and-technology': {
    title: 'NIAT at CIET Guntur – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Discover NIAT Chalapathi Institute of Engineering and Technology Guntur through student stories on campus life, hostels and academics. Decide with confidence.',
    canonical: 'https://www.niatinsider.com/niat-chalapathi-institute-of-engineering-and-technology',
  },
  'niat-ajeenkya-dy-patil-university': {
    title: 'NIAT at ADYPU Pune – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Explore NIAT Ajeenkya DY Patil University Pune with student reviews on hostels, clubs and academics. Get actionable insights before selecting your campus.',
    canonical: 'https://www.niatinsider.com/niat-ajeenkya-dy-patil-university',
  },
  'niat-s-vyasa-university': {
    title: 'NIAT at S-VYASA Bengaluru – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Read NIAT S-VYASA Bengaluru campus life reviews with real student perspectives on hostels, studies and opportunities. Compare experiences and plan smarter.',
    canonical: 'https://www.niatinsider.com/niat-s-vyasa-university',
  },
  'niat-amet-university': {
    title: 'NIAT at AMET Chennai – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Discover NIAT AMET University Chennai through student-led reviews on hostel life, academics and campus environment. Find the right fit with trusted guidance.',
    canonical: 'https://www.niatinsider.com/niat-amet-university',
  },
  'niat-bs-abdur-rahman-crescent': {
    title: 'NIAT at Crescent Chennai – Campus Life, Hostel & Reviews | NIAT Insider',
    description: 'Explore NIAT B.S. Abdur Rahman Crescent Chennai with authentic reviews on hostels, student life and academics. Make your campus choice with confidence.',
    canonical: 'https://www.niatinsider.com/niat-bs-abdur-rahman-crescent',
  },
};

const fallbackMeta = {
  title: 'NIAT Campus Life & Reviews | NIAT Insider',
  description: 'Explore NIAT campus life with real student reviews, hostel insights and academic guides on NIAT Insider.',
  canonical: 'https://www.niatinsider.com/campuses',
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { campusSlug } = await params;
  const meta = campusMetaMap[campusSlug] ?? fallbackMeta;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonical,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      siteName: 'NIAT Insider',
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: 'https://www.niatinsider.com/og-default.png',
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['https://www.niatinsider.com/og-default.png'],
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
