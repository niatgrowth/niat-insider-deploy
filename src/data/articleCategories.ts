import type { ArticleCategory } from '../types';

export const CATEGORY_CONFIG: Record<
  ArticleCategory,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  'campus-life': {
    label: 'Campus Life',
    icon: '🏠',
    bg: '#f3f0ff',
    text: '#7678ed',
    border: '#7678ed',
  },
  experiences: {
    label: 'Experiences',
    icon: '💼',
    bg: '#fff7ed',
    text: '#f18701',
    border: '#f18701',
  },
  academics: {
    label: 'Academics',
    icon: '📚',
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#15803d',
  },
  howto: {
    label: 'How-To Guides',
    icon: '📖',
    bg: '#f0f9ff',
    text: '#0369a1',
    border: '#0369a1',
  },
};

export const CATEGORY_ORDER: ArticleCategory[] = [
  'campus-life',
  'experiences',
  'academics',
  'howto',
];

/** Backend category slugs (articles API) may differ from frontend; map to display config. */
const BACKEND_CATEGORY_LABELS: Record<string, string> = {
  'onboarding-kit': 'Onboarding Kit',
  '30-days-at-niat': '30 Days at NIAT',
  '30-days': '30 Days at NIAT',
  'survival-food': 'Survival & Food',
  'club-directory': 'Club Directory',
  'career-wins': 'Career & Wins',
  'local-travel': 'Local Travel',
  'amenities': 'Amenities',
};

const DEFAULT_CATEGORY_STYLE = { label: 'Article', icon: '📄', bg: '#f1f5f9', text: '#475569', border: '#94a3b8' };

export function getCategoryConfig(slug: string): { label: string; icon: string; bg: string; text: string; border: string } {
  const frontend = CATEGORY_CONFIG[slug as ArticleCategory];
  if (frontend) return frontend;
  const label = BACKEND_CATEGORY_LABELS[slug] ?? slug;
  return { ...DEFAULT_CATEGORY_STYLE, label };
}

/** Map backend category slug to frontend filter category for Articles page. */
export function backendCategoryToFrontend(backendSlug: string): ArticleCategory | null {
  const map: Record<string, ArticleCategory> = {
    'onboarding-kit': 'campus-life',
    '30-days-at-niat': 'campus-life',
    '30-days': 'campus-life',
    'survival-food': 'campus-life',
    'club-directory': 'campus-life',
    'local-travel': 'campus-life',
    'amenities': 'campus-life',
    'career-wins': 'experiences',
  };
  return map[backendSlug] ?? null;
}
