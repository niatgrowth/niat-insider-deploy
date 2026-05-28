import { API_BASE } from '@/lib/apiBase';

type ArticleRow = {
  slug?: string;
  campus_slug?: string | null;
  campus_id?: string | number | null;
  is_global_guide?: boolean;
};

type CampusRow = {
  id?: string | number;
  slug?: string;
};

function nextPageUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const n = (data as { next?: string | null }).next;
  return typeof n === 'string' && n.length > 0 ? n : null;
}

/** Paginated published articles for SSG / sitemap-style iteration. */
async function fetchAllPublishedArticleRows(): Promise<ArticleRow[]> {
  const rows: ArticleRow[] = [];
  let nextUrl: string | null = `${API_BASE}/api/articles/articles/?status=published&page_size=100`;
  while (nextUrl) {
    const res = await fetch(nextUrl, { next: { revalidate: 3600 } });
    if (!res.ok) break;
    const data: { results?: ArticleRow[]; next?: string | null } | ArticleRow[] = await res.json();
    const batch = Array.isArray(data) ? data : (data.results ?? []);
    rows.push(...batch);
    nextUrl = nextPageUrl(data);
  }
  return rows;
}

async function fetchCampusSlugById(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const res = await fetch(`${API_BASE}/api/campuses/`, { next: { revalidate: 86400 } });
  if (!res.ok) return map;
  const data = await res.json();
  const campuses: CampusRow[] = Array.isArray(data) ? data : (data.results ?? []);
  for (const c of campuses) {
    if (c.id != null && c.slug) {
      map.set(String(c.id), c.slug);
    }
  }
  return map;
}

/** `[campusSlug]/article/[articleSlug]` — campus-bound published articles only. */
export async function getCampusArticleStaticParams(): Promise<
  Array<{ campusSlug: string; articleSlug: string }>
> {
  try {
    const [rows, campusSlugById] = await Promise.all([
      fetchAllPublishedArticleRows(),
      fetchCampusSlugById(),
    ]);
    const out: Array<{ campusSlug: string; articleSlug: string }> = [];
    const seen = new Set<string>();
    for (const a of rows) {
      if (!a.slug) continue;
      const campusSlug =
        (a.campus_slug ?? '').trim() ||
        (a.campus_id != null ? (campusSlugById.get(String(a.campus_id)) ?? '') : '');
      const isGlobal = a.is_global_guide === true && !campusSlug;
      if (isGlobal) continue;
      if (!campusSlug) continue;
      const key = `${campusSlug}::${a.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ campusSlug, articleSlug: String(a.slug) });
    }
    return out;
  } catch {
    return [];
  }
}

/** `/article/[slug]` — global guides / articles without campus path. */
export async function getGlobalArticleStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const rows = await fetchAllPublishedArticleRows();
    const out: Array<{ slug: string }> = [];
    const seen = new Set<string>();
    for (const a of rows) {
      if (!a.slug) continue;
      const campusSlug = (a.campus_slug ?? '').trim();
      const isGlobal = a.is_global_guide === true && !campusSlug;
      if (!isGlobal) continue;
      if (seen.has(a.slug)) continue;
      seen.add(a.slug);
      out.push({ slug: String(a.slug) });
    }
    return out;
  } catch {
    return [];
  }
}
