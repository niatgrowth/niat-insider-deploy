import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import type { CampusListItem } from '@/types/campusApi';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import Footer from '@/components/Footer';
import RelatedArticlesSection from '@/components/RelatedArticlesSection';
import { mergeRelatedArticles } from '@/lib/mergeRelatedArticles';
import { getCampusArticleStaticParams } from '@/lib/articleStaticParams';
import ArticlePageClient from './ArticlePageClient';

type PageProps = {
  params: Promise<{ campusSlug: string; articleSlug: string }>;
};

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getCampusArticleStaticParams();
}

async function getArticleBySlug(articleSlug: string): Promise<ApiArticle | null> {
  const articleRes = await fetch(`${API_BASE}/api/articles/articles/${articleSlug}/`, {
    next: { revalidate: 86400 },
  });
  if (!articleRes.ok) {
    return null;
  }
  return (await articleRes.json()) as ApiArticle | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { campusSlug, articleSlug } = await params;
  const article = await getArticleBySlug(articleSlug);
  const metaTitle = (article as (ApiArticle & { meta_title?: string | null }) | null)?.meta_title;
  const metaDescription = (article as (ApiArticle & { meta_description?: string | null }) | null)?.meta_description;
  const ogImage =
    (article as (ApiArticle & { og_image?: string | null }) | null)?.og_image ||
    article?.cover_image ||
    'https://www.niatinsider.com/og-default.png';
  const title = metaTitle || article?.title || 'NIAT Student Article | NIAT Insider';
  const description = metaDescription || article?.excerpt || 'Read this NIAT student article on NIAT Insider.';
  const canonical = `https://www.niatinsider.com/${campusSlug}/article/${articleSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'NIAT Insider',
      type: 'article',
      locale: 'en_IN',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { campusSlug, articleSlug } = await params;

  const campusRes = await fetch(`${API_BASE}/api/campuses/${campusSlug}/`, {
    next: { revalidate: 86400 },
  });
  if (!campusRes.ok) {
    notFound();
  }
  const campusApi = (await campusRes.json()) as CampusListItem | null;
  if (!campusApi) {
    notFound();
  }

  const article = await getArticleBySlug(articleSlug);
  if (!article) {
    notFound();
  }
  if (!article || !article.campus_id || String(article.campus_id) !== String(campusApi.id)) {
    notFound();
  }

  const categoryQuery =
    article.category_id != null && String(article.category_id).trim() !== ''
      ? `&category_id=${encodeURIComponent(String(article.category_id))}`
      : '';

  const [primaryRes, latestRes, campusesListRes] = await Promise.all([
    fetch(
      `${API_BASE}/api/articles/articles/?status=published&campus=${encodeURIComponent(String(campusApi.id))}${categoryQuery}&page_size=6`,
      { next: { revalidate: 3600 } }
    ),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
    }),
  ]);

  const primaryJson = primaryRes.ok ? ((await primaryRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[]) : [];
  const latestJson = latestRes.ok ? ((await latestRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[]) : [];
  const campusesJson = campusesListRes.ok
    ? ((await campusesListRes.json()) as CampusListItem[] | { results?: CampusListItem[] })
    : [];

  const primaryRelatedArticles = Array.isArray(primaryJson) ? primaryJson : (primaryJson.results ?? []);
  const latestPublishedArticles = Array.isArray(latestJson) ? latestJson : (latestJson.results ?? []);
  const apiCampuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? []);
  const mergedRelated = mergeRelatedArticles(article.slug, primaryRelatedArticles, latestPublishedArticles);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ArticlePageClient
        campusSlug={campusSlug}
        campusName={campusApi.name}
        article={article}
        previewMessage={undefined}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 pb-8 sm:pb-8">
        <RelatedArticlesSection
          articles={mergedRelated}
          mode="campus"
          campusSlug={campusSlug}
          campusName={campusApi.name}
          apiCampuses={apiCampuses}
        />
      </div>
      <Footer />
    </div>
  );
}
