/** Base path for reviews inside NIAT Insider (default `/reviews`). */
export type ReviewsPathConfig = {
  base: string;
  login: string;
  insiderHome: string;
};

export function createReviewsPaths(base = '/reviews'): ReviewsPathConfig {
  const b = base.replace(/\/$/, '');
  return {
    base: b,
    login: '/login',
    insiderHome: '/home',
  };
}

export function reviewsPath(config: ReviewsPathConfig, segment = ''): string {
  const seg = segment.startsWith('/') ? segment : segment ? `/${segment}` : '';
  if (!seg || seg === '/') return config.base;
  return `${config.base}${seg}`;
}

/** `/reviews/questions` list (optional query string is not in pathname). */
export function isQuestionsListPath(pathname: string, questionsPath: string): boolean {
  return pathname === questionsPath;
}

/** `/reviews/questions/[slug]` detail view. */
export function isQuestionDetailPath(pathname: string, questionsPath: string): boolean {
  return pathname.startsWith(`${questionsPath}/`);
}

/** Map niatreviews absolute paths to Insider-prefixed paths. */
export function mapLegacyPath(config: ReviewsPathConfig, pathname: string): string {
  if (!pathname || pathname === '/') return config.base;
  const legacy = [
    '/questions',
    '/ask',
    '/search',
    '/dashboard',
    '/notifications',
    '/profile',
  ];
  for (const prefix of legacy) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return reviewsPath(config, pathname);
    }
  }
  return pathname.startsWith(config.base) ? pathname : reviewsPath(config, pathname);
}
