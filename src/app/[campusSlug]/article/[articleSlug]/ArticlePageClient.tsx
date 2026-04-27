"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Clock, Pencil, Trash2, MoreVertical, ThumbsUp, Eye } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Navbar from '@/components/Navbar';
import ImageWithFallback from '@/components/ImageWithFallback';
import { ArticleSuggestionForm } from '@/components/ArticleSuggestionForm';
import { ArticleStructuredData } from '@/components/ArticleStructuredData';
import { CATEGORY_CONFIG } from '@/data/articleCategories';
import { useUpvote } from '@/hooks/useUpvote';
import { articleService } from '@/lib/articleService';
import { getAuthorProfileHrefByUsername } from '@/lib/authorRoute';
import { useAuthStore } from '@/store/authStore';
import type { ApiArticle } from '@/types/articleApi';

function resolveAuthorLinkedIn(article: ApiArticle): string | null {
  const value = (article.author_linkedin_profile || '').trim();
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const handle = value.replace(/^@/, '');
  return `https://www.linkedin.com/in/${handle}`;
}

type Props = {
  campusSlug: string;
  campusName: string;
  article: ApiArticle;
  previewMessage?: string;
};

export default function ArticlePageClient({
  campusSlug,
  campusName,
  article: apiArticle,
  previewMessage,
}: Props) {
  const router = useRouter();
  const article = {
    title: apiArticle.title,
    excerpt: apiArticle.excerpt,
    updatedDays: apiArticle.updated_days,
    upvoteCount: apiArticle.upvote_count,
    viewCount: apiArticle.view_count,
    author: apiArticle.author_username,
    category: apiArticle.category,
    campusName: apiArticle.campus_name,
    coverImage: apiArticle.cover_image || undefined,
    status: apiArticle.status,
    rejectionReason: apiArticle.rejection_reason,
  };
  const authorLinkedIn = useMemo(() => resolveAuthorLinkedIn(apiArticle), [apiArticle]);
  // TODO: switch to profile_slug once this API returns it.
  const authorHref = useMemo(
    () => getAuthorProfileHrefByUsername(apiArticle.author_username),
    [apiArticle.author_username]
  );
  const categoryConfig = CATEGORY_CONFIG[article.category as keyof typeof CATEGORY_CONFIG];
  const articleIdForEngagement = apiArticle.id;
  const { upvoteCount, upvoted, toggle } = useUpvote(articleIdForEngagement);
  const displayUpvoteCount = upvoteCount;
  const [viewIncremented, setViewIncremented] = useState(false);
  const displayViewCount = (article.viewCount ?? 0) + (viewIncremented ? 1 : 0);
  const currentUsername = useAuthStore((state) => state.user?.username ?? null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const key = `viewed_article_${articleIdForEngagement}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      setViewIncremented(true);
      articleService.incrementView(articleIdForEngagement).catch(() => {});
    } catch {
      articleService.incrementView(articleIdForEngagement).catch(() => {});
    }
  }, [articleIdForEngagement]);

  useEffect(() => {
    if (!optionsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) setOptionsOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [optionsOpen]);

  const articleImages = apiArticle.images?.length ? apiArticle.images : (article.coverImage ? [article.coverImage] : []);
  const hasMultipleImages = articleImages.length > 1;
  const isAuthor = currentUsername && apiArticle.author_username === currentUsername;

  const handleDeleteArticle = () => {
    if (deleteLoading) return;
    setDeleteLoading(true);
    articleService
      .delete(apiArticle.id)
      .then(() => {
        setDeleteConfirmOpen(false);
        router.push(`/${campusSlug}`);
      })
      .finally(() => setDeleteLoading(false));
  };

  return (
    <>
      <ArticleStructuredData
        title={article.title}
        description={article.excerpt}
        authorUsername={article.author}
        publishedAt={apiArticle.published_at ?? null}
        coverImage={article.coverImage}
        slug={apiArticle.slug}
        isGlobalRoute={false}
      />
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0">
        <nav className="flex items-center text-black text-sm mb-6 flex-wrap gap-1">
          <Link href="/" className="hover:text-[#991b1b]">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href={`/${campusSlug}`} className="hover:text-[#991b1b]">{campusName}</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="truncate max-w-xs" style={{ color: categoryConfig?.text ?? '#991b1b' }}>
            {categoryConfig?.label ?? 'Article'}
          </span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-black truncate max-w-xs">{article.title}</span>
        </nav>

        {previewMessage && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {previewMessage}
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="font-display text-2xl md:text-4xl font-bold text-black min-w-0 flex-1">{article.title}</h1>
          {isAuthor && (
            <div className="relative shrink-0" ref={optionsRef}>
              <button type="button" onClick={() => setOptionsOpen((v) => !v)} className="p-2 rounded-lg text-[#64748b] hover:bg-[rgba(30,41,59,0.08)] hover:text-[#1e293b] transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
              {optionsOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 min-w-[180px] rounded-lg bg-white border shadow-lg z-10" style={{ borderColor: 'rgba(30,41,59,0.12)' }}>
                  <Link href={`/contribute/write?edit=${apiArticle.id}`} className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-[#1e293b] hover:bg-[#fbf2f3]">
                    <Pencil className="h-4 w-4 text-[#991b1b]" />
                    Edit article
                  </Link>
                  <button type="button" onClick={() => setDeleteConfirmOpen(true)} className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                    Delete article
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {articleImages.length > 0 && (
          <div className="w-full mb-6 rounded-xl overflow-hidden bg-[rgba(30,41,59,0.06)]">
            {hasMultipleImages ? (
              <div className="relative">
                <div className="flex items-center justify-center min-h-[200px] max-h-[70vh]">
                  <ImageWithFallback key={carouselIndex} src={articleImages[carouselIndex]} alt={`${article.title} — image ${carouselIndex + 1}`} className="max-w-full max-h-[70vh] w-auto h-auto object-contain" />
                </div>
                <button type="button" suppressHydrationWarning onClick={() => setCarouselIndex((i) => (i === 0 ? articleImages.length - 1 : i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" suppressHydrationWarning onClick={() => setCarouselIndex((i) => (i === articleImages.length - 1 ? 0 : i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"><ChevronRight className="h-5 w-5" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[240px] md:min-h-[320px] max-h-[70vh]">
                <ImageWithFallback src={articleImages[0]} alt={article.title} className="max-w-full max-h-[70vh] w-auto h-auto object-contain" />
              </div>
            )}
          </div>
        )}

        {apiArticle.body ? (
          <div
            className="article-body-read-only prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: apiArticle.body }}
          />
        ) : (
          <div className="article-body-read-only prose prose-lg max-w-none mb-8"><p className="text-black leading-relaxed">{article.excerpt}</p></div>
        )}

        <div className="text-sm text-black mb-6 pb-6 border-t border-[rgba(30,41,59,0.1)] pt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>Written by <Link href={authorHref} className="font-medium text-[#991b1b] hover:underline">{article.author}</Link></span>
            {authorLinkedIn && <a href={authorLinkedIn} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0a66c2] hover:underline"><FontAwesomeIcon icon={faLinkedin} style={{ color: 'rgb(52, 101, 216)' }} />LinkedIn</a>}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />Last updated {article.updatedDays} days ago</span>
            <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{displayUpvoteCount} upvote{displayUpvoteCount !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{displayViewCount} view{displayViewCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {currentUsername != null && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button type="button" onClick={toggle} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${upvoted ? 'bg-[#991b1b] border-[#991b1b] text-white' : 'border-[#991b1b] text-[#991b1b] hover:bg-[#fbf2f3]'}`}>
              <ThumbsUp className="h-4 w-4" />
              {upvoted ? 'Upvoted' : 'Upvote'}
            </button>
            <ArticleSuggestionForm articleId={articleIdForEngagement} onSubmit={(payload) => articleService.submitSuggestion(articleIdForEngagement, payload).then(() => undefined)} />
          </div>
        )}
      </div>

      {deleteConfirmOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => !deleteLoading && setDeleteConfirmOpen(false)} aria-hidden />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 p-6 rounded-xl bg-white shadow-xl">
            <h3 className="font-display text-lg font-bold text-black mb-2">Delete this article?</h3>
            <p className="text-sm text-black/80 mb-6">This cannot be undone. The article will be permanently removed.</p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => !deleteLoading && setDeleteConfirmOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-black hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleDeleteArticle} disabled={deleteLoading} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">{deleteLoading ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
