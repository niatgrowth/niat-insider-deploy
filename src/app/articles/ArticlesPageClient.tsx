"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, PenLine } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import WriteArticleCTA from '@/components/WriteArticleCTA';
import { getCategoryConfig } from '@/data/articleCategories';
import { API_BASE } from '@/lib/apiBase';
import type { ApiCategory } from '@/lib/articleService';
import type { ArticlePageArticle } from '@/types';
import type { ApiArticle } from '@/types/articleApi';
import type { CampusListItem } from '@/types/campusApi';
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
  const coverImage = a.cover_image
    ? (a.cover_image.startsWith('http://') || a.cover_image.startsWith('https://')
      ? a.cover_image
      : `${API_BASE}${a.cover_image.startsWith('/') ? a.cover_image : `/${a.cover_image}`}`)
    : undefined;

  return {
    id: a.id,
    slug: a.slug,
    campusId: a.campus_id,
    campusName: a.campus_name ?? 'Global',
    category: a.category as ArticlePageArticle['category'],
    title: a.title,
    excerpt: a.excerpt,
    coverImage,
    updatedDays: a.updated_days,
    upvoteCount: a.upvote_count,
  };
}

type Props = {
  initialArticles: ApiArticle[];
  initialNext: string | null;
  initialCount?: number;
  categories: ApiCategory[];
  campuses: CampusListItem[];
};

function toSameOriginArticlesUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith('/api/articles/articles')) return raw;
  if (raw.startsWith('/')) return raw;
  try {
    const parsed = new URL(raw);
    return `/api/articles/articles${parsed.search}`;
  } catch {
    return null;
  }
}

export default function ArticlesPageClient({ initialArticles, initialNext, initialCount, categories, campuses }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryParam = searchParams.get('category');
  const campusParam = searchParams.get('campus');
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [allArticles, setAllArticles] = useState<ApiArticle[]>(initialArticles);
  const [next, setNext] = useState<string | null>(toSameOriginArticlesUrl(initialNext));
  const [totalCount, setTotalCount] = useState<number>(initialCount ?? initialArticles.length);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const apiCategorySlugs = useMemo(() => new Set(categories.map((c) => c.slug)), [categories]);
  const activeCategory = categoryParam && apiCategorySlugs.has(categoryParam) ? categoryParam : null;

  const activeCampusSlug = useMemo(() => {
    if (!campusParam) return null;
    const bySlug = campuses.find((c) => c.slug === campusParam);
    if (bySlug) return bySlug.slug;
    const byId = campuses.find((c) => String(c.id) === campusParam);
    return byId?.slug ?? null;
  }, [campusParam, campuses]);

  const activeCampusId = useMemo(() => {
    if (!campusParam) return null;
    const bySlug = campuses.find((c) => c.slug === campusParam);
    if (bySlug) return String(bySlug.id);
    const byId = campuses.find((c) => String(c.id) === campusParam);
    return byId ? String(byId.id) : null;
  }, [campusParam, campuses]);

  const validCampusId = activeCampusId ?? undefined;

  const displayArticles = useMemo(() => {
    let result = allArticles.map(apiArticleToPageArticle);
    if (activeCategory) result = result.filter((a) => a.category === activeCategory);
    if (validCampusId != null) result = result.filter((a) => String(a.campusId) === validCampusId);
    return [...result].sort((a, b) => b.upvoteCount - a.upvoteCount);
  }, [allArticles, activeCategory, validCampusId]);

  const topArticles = useMemo(
    () => [...allArticles].map(apiArticleToPageArticle).sort((a, b) => b.upvoteCount - a.upvoteCount).slice(0, 5),
    [allArticles]
  );

  const campusArticleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of allArticles) {
      const cid = a.campus_id;
      if (cid != null) {
        const key = String(cid);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return counts;
  }, [allArticles]);

  const setCategory = (slug: string | null) => {
    const nextQuery = new URLSearchParams(searchParams.toString());
    if (slug) nextQuery.set('category', slug);
    else nextQuery.delete('category');
    const qs = nextQuery.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const setCampus = (slug: string | null) => {
    const nextQuery = new URLSearchParams(searchParams.toString());
    if (slug !== null && slug !== '') nextQuery.set('campus', slug);
    else nextQuery.delete('campus');
    const qs = nextQuery.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setCampusDropdownOpen(false);
  };

  const getCampusSlug = (id: string | number) => campuses.find((c) => String(c.id) === String(id))?.slug ?? String(id);
  const campusCount = campuses.length;

  const loadMore = useCallback(async () => {
    if (!next || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const safeNextUrl = toSameOriginArticlesUrl(next);
      if (!safeNextUrl) {
        setLoadMoreError('Pagination link is invalid. Please refresh the page.');
        return;
      }
      const res = await fetch(safeNextUrl, { cache: 'no-store', credentials: 'include' });
      if (!res.ok) {
        setLoadMoreError('Failed to load more articles. Retrying may help.');
        return;
      }
      const data = (await res.json()) as { results?: ApiArticle[]; next?: string | null; count?: number } | ApiArticle[];
      const newArticles = Array.isArray(data) ? data : (data.results ?? []);
      const nextCursor = Array.isArray(data) ? null : toSameOriginArticlesUrl(data.next ?? null);
      if (!Array.isArray(data) && typeof data.count === 'number') {
        setTotalCount(data.count);
      }
      setAllArticles((prev) => {
        const seen = new Set(prev.map((a) => String(a.id)));
        const dedupedIncoming = newArticles.filter((a) => !seen.has(String(a.id)));
        return dedupedIncoming.length ? [...prev, ...dedupedIncoming] : prev;
      });
      setNext(nextCursor);
    } catch {
      setLoadMoreError('Failed to load more articles. Check your connection and retry.');
    } finally {
      setLoadingMore(false);
    }
  }, [next, loadingMore]);

  useEffect(() => {
    const node = loadMoreTriggerRef.current;
    if (!node || !next) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !loadingMore) {
          void loadMore();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [next, loadingMore, loadMore]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1e293b] mb-2">All Articles</h1>
          <p className="text-[#64748b] mb-4">
            Knowledge written by NIAT students, for NIAT students. Browse by campus or category.
          </p>
          <span className="inline-flex bg-[#f8fafc] text-[#64748b] text-sm px-3 py-1 rounded-full border border-[#94a3b8]">
            {totalCount} articles across {campusCount} campuses
          </span>
        </header>

        <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-[rgba(30,41,59,0.1)]" style={{ backgroundColor: '#fff8eb' }}>
          <div className="flex flex-col gap-3">
            <div className="relative w-full sm:w-fit">
              <button
                onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
                suppressHydrationWarning
                className="flex w-full sm:w-auto items-center justify-between gap-2 px-4 py-2 bg-white border border-[rgba(30,41,59,0.1)] rounded-md text-sm font-medium text-[#1e293b] hover:bg-gray-50"
              >
                {activeCampusSlug != null ? campuses.find((c) => c.slug === activeCampusSlug)?.name ?? 'All Campuses' : 'All Campuses'}
                <ChevronDown className="h-4 w-4 shrink-0" />
              </button>
              {campusDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCampusDropdownOpen(false)} />
                  <div className="absolute left-0 mt-1 z-50 w-[min(22rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain bg-white rounded-lg shadow-lg border border-[rgba(30,41,59,0.1)] py-1">
                    <button
                      onClick={() => setCampus(null)}
                      className={`w-full text-left px-4 py-2 text-sm ${activeCampusSlug === null ? 'bg-[#fbf2f3] text-[#991b1b] font-medium' : 'text-[#1e293b] hover:bg-gray-50'}`}
                    >
                      All Campuses
                    </button>
                    {campuses.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCampus(c.slug)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-start justify-between gap-3 ${activeCampusSlug === c.slug ? 'bg-[#fbf2f3] text-[#991b1b] font-medium' : 'text-[#1e293b] hover:bg-gray-50'}`}
                      >
                        <span className="min-w-0 break-words">{c.name}</span>
                        <span className="text-[#64748b] shrink-0">{campusArticleCounts.get(String(c.id)) ?? 0}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="-mx-1 overflow-x-auto px-1">
              <div className="flex min-w-max sm:min-w-0 sm:flex-wrap gap-2">
                <button onClick={() => setCategory(null)} suppressHydrationWarning className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${!activeCategory ? 'bg-[#991b1b] text-white' : 'bg-white text-[#1e293b] hover:bg-[#fbf2f3]'}`}>
                  All
                </button>
                {categories.map((c) => (
                  <button key={c.slug} onClick={() => setCategory(c.slug)} suppressHydrationWarning className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeCategory === c.slug ? 'bg-[#991b1b] text-white' : 'bg-white text-[#1e293b] hover:bg-[#fbf2f3]'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8 pt-8">
          <main className="flex-1 min-w-0">
            <p className="text-sm text-[#64748b] mb-2">
              {activeCategory
                ? `Showing ${displayArticles.length} articles in ${categories.find((c) => c.slug === activeCategory)?.name ?? getCategoryConfig(activeCategory).label}`
                : `Showing ${displayArticles.length} articles`}
            </p>
            <div className="border-b border-[rgba(30,41,59,0.08)] mb-0" />

            {displayArticles.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#64748b] mb-4">No articles found for this filter.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={() => router.push(pathname)} className="text-[#991b1b] font-medium hover:underline">→ Clear filters</button>
                  <span className="text-[#94a3b8]">or</span>
                  <Link href="/contribute" className="text-[#991b1b] font-medium hover:underline">→ Write this article</Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(30,41,59,0.08)]">
                {displayArticles.map((a: ArticlePageArticle) => (
                  <ArticleRow
                    key={a.id}
                    article={a}
                    getCampusSlug={getCampusSlug}
                    categoryLabel={categories.find((c) => c.slug === a.category)?.name ?? getCategoryConfig(a.category).label}
                  />
                ))}
              </div>
            )}

            <div ref={loadMoreTriggerRef} className="h-1 w-full" aria-hidden />
            {next && (
              <div className="pt-6 text-sm text-[#64748b]">
                {loadingMore ? (
                  <div className="inline-flex items-center gap-2">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  'Scroll to load more articles'
                )}
              </div>
            )}
            {!next && allArticles.length > 0 && (
              <div className="pt-6 text-sm text-[#64748b]">You&apos;ve reached the end.</div>
            )}
            {loadMoreError && (
              <div className="pt-4">
                <p className="text-sm text-red-600 mb-2">{loadMoreError}</p>
                {next && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-lg border border-[rgba(30,41,59,0.12)] px-4 py-2 text-sm font-medium text-[#1e293b] hover:bg-[#fbf2f3] disabled:opacity-60"
                  >
                    {loadingMore ? <Spinner size="sm" className="border-[#1e293b]/20" /> : 'Retry'}
                  </button>
                )}
              </div>
            )}
          </main>

          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-lg border border-[rgba(30,41,59,0.1)] p-4 shadow-[0_4px_12px_rgba(30,41,59,0.08)]">
                <h3 className="font-display font-bold text-[#1e293b] mb-3">Top Articles This Week</h3>
                <ul className="space-y-3">
                  {topArticles.map((a: ArticlePageArticle) => {
                    const url = a.campusId != null && a.campusId !== '' ? `/${getCampusSlug(a.campusId)}/article/${a.slug}` : `/article/${a.slug}`;
                    return (
                      <li key={a.id}>
                        <Link href={url} className="block text-sm text-[#1e293b] hover:text-[#991b1b] hover:underline">
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
                  {campuses.map((c) => (
                    <li key={c.id}>
                      <Link href={`/${c.slug}`} className="block text-sm text-[#1e293b] hover:text-[#991b1b] hover:underline">
                        {c.name}
                      </Link>
                      <span className="text-xs text-[#64748b]">{campusArticleCounts.get(String(c.id)) ?? 0} articles</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg border border-[rgba(30,41,59,0.1)] p-4 shadow-[0_4px_12px_rgba(30,41,59,0.08)]">
                <h3 className="font-display font-bold text-[#1e293b] mb-2">Missing Something?</h3>
                <p className="text-sm text-[#64748b] mb-3">Can&apos;t find what you need? Write it.</p>
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
