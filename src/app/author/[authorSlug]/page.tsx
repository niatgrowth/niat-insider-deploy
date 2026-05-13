import { notFound } from 'next/navigation';
import type { AuthorArticlesResponse, ApiAuthorProfile } from '@/lib/authorService';
import { API_BASE } from '@/lib/apiBase';
import AuthorPageClient from '@/app/author/[authorSlug]/AuthorPageClient';

type PageProps = {
  params: Promise<{ authorSlug: string }>;
};

export const dynamicParams = true;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AuthorPage({ params }: PageProps) {
  const { authorSlug } = await params;
  const decoded = decodeURIComponent(authorSlug);

  // 1. Try fetching the actual author profile
  let authorRes = await fetch(
    `${API_BASE}/api/authors/slug/${encodeURIComponent(decoded)}/?page_size=12`,
    { cache: 'no-store' }
  );

  if (!authorRes.ok) {
    authorRes = await fetch(
      `${API_BASE}/api/authors/${encodeURIComponent(decoded)}/`,
      { cache: 'no-store' }
    );
  }

  let authorPayload = authorRes.ok ? ((await authorRes.json()) as AuthorArticlesResponse) : null;

  // 2. Fallback logic: If author is not found, check if they have published articles
  if (!authorPayload) {
    const articlesRes = await fetch(
      `${API_BASE}/api/articles/articles/?status=published&author_username=${encodeURIComponent(decoded)}&page_size=12`,
      { cache: 'no-store' }
    );

    if (articlesRes.ok) {
      const articlesData = await articlesRes.json();
      const results = Array.isArray(articlesData) ? articlesData : (articlesData.results || []);
      
      if (results.length > 0) {
        const sample = results[0];
        authorPayload = {
          author: {
            id: `fallback:${decoded}`,
            username: decoded,
            role: 'niat_student',
            is_verified_senior: false,
            follower_count: 0,
            is_followed_by_me: null,
            linkedin_profile: sample.author_linkedin_profile ?? '',
            campus_id: sample.campus_id ?? null,
            campus_name: sample.campus_name ?? 'Global',
            year_joined: null,
          },
          count: articlesData.count || results.length,
          next: articlesData.next || null,
          previous: articlesData.previous || null,
          articles: results
        };
      }
    }
  }

  if (!authorPayload || !authorPayload.author) {
    notFound();
  }

  const author = authorPayload.author;
  const authorArticles = Array.isArray(authorPayload.articles) ? authorPayload.articles : [];

  return (
    <AuthorPageClient
      username={author.username}
      author={author}
      initialArticles={authorArticles}
      initialNext={authorPayload.next ?? null}
    />
  );
}
