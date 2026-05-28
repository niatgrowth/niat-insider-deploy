"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useSWR from 'swr';
import { Search, Menu, X, ChevronRight, PenLine, UserCircle, LogOut } from 'lucide-react';
import { logout } from '../lib/authApi';
import { useCampuses } from '../hooks/useCampuses';
import { useCategories } from '../hooks/useCategories';
import { usePublishedArticles } from '../hooks/useArticles';
import { getCategoryConfig } from '../data/articleCategories';
import type { ApiArticle } from '../types/articleApi';
import WriteArticleCTA from './WriteArticleCTA';
import { AUTH_ROLES, WRITE_ENABLED_ROLES, useAuthStore } from '@/store/authStore';
import { isProtectedAppPath } from '@/lib/protectedPaths';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

interface NavbarProps {
  searchQuery?: string;
  showSearch?: boolean;
}

const HOW_TO_GUIDES_LINK = { label: 'How-To Guides', icon: '📘', path: '/how-to-guides' };

export default function Navbar({ searchQuery = '', showSearch }: NavbarProps) {
  const [search, setSearch] = useState(searchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [articlesDropdownOpen, setArticlesDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { campuses: apiCampuses } = useCampuses();
  const { categories: apiCategories } = useCategories();
  const getCampusSlug = (campusId: string) => apiCampuses.find((c) => String(c.id) === campusId)?.slug ?? campusId;
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const niatStatus = useAuthStore((state) => state.niatStatus);
  const hideWriteCtaForRole = role === AUTH_ROLES.niat || role === AUTH_ROLES.intermediate;
  const hideMyArticlesForRole = role === AUTH_ROLES.intermediate;
  const hideLeaderboardForRole = role === AUTH_ROLES.intermediate;
  const isAuthenticated = Boolean(user);
  const authChecked = useAuthStore((state) => state.authChecked);
  const isOnboarded = useAuthStore((state) => state.isOnboarded);
  const onboardingComplete = Boolean(isOnboarded);
  const isOnboardingRoute =
    pathname === '/onboarding' || pathname.startsWith('/onboarding/');
  /** Full app nav only after onboarding; never on /onboarding/* (role may be set before isOnboarded). */
  const showFullNav = isAuthenticated && onboardingComplete && !isOnboardingRoute;
  const showOnboardingNav = isAuthenticated && (!onboardingComplete || isOnboardingRoute);
  const onProtectedRoute = isProtectedAppPath(pathname);
  /** Proxy guarantees a session on these routes; avoid flashing guest links while bootstrap runs. */
  const showGuestNavLinks = !isAuthenticated && (!onProtectedRoute || authChecked);

  const { data: unreadData } = useSWR(
    showFullNav ? '/api/proxy/reviews/notifications/unread' : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        const err = new Error('Failed to load notifications') as Error & { status?: number };
        err.status = res.status;
        throw err;
      }
      return res.json();
    },
    {
      refreshInterval: 120_000,
      revalidateOnFocus: false,
      shouldRetryOnError: (err) => (err as { status?: number }).status !== 401,
      errorRetryCount: 2,
    }
  );
  const unreadCount: number = unreadData?.count ?? unreadData?.unread_count ?? 0;

  const { articles: publishedArticles, loading: recentArticlesLoading } = usePublishedArticles(
    { page_size: 12, ordering: 'updated_at' },
    { enabled: showFullNav && articlesDropdownOpen }
  );

  /** Hero pages that include a large in-page search; hide duplicate navbar search until scrolled. */
  const isHomeWithHeroSearch = pathname === '/home' || pathname === '/';
  const isOnArticles = pathname === '/articles';
  const shouldShowSearch = showFullNav && (!isHomeWithHeroSearch || showSearch === true);
  const shouldShowNavShadow = isHomeWithHeroSearch && showSearch === true;
  const topBannerMessage = !authChecked
    ? null
    : role === AUTH_ROLES.niat
      ? (niatStatus === 'pending'
        ? "Your profile is under review. We'll notify you once a moderator verifies it."
        : null)
      : role === AUTH_ROLES.intermediate
        ? null
        : WRITE_ENABLED_ROLES.includes(role as typeof WRITE_ENABLED_ROLES[number])
          ? 'Submit your article. It gets reviewed, then goes live for the whole community. Be the first to publish.'
          : null;

  const recentlyUpdated = (publishedArticles as ApiArticle[])
    .slice(0, 12)
    .map((a) => ({
      id: String(a.id),
      slug: a.slug,
      title: a.title,
      campusId: a.campus_id != null ? String(a.campus_id) : null,
      campusName: a.campus_name ?? 'Global',
      category: a.category,
      updatedDays: a.updated_days,
    }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setArticlesDropdownOpen(false);
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) setProfileDropdownOpen(false);
    };
    if (articlesDropdownOpen || profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [articlesDropdownOpen, profileDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      router.replace('/');
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {topBannerMessage && (
        <div
          className="bg-[#991b1b] text-white text-center text-xs sm:text-sm font-medium py-2 px-3 sm:px-4"
          role="status"
          aria-live="polite"
        >
          {topBannerMessage}
        </div>
      )}
      <nav
        className={`bg-navbar border-b border-[rgba(30,41,59,0.1)] transition-[box-shadow] duration-300 ease-out ${shouldShowNavShadow ? 'shadow-[0_2px_12px_rgba(30,41,59,0.10)]' : ''
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={isAuthenticated || onProtectedRoute ? '/home' : '/'} className="flex items-center gap-1.5 shrink-0">
              <img
                src="/niat.svg"
                alt="NIAT"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#991b1b]">NIAT</span>
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-black">Insider</span>
            </Link>

            <form
              onSubmit={handleSearch}
              className={`hidden md:flex mx-8 transition-[opacity,transform,width] duration-[250ms] ease-out ${shouldShowSearch
                ? `opacity-100 translate-y-0 flex-1 min-w-0 overflow-visible ${isHomeWithHeroSearch ? 'max-w-[280px]' : 'max-w-md'}`
                : 'opacity-0 -translate-y-1.5 w-0 min-w-0 flex-none overflow-hidden pointer-events-none'
                }`}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campus, topic, or article..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[rgba(30,41,59,0.1)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-transparent"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center flex-wrap justify-end gap-2 lg:gap-4">
              {showOnboardingNav && !showFullNav && (
                <>
                  {!isOnboardingRoute && (
                    <Link
                      href="/onboarding/role"
                      className="text-[#991b1b] hover:text-[#7f1d1d] text-sm font-medium transition-colors"
                    >
                      Complete profile
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-black hover:text-black text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              {showFullNav && (
                <>
                  {!hideLeaderboardForRole && (
                    <Link
                      href="/leaderboard"
                      className={`text-black hover:text-black text-sm font-medium transition-colors ${pathname === '/leaderboard' ? 'text-[#991b1b]' : ''}`}
                    >
                      Leaderboard
                    </Link>
                  )}
                  <Link
                    href="/campuses"
                    className="text-black hover:text-black text-sm font-medium transition-colors"
                  >
                    Campuses
                  </Link>

                  {/* Articles with mega dropdown */}
                  <div
                    ref={dropdownRef}
                    className="relative shrink-0"
                    onMouseEnter={() => setArticlesDropdownOpen(true)}
                    onMouseLeave={() => setArticlesDropdownOpen(false)}
                  >
                    <Link
                      href="/articles"
                      className={`relative inline-flex items-center py-2 text-sm font-medium transition-colors min-w-[4.5rem] ${isOnArticles ? 'text-[#991b1b]' : 'text-black hover:text-black'
                        }`}
                    >
                      Articles
                      {isOnArticles && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#991b1b] rounded-full" aria-hidden />}
                    </Link>
                    {/* Invisible bridge so hover doesn't break between trigger and panel */}
                    {articlesDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full h-1" aria-hidden />
                    )}

                    {/* Mega dropdown */}
                    {articlesDropdownOpen && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-1 w-[min(520px,calc(100vw-2rem))] z-50"
                      >
                        <div
                          className="rounded-xl overflow-hidden border border-[rgba(30,41,59,0.08)] bg-white shadow-lg"
                          style={{ boxShadow: '0 10px 40px rgba(30, 41, 59, 0.15)' }}
                        >
                          <div className="flex flex-col sm:flex-row max-h-[min(70vh,420px)]">
                            {/* Left column - Browse by Category */}
                            <div className="w-full sm:w-[220px] shrink-0 p-4 border-b sm:border-b-0 sm:border-r border-[rgba(30,41,59,0.08)]">
                              <h4 className="font-display text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                                Browse by Category
                              </h4>
                              <ul className="space-y-0.5">
                                {apiCategories.map((c) => {
                                  const style = getCategoryConfig(c.slug);
                                  return (
                                    <li key={c.slug}>
                                      <Link
                                        href={`/articles?category=${c.slug}`}
                                        onClick={() => setArticlesDropdownOpen(false)}
                                        className="flex items-center gap-2 py-2 px-2 -mx-2 rounded-md text-[#1e293b] hover:bg-[#fbf2f3] hover:text-[#991b1b] transition-colors text-sm font-medium"
                                      >
                                        <span>{style.icon}</span>
                                        {c.name}
                                      </Link>
                                    </li>
                                  );
                                })}
                                <li className="border-t border-[rgba(30,41,59,0.08)] mt-2 pt-2">
                                  <Link
                                    href={HOW_TO_GUIDES_LINK.path}
                                    onClick={() => setArticlesDropdownOpen(false)}
                                    className="flex items-center gap-2 py-2 px-2 -mx-2 rounded-md text-[#1e293b] hover:bg-[#fbf2f3] hover:text-[#991b1b] transition-colors text-sm font-medium"
                                  >
                                    <span>{HOW_TO_GUIDES_LINK.icon}</span>
                                    {HOW_TO_GUIDES_LINK.label}
                                  </Link>
                                </li>
                              </ul>
                            </div>

                            {/* Right column - Recently Updated only (scrollable) */}
                            <div className="flex-1 min-w-0 flex flex-col p-4">
                              <h4 className="font-display text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2 shrink-0">
                                Recently Updated
                              </h4>
                              <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 rounded-lg -mx-1 px-1 scroll-smooth">
                                <div className="space-y-1.5">
                                  {recentArticlesLoading && (
                                    <div className="py-2 px-1">
                                      <Spinner size="sm" />
                                    </div>
                                  )}
                                  {!recentArticlesLoading && recentlyUpdated.length === 0 && (
                                    <p className="text-xs text-[#64748b] py-2 px-1">No recent articles yet.</p>
                                  )}
                                  {!recentArticlesLoading && recentlyUpdated.map((a) => {
                                    const config = getCategoryConfig(a.category ?? '');
                                    const categoryLabel = apiCategories.find((c) => c.slug === a.category)?.name ?? config.label;
                                    const campusIdForUrl = a.campusId != null && a.campusId !== '' ? a.campusId : '';
                                    const articleKey = a.slug || a.id;
                                    const url = campusIdForUrl
                                      ? `/${getCampusSlug(campusIdForUrl)}/article/${articleKey}`
                                      : `/article/${articleKey}`;
                                    return (
                                      <Link
                                        key={a.id}
                                        href={url}
                                        onClick={() => setArticlesDropdownOpen(false)}
                                        className="block p-2 rounded-lg hover:bg-[#fbf2f3] transition-colors group"
                                      >
                                        <h5 className="font-display text-sm font-bold text-[#1e293b] line-clamp-1 group-hover:text-[#991b1b]">
                                          {a.title}
                                        </h5>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          <span
                                            className="text-[10px] px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: config.bg, color: config.text }}
                                          >
                                            {categoryLabel}
                                          </span>
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#991b1b] text-white">
                                            {a.campusName}
                                          </span>
                                        </div>
                                        <p className="text-xs text-[#64748b] mt-1">
                                          Updated {a.updatedDays} days ago
                                        </p>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom - Browse all articles */}
                          <div
                            className="px-4 py-3 border-t border-[rgba(30,41,59,0.08)] shrink-0"
                            style={{ backgroundColor: 'rgba(153, 27, 27, 0.04)' }}
                          >
                            <Link
                              href="/articles"
                              onClick={() => setArticlesDropdownOpen(false)}
                              className="inline-flex items-center gap-1 text-[#991b1b] font-medium text-sm hover:underline"
                            >
                              Browse all articles
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/reviews"
                    className={cn(
                      'relative flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary',
                      pathname?.startsWith('/reviews')
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    Q&A
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}
                  </Link>

                  {!hideWriteCtaForRole && (
                    <WriteArticleCTA
                      label="Write Article"
                      className="btn-primary text-sm font-medium inline-flex items-center gap-1.5"
                      icon={<PenLine className="h-4 w-4" />}
                    />
                  )}
                </>
              )}
              {showFullNav && (
                <div ref={profileDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen((o) => !o)}
                    className="flex cursor-pointer items-center gap-1.5 text-black hover:text-black text-sm font-medium transition-colors"
                  >
                    <UserCircle className="h-5 w-5" />
                    Profile
                  </button>
                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 py-1 min-w-[180px] rounded-lg border border-[rgba(30,41,59,0.1)] bg-white shadow-lg z-50"
                      style={{ boxShadow: '0 4px 12px rgba(30,41,59,0.12)' }}
                    >
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#fbf2f3] transition-colors"
                      >
                        <UserCircle className="h-4 w-4" />
                        Profile
                      </Link>
                      {!hideMyArticlesForRole && (
                        <Link
                          href="/my-articles"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#fbf2f3] transition-colors"
                        >
                          <PenLine className="h-4 w-4" />
                          My Articles
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
              {showGuestNavLinks && (
                <>
                  <Link
                    href="/leaderboard"
                    className={`text-black hover:text-black text-sm font-medium transition-colors ${pathname === '/leaderboard' ? 'text-[#991b1b]' : ''}`}
                  >
                    Leaderboard
                  </Link>
                  <Link href="/articles" className="text-black hover:text-black text-sm font-medium transition-colors">
                    Articles
                  </Link>
                  <Link href="/login" className="text-black hover:text-black text-sm font-medium transition-colors">
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-black"
              suppressHydrationWarning
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[rgba(30,41,59,0.1)]">
              {shouldShowSearch && (
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campus, topic, or article..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      suppressHydrationWarning
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[rgba(30,41,59,0.1)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-transparent"
                    />
                  </div>
                </form>
              )}
              <div className="flex flex-col space-y-3">
                {showOnboardingNav && !showFullNav && (
                  <>
                    {!isOnboardingRoute && (
                      <Link
                        href="/onboarding/role"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[#991b1b] font-medium text-sm"
                      >
                        Complete profile
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="text-left text-sm font-medium text-red-700 hover:text-red-800"
                    >
                      Logout
                    </button>
                  </>
                )}
                {showFullNav && (
                  <>
                    {!hideLeaderboardForRole && (
                      <Link
                        href="/leaderboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-black hover:text-black text-sm font-medium"
                      >
                        Leaderboard
                      </Link>
                    )}
                    <Link
                      href="/campuses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-black hover:text-black text-sm font-medium"
                    >
                      Campuses
                    </Link>
                    <Link
                      href="/articles"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-black hover:text-black text-sm font-medium"
                    >
                      Articles
                    </Link>
                    <Link
                      href="/reviews"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2 text-sm font-medium"
                    >
                      <span>Q&A</span>
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    {!hideWriteCtaForRole && (
                      <div onClick={() => setMobileMenuOpen(false)}>
                        <WriteArticleCTA
                          label="Write Article"
                          className="btn-primary text-sm font-medium text-center inline-flex items-center justify-center gap-1.5"
                          icon={<PenLine className="h-4 w-4" />}
                        />
                      </div>
                    )}
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      Profile
                    </Link>
                    {!hideMyArticlesForRole && (
                      <Link href="/my-articles" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                        My Articles
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="text-left text-sm font-medium text-red-700 hover:text-red-800"
                    >
                      Logout
                    </button>
                  </>
                )}
                {showGuestNavLinks && (
                  <>
                    <Link
                      href="/leaderboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-black hover:text-black text-sm font-medium"
                    >
                      Leaderboard
                    </Link>
                    <Link href="/articles" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      Articles
                    </Link>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
