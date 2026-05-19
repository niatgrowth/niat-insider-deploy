"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, PenLine } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import WriteArticleCTA from '@/components/WriteArticleCTA';
import { useCampuses } from '@/hooks/useCampuses';
import { useCategories } from '@/hooks/useCategories';
import { usePublishedArticles } from '@/hooks/useArticles';
import { getCategoryConfig } from '@/data/articleCategories';
import type { ArticlePageArticle } from '@/types';
import type { ApiArticle } from '@/types/articleApi';
import { Spinner } from '@/components/ui/spinner';

function ArticleRow({
  article,
  getCampusSlug,
  categoryLabel,
}: {
  article: ArticlePageArticle;
  getCampusSlug: (id: string | number) => string;
  categoryLabel: string;
}) {
  const config = getCategoryConfig(article.category);
  const articleUrl = article.campusId != null && article.campusId !== ''
    ? `/${getCampusSlug(article.campusId)}/article/${article.slug}`
    : `/article/${article.slug}`;

  return (
    <Link
      href={articleUrl}
      className="flex gap-4 py-4 pl-3 border-l-[3px] border-l-transparent transition-all duration-150 ease-out hover:border-l-[#991b1b]"
    >
      {article.coverImage && (
        <div className="w-24 h-24 md:w-32 md:h-24 shrink-0 rounded-xl overflow-hidden hidden sm:block">
          <ImageWithFallback src={article.coverImage} alt={article.title} loading="lazy" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex flex-wrap gap-2 mb-1">
          <span
            className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-[100px]"
            style={{ backgroundColor: config.bg, color: config.text }}
          >
            {categoryLabel}
          </span>
          <span
            className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-[100px]"
            style={
              article.campusName === 'Global'
                ? { backgroundColor: '#f8fafc', color: '#64748b' }
                : { backgroundColor: '#991b1b', color: 'white' }
            }
          >
            {article.campusName}
          </span>
        </div>
        <h3 className="font-display text-[18px] md:text-[20px] leading-snug font-bold text-[#1e293b] mb-1 cursor-pointer hover:text-[#991b1b] hover:underline transition-colors duration-150">
          {article.title}
        </h3>
        <p className="text-[15px] leading-relaxed text-[#334155] line-clamp-2 mb-2">
          {article.excerpt}
        </p>
        <p className="text-[13px] text-[#64748b]">
          Updated {article.updatedDays} days ago · 👍 {article.upvoteCount} upvotes
        </p>
      </div>
    </Link>
  );
}

function apiArticleToPageArticle(a: ApiArticle): ArticlePageArticle {
  return {
    id: a.id,
    slug: a.slug,
    campusId: a.campus_id,
    campusName: a.campus_name ?? 'Global',
    category: a.category as ArticlePageArticle['category'],
    title: a.title,
    excerpt: a.excerpt,
    coverImage: a.cover_image || undefined,
    updatedDays: a.updated_days,
    upvoteCount: a.upvote_count,
  };
}

export default function ArticlesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryParam = searchParams.get('category');
  const campusParam = searchParams.get('campus');
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const { campuses: apiCampuses } = useCampuses();

  const { categories: apiCategories } = useCategories();
  const apiCategorySlugs = useMemo(() => new Set(apiCategories.map((c) => c.slug)), [apiCategories]);
  const activeCategory = categoryParam && apiCategorySlugs.has(categoryParam) ? categoryParam : null;
  const activeCampusSlug = useMemo(() => {
    if (!campusParam) return null;
    const lowerParam = campusParam.toLowerCase();
    const bySlug = apiCampuses.find(
      (c) =>
        c.slug.toLowerCase() === lowerParam ||
        c.slug.toLowerCase() === `${lowerParam}-niat` ||
        `${c.slug.toLowerCase()}-niat` === lowerParam ||
        c.shortName?.toLowerCase() === lowerParam
    );
    if (bySlug) return bySlug.slug;
    // Backward compatibility for old URLs using campus UUID.
    const byId = apiCampuses.find((c) => String(c.id) === campusParam);
    return byId?.slug ?? null;
  }, [campusParam, apiCampuses]);
  const activeCampusId = useMemo(() => {
    if (!campusParam) return null;
    const lowerParam = campusParam.toLowerCase();
    const bySlug = apiCampuses.find(
      (c) =>
        c.slug.toLowerCase() === lowerParam ||
        c.slug.toLowerCase() === `${lowerParam}-niat` ||
        `${c.slug.toLowerCase()}-niat` === lowerParam ||
        c.shortName?.toLowerCase() === lowerParam
    );
    if (bySlug) return String(bySlug.id);
    const byId = apiCampuses.find((c) => String(c.id) === campusParam);
    return byId ? String(byId.id) : null;
  }, [campusParam, apiCampuses]);
  const validCampusId = activeCampusId ?? undefined;

  const { articles: apiArticles, loading: articlesLoading, error: articlesError, isNetworkError } = usePublishedArticles({
    ...(validCampusId != null && { campus: validCampusId }),
    ...(activeCategory && { category: activeCategory }),
  });
  const { articles: allPublishedArticles } = usePublishedArticles();

  const displayArticles = useMemo(() => {
    let result = apiArticles.map(apiArticleToPageArticle);
    if (activeCategory) result = result.filter((a) => a.category === activeCategory);
    if (validCampusId != null) result = result.filter((a) => String(a.campusId) === validCampusId);
    return [...result].sort((a, b) => b.upvoteCount - a.upvoteCount);
  }, [apiArticles, activeCategory, validCampusId]);

  const filteredArticles = displayArticles;
  const topArticles = useMemo(
    () => [...apiArticles].map(apiArticleToPageArticle).sort((a, b) => b.upvoteCount - a.upvoteCount).slice(0, 5),
    [apiArticles]
  );

  const campusArticleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of allPublishedArticles) {
      const cid = a.campus_id;
      if (cid != null) {
        const key = String(cid);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return counts;
  }, [allPublishedArticles]);

  const setCategory = (slug: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (slug) next.set('category', slug);
    else next.delete('category');
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const setCampus = (slug: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (slug !== null && slug !== '') next.set('campus', slug);
    else next.delete('campus');
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setCampusDropdownOpen(false);
  };
  const getCampusSlug = (id: string | number) => apiCampuses.find((c) => String(c.id) === String(id))?.slug ?? String(id);

  const totalCount = allPublishedArticles.length;
  const campusCount = apiCampuses.length;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1e293b] mb-2">
            All Articles
          </h1>
          <p className="text-[#64748b] mb-4">
            Knowledge written by NIAT students, for NIAT students. Browse by campus or category.
          </p>
          <span className="inline-flex bg-[#f8fafc] text-[#64748b] text-sm px-3 py-1 rounded-full border border-[#94a3b8]">
            {totalCount} articles across {campusCount} campuses
          </span>
        </header>

        <div
          className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-[rgba(30,41,59,0.1)]"
          style={{ backgroundColor: '#fff8eb' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory(null)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${!activeCategory
                    ? 'bg-[#991b1b] text-white'
                    : 'bg-white text-[#1e293b] hover:bg-[#fbf2f3]'
                  }`}
              >
                All
              </button>
              {apiCategories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setCategory(c.slug)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeCategory === c.slug
                      ? 'bg-[#991b1b] text-white'
                      : 'bg-white text-[#1e293b] hover:bg-[#fbf2f3]'
                    }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[rgba(30,41,59,0.1)] rounded-md text-sm font-medium text-[#1e293b] hover:bg-gray-50"
              >
                {activeCampusSlug != null
                  ? apiCampuses.find((c) => c.slug === activeCampusSlug)?.name ?? 'All Campuses'
                  : 'All Campuses'}
                <ChevronDown className="h-4 w-4" />
              </button>
              {campusDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCampusDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 z-50 w-56 bg-white rounded-lg shadow-lg border border-[rgba(30,41,59,0.1)] py-1">
                    <button
                      onClick={() => setCampus(null)}
                      className={`w-full text-left px-4 py-2 text-sm ${activeCampusSlug === null ? 'bg-[#fbf2f3] text-[#991b1b] font-medium' : 'text-[#1e293b] hover:bg-gray-50'
                        }`}
                    >
                      All Campuses
                    </button>
                    {apiCampuses.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCampus(c.slug)}
                        className={`w-full text-left px-4 py-2 text-sm flex justify-between ${activeCampusSlug === c.slug ? 'bg-[#fbf2f3] text-[#991b1b] font-medium' : 'text-[#1e293b] hover:bg-gray-50'
                          }`}
                      >
                        {c.name}
                        <span className="text-[#64748b]">{campusArticleCounts.get(String(c.id)) ?? 0}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-8 pt-8">
          <main className="flex-1 min-w-0">
            <p className="text-sm text-[#64748b] mb-2">
              {activeCategory
                ? `Showing ${filteredArticles.length} articles in ${apiCategories.find((c) => c.slug === activeCategory)?.name ?? getCategoryConfig(activeCategory).label}`
                : `Showing ${filteredArticles.length} articles`}
            </p>
            <div className="border-b border-[rgba(30,41,59,0.08)] mb-0" />

            {articlesLoading ? (
              <div className="py-12 flex items-center justify-center gap-2 text-[#64748b]">
                <Spinner />
              </div>
            ) : articlesError && !isNetworkError ? (
              <div className="py-12 text-center">
                <p className="text-red-600 mb-2">{articlesError}</p>
                <button type="button" onClick={() => window.location.reload()} className="text-[#991b1b] font-medium hover:underline">
                  Try again
                </button>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#64748b] mb-4">
                  No articles found for this filter.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => router.push(pathname)}
                    className="text-[#991b1b] font-medium hover:underline"
                  >
                    → Clear filters
                  </button>
                  <span className="text-[#94a3b8]">or</span>
                  <Link href="/contribute" className="text-[#991b1b] font-medium hover:underline">
                    → Write this article
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="divide-y divide-[rgba(30,41,59,0.08)]">
                  {filteredArticles.map((a: ArticlePageArticle) => (
                    <ArticleRow
                      key={a.id}
                      article={a}
                      getCampusSlug={getCampusSlug}
                      categoryLabel={apiCategories.find((c) => c.slug === a.category)?.name ?? getCategoryConfig(a.category).label}
                    />
                  ))}
                </div>
              </>
            )}
          </main>

          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-lg border border-[rgba(30,41,59,0.1)] p-4 shadow-[0_4px_12px_rgba(30,41,59,0.08)]">
                <h3 className="font-display font-bold text-[#1e293b] mb-3">Top Articles This Week</h3>
                <ul className="space-y-3">
                  {topArticles.map((a: ArticlePageArticle) => {
                    const url = a.campusId != null && a.campusId !== ''
                      ? `/${getCampusSlug(a.campusId)}/article/${a.slug}`
                      : `/article/${a.slug}`;
                    return (
                      <li key={a.id}>
                        <Link
                          href={url}
                          className="block text-sm text-[#1e293b] hover:text-[#991b1b] hover:underline"
                        >
                          {a.title}
                        </Link>
                        <span className="text-xs text-[#64748b]">👍 {a.upvoteCount} upvotes</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-[rgba(30,41,59,0.1)] p-4 shadow-[0_4px_12px_rgba(30,41,59,0.08)]">
                <h3 className="font-display font-bold text-[#1e293b] mb-3">Browse by Campus</h3>
                <ul className="space-y-3">
                  {apiCampuses.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/${c.slug}`}
                        className="block text-sm text-[#1e293b] hover:text-[#991b1b] hover:underline"
                      >
                        {c.name}
                      </Link>
                      <span className="text-xs text-[#64748b]">
                        {campusArticleCounts.get(String(c.id)) ?? 0} articles
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-[rgba(30,41,59,0.1)] p-4 shadow-[0_4px_12px_rgba(30,41,59,0.08)]">
                <h3 className="font-display font-bold text-[#1e293b] mb-2">Missing Something?</h3>
                <p className="text-sm text-[#64748b] mb-3">
                  Can&apos;t find what you need? Write it.
                </p>
                <WriteArticleCTA
                  label="Start Writing"
                  className="inline-flex items-center gap-2 bg-[#991b1b] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#b91c1c] transition-colors"
                  icon={<PenLine className="h-4 w-4" />}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
