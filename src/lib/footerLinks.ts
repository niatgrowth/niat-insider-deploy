import { AUTH_ROLES, type AuthRole } from '@/store/authStore';
import { Permissions } from '@/lib/permissions';

export type FooterLink = { label: string; href: string };

const HOW_TO_GUIDES_URL = '/how-to-guides';

/** Leaderboard: hidden for public and intermediate students. */
export function showLeaderboardInFooter(role: AuthRole | null): boolean {
  if (!role) return false;
  return role !== AUTH_ROLES.intermediate;
}

/** Insider explore links (articles, campuses, etc.). */
export function buildExploreLinks(role: AuthRole | null): FooterLink[] {
  const links: FooterLink[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Campuses', href: '/campuses' },
    { label: 'Articles', href: '/articles' },
    { label: 'How-to Guides', href: HOW_TO_GUIDES_URL },
  ];

  if (showLeaderboardInFooter(role)) {
    links.splice(4, 0, { label: 'Leaderboard', href: '/leaderboard' });
  }

  return links;
}

/** Q&A community links; paths are prefixed when `reviewsBasePath` is set. */
export function buildQaLinks(role: AuthRole | null, reviewsBasePath?: string): FooterLink[] {
  const base = reviewsBasePath?.replace(/\/$/, '') ?? '/reviews';

  if (!role) {
    return [{ label: 'Q&A Community', href: base }];
  }

  const links: FooterLink[] = [
    { label: 'Q&A Home', href: base },
    { label: 'Browse Questions', href: `${base}/questions` },
  ];

  if (Permissions.canAskQuestion(role)) {
    links.push({ label: 'Ask a Question', href: `${base}/ask` });
  }

  if (Permissions.canSeeSeniorDashboard(role)) {
    links.push({ label: 'Senior Dashboard', href: `${base}/dashboard` });
  }

  if (role === AUTH_ROLES.verifiedNiat) {
    links.push({ label: 'Senior Onboarding', href: '/onboarding/review' });
  }

  return links;
}

export const FOOTER_POLICY_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Grievance Redressal', href: '/grievance' },
];

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Vision & Values', href: '/vision' },
];
