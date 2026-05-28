'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from 'lucide-react';
import WriteArticleCTA from '@/components/WriteArticleCTA';
import { useAuthStore } from '@/store/authStore';
import {
  buildExploreLinks,
  buildQaLinks,
  FOOTER_LEGAL_LINKS,
  FOOTER_POLICY_LINKS,
} from '@/lib/footerLinks';

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'X', href: '#', icon: Twitter },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'YouTube', href: '#', icon: Youtube },
] as const;

export interface InsiderFooterProps {
  /** When set (e.g. `/reviews`), Q&A links use this base path. */
  reviewsBasePath?: string;
}

export default function InsiderFooter({ reviewsBasePath = '/reviews' }: InsiderFooterProps) {
  const role = useAuthStore((state) => state.role);
  const exploreLinks = useMemo(() => buildExploreLinks(role), [role]);
  const qaLinks = useMemo(() => buildQaLinks(role, reviewsBasePath), [role, reviewsBasePath]);

  return (
    <footer
      className="mt-auto w-full bg-black text-white pt-10 pb-8 sm:pt-12 sm:pb-10"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/80">
              Have questions or stories to share? Join the NIAT Insider student community.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <WriteArticleCTA
                label="Write Article"
                className="inline-flex items-center rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors"
                disabledClassName="cursor-not-allowed opacity-60"
                subtitleClassName="mt-1 text-[11px] text-white/70"
              />
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10 lg:gap-14 items-start">
          <div className="flex flex-col gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <img src="/niat.svg" alt="NIAT" width={40} height={51} className="h-10 w-auto object-contain" />
              <span className="font-display text-2xl font-bold tracking-tight text-white">NIAT</span>
              <span className="font-display text-xl font-bold tracking-tight text-white/90">Insider</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              Every NIAT campus. Mapped by students. Built to help students make smarter choices.
            </p>
          </div>

          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {exploreLinks.map(({ label, href }) => (
                <li key={href + label}>
                  <Link href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold text-white mb-4">Q&amp;A</h3>
            <ul className="space-y-2.5">
              {qaLinks.map(({ label, href }) => (
                <li key={href + label}>
                  <Link href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-center sm:justify-start gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-white/60 hover:text-white transition-colors p-1"
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </a>
              ))}
            </div>
            <nav
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
              aria-label="Policy links"
            >
              {FOOTER_POLICY_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <nav
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
              aria-label="Legal links"
            >
              {FOOTER_LEGAL_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="mt-6 text-center text-white/40 text-sm">
            Built by NIAT students, for NIAT students. {new Date().getFullYear()}.
          </p>
        </div>
      </div>
    </footer>
  );
}
