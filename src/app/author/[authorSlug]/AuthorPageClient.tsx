"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { ChevronRight, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import FoundingEditorBadge from '@/components/FoundingEditorBadge';
import { useCampuses } from '@/hooks/useCampuses';
import { authorService, type ApiAuthorProfile } from '@/lib/authorService';
import type { ApiArticle } from '@/types/articleApi';
import { Spinner } from '@/components/ui/spinner';

type Props = {
  username: string;
  author: ApiAuthorProfile;
  initialArticles: ApiArticle[];
  initialNext: string | null;
};

export default function AuthorPageClient({ username, author, initialArticles, initialNext }: Props) {
  const { campuses } = useCampuses();
  const [articles, setArticles] = useState<ApiArticle[]>(initialArticles);
  const [next, setNext] = useState<string | null>(initialNext);
  const [loadingMore, setLoadingMore] = useState(false);

  const authorCampusLabel = useMemo(() => {
    if (author.campus_name) return author.campus_name;
    if (author.campus_id) return campuses.find((c) => String(c.id) === String(author.campus_id))?.name ?? 'Global';
    return 'Global';
  }, [author, campuses]);

  const handleLoadMore = async () => {
    if (!next || loadingMore) return;
    setLoadingMore(true);
    try {
      const url = new URL(next);
      const page = url.searchParams.get('page');
      const pageSize = url.searchParams.get('page_size');
      const res = await authorService.getByUsername(username, {
        ...(page ? { page: Number(page) } : {}),
        ...(pageSize ? { page_size: Number(pageSize) } : {}),
      });
      setArticles((prev) => [...prev, ...(res.data.articles || [])]);
      setNext(res.data.next ?? null);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#fbf2f3] flex items-center justify-center text-[#991b1b] text-3xl md:text-4xl font-bold border-2 border-white shadow-sm ring-1 ring-gray-100 uppercase">
              {username.charAt(0)}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{author.username}</h1>
            {/* If this endpoint omits `badge`, this component intentionally renders nothing. */}
            <div className="mb-3">
              <FoundingEditorBadge badge={author.badge ?? null} />
            </div>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 text-gray-600 mb-4">
              <span className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                {authorCampusLabel}
              </span>
              {author.linkedin_profile && (
                <a href={author.linkedin_profile} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-[#0a66c2] hover:underline">
                  <FontAwesomeIcon icon={faLinkedin} style={{ color: 'rgb(52, 101, 216)' }} />
                  LinkedIn
                </a>
              )}
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl italic">
              &quot;Helping fellow students survive and thrive at NIAT campuses.&quot;
            </p>
          </div>
        </header>
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Articles</h2>
            <span className="text-sm text-gray-500">{articles.length} Articles</span>
          </div>
          <div className="divide-y divide-[rgba(30,41,59,0.08)]">
            {articles.map((article) => {
              const articleCampusSlug = campuses.find((c) => String(c.id) === String(article.campus_id))?.slug;
              const articleHref = articleCampusSlug ? `/${articleCampusSlug}/article/${article.slug}` : `/article/${article.slug}`;
              return (
                <Link key={article.id} href={articleHref} className="flex gap-4 py-4 pl-3 border-l-[3px] border-l-transparent transition-all duration-150 ease-out hover:border-l-[#991b1b]">
                  {article.cover_image && (
                    <div className="w-24 h-24 md:w-32 md:h-24 shrink-0 rounded-xl overflow-hidden hidden sm:block">
                      <ImageWithFallback src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-1">
                      <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-[100px] bg-red-50 text-[#991b1b]">{article.category}</span>
                      <span
                        className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-[100px]"
                        style={(article.campus_name || 'Global') === 'Global' ? { backgroundColor: '#f8fafc', color: '#64748b' } : { backgroundColor: '#991b1b', color: 'white' }}
                      >
                        {article.campus_name || 'Global'}
                      </span>
                    </div>
                    <h3 className="font-display text-[18px] md:text-[20px] leading-snug font-bold text-[#1e293b] mb-1 hover:text-[#991b1b] hover:underline transition-colors duration-150">
                      {article.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-[#334155] line-clamp-2 mb-2">{article.excerpt}</p>

                  </div>
                </Link>
              );
            })}
          </div>
          {next && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-900 hover:border-[#991b1b] hover:text-[#991b1b] transition-all disabled:opacity-50"
              >
                {loadingMore ? <Spinner size="sm" className="border-[#1e293b]/20" /> : 'Load more contributions'}
              </button>
            </div>
          )}
        </section>
        <div className="mt-12 p-6 bg-navbar rounded-2xl">
          <h3 className="font-bold text-gray-900 mb-2">Want to help out?</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Join {username} and other students sharing their campus secrets.
          </p>
          <Link href="/contribute" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#991b1b] hover:underline">
            Learn how to contribute <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
