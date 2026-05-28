import type { MetadataRoute } from 'next'
import { API_BASE } from '../lib/apiBase'
import { getCampusArticleStaticParams, getGlobalArticleStaticParams } from '@/lib/articleStaticParams'

const BASE_URL = 'https://www.niatinsider.com'

type CampusApi = {
  id?: string | number
  slug: string
  updated_at?: string
}

type ArticleApi = {
  slug?: string
  updated_at?: string
}

const safeDate = (value?: string) => (value ? new Date(value) : new Date())

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${BASE_URL}/campuses`, priority: 0.9, changeFrequency: 'weekly', lastModified: new Date() },
    { url: `${BASE_URL}/articles`, priority: 0.85, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${BASE_URL}/how-to-guides`, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date() },
    { url: `${BASE_URL}/guide`, priority: 0.7, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${BASE_URL}/about`, priority: 0.6, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${BASE_URL}/contribute`, priority: 0.5, changeFrequency: 'monthly', lastModified: new Date() },
  ]

  let campusRoutes: MetadataRoute.Sitemap = []
  let articleRoutes: MetadataRoute.Sitemap = []
  const campusUpdatedAtBySlug = new Map<string, string | undefined>()

  try {
    const campusRes = await fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
      credentials: 'include',
    })
    if (campusRes.ok) {
      const data = await campusRes.json()
      const campuses: CampusApi[] = data.results ?? data
      campuses.forEach((c) => {
        if (c.slug) campusUpdatedAtBySlug.set(c.slug, c.updated_at)
      })
      campusRoutes = campuses.map((c) => ({
        url: `${BASE_URL}/${c.slug}`,
        lastModified: safeDate(c.updated_at),
        priority: 0.9,
        changeFrequency: 'weekly' as const,
      }))
    }
  } catch {
    // API unavailable at build time — skip dynamic campus routes
  }

  try {
    const articleUpdatedAtBySlug = new Map<string, string | undefined>()
    const articles: ArticleApi[] = []
    let nextUrl: string | null = `${API_BASE}/api/articles/articles/?status=published&page_size=100`
    while (nextUrl) {
      const articleRes: Response = await fetch(nextUrl, { next: { revalidate: 3600 }, credentials: 'include' })
      if (!articleRes.ok) break
      const data: { results?: ArticleApi[]; next?: string | null } | ArticleApi[] = await articleRes.json()
      const batch: ArticleApi[] = Array.isArray(data) ? data : (data.results ?? [])
      articles.push(...batch)
      for (const article of batch) {
        if (article.slug) {
          articleUpdatedAtBySlug.set(article.slug, article.updated_at)
        }
      }
      nextUrl = !Array.isArray(data) && typeof data.next === 'string' && data.next.length > 0 ? data.next : null
    }

    const campusArticleParams = await getCampusArticleStaticParams()
    const globalArticleParams = await getGlobalArticleStaticParams()

    const campusArticleRoutes: MetadataRoute.Sitemap = campusArticleParams.map((p) => ({
      url: `${BASE_URL}/${encodeURIComponent(p.campusSlug)}/article/${encodeURIComponent(p.articleSlug)}`,
      lastModified: safeDate(
        articleUpdatedAtBySlug.get(p.articleSlug) ?? campusUpdatedAtBySlug.get(p.campusSlug)
      ),
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    }))

    const globalArticleRoutes: MetadataRoute.Sitemap = globalArticleParams.map((p) => ({
      url: `${BASE_URL}/article/${encodeURIComponent(p.slug)}`,
      lastModified: safeDate(articleUpdatedAtBySlug.get(p.slug)),
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    }))

    // Keep only unique, fully resolved published article URLs.
    const deduped = new Map<string, MetadataRoute.Sitemap[number]>()
    for (const route of [...campusArticleRoutes, ...globalArticleRoutes]) {
      deduped.set(route.url, route)
    }
    articleRoutes = Array.from(deduped.values())
  } catch {
    // API unavailable at build time — skip dynamic article routes
  }

  return [
    ...staticRoutes,
    ...campusRoutes,
    ...articleRoutes,
  ]
}
