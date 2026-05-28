'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { ReviewsApiClient } from '@niat/reviews-ui/lib/api-types';
import { setReviewsApiClient } from '@niat/reviews-ui/lib/api';
import { setReviewsAuthBridge } from '@niat/reviews-ui/lib/auth';
import {
  createReviewsPaths,
  mapLegacyPath,
  reviewsPath,
  type ReviewsPathConfig,
} from '@niat/reviews-ui/lib/paths';

export type ReviewsPersona = 'senior' | 'prospective';

export type ReviewsUiUser = {
  id: string;
  username: string;
  role: string;
  is_verified_senior: boolean;
};

export type ReviewsUiContextValue = {
  persona: ReviewsPersona | null;
  isReady: boolean;
  isAuthenticated: boolean;
  user: ReviewsUiUser | null;
  paths: ReviewsPathConfig;
  api: ReviewsApiClient;
  /** Prefix-aware path builder */
  p: (segment?: string) => string;
  /** Rewrite legacy /questions → /reviews/questions */
  mapPath: (pathname: string) => string;
  loginUrl: (from?: string) => string;
  logout: () => Promise<void>;
  /** Shared site footer (injected from app — see ReviewsFooter). */
  footer: ReactNode | null;
};

const ReviewsUiContext = createContext<ReviewsUiContextValue | null>(null);

function personaFromUser(user: ReviewsUiUser | null): ReviewsPersona | null {
  if (!user) return null;
  if (user.is_verified_senior || user.role === 'verified_niat_student') {
    return 'senior';
  }
  return 'prospective';
}

export type ReviewsUiProviderProps = {
  children: ReactNode;
  basePath?: string;
  api: ReviewsApiClient;
  user: ReviewsUiUser | null;
  /** When true: neutral prospective persona, nav skeleton (isRoleReady false). */
  isLoading?: boolean;
  logout: () => Promise<void>;
  footer?: ReactNode | null;
};

export function ReviewsUiProvider({
  children,
  basePath = '/reviews',
  api,
  user,
  isLoading = false,
  logout,
  footer = null,
}: ReviewsUiProviderProps) {
  const paths = useMemo(() => createReviewsPaths(basePath), [basePath]);

  const p = useCallback((segment?: string) => reviewsPath(paths, segment ?? ''), [paths]);

  const mapPath = useCallback((pathname: string) => mapLegacyPath(paths, pathname), [paths]);

  const loginUrl = useCallback(
    (from?: string) => {
      const target = from ?? (typeof window !== 'undefined' ? window.location.pathname : paths.base);
      return `${paths.login}?from=${encodeURIComponent(target)}`;
    },
    [paths]
  );

  const isRoleReady = !isLoading && Boolean(user);
  const persona: ReviewsPersona | null = isLoading
    ? 'prospective'
    : personaFromUser(user);
  const isAuthenticated = Boolean(user);

  const value = useMemo<ReviewsUiContextValue>(
    () => ({
      persona,
      isReady: isRoleReady,
      isAuthenticated,
      user,
      paths,
      api,
      p,
      mapPath,
      loginUrl,
      logout,
      footer,
    }),
    [persona, isRoleReady, isAuthenticated, user, paths, api, p, mapPath, loginUrl, logout, footer]
  );

  useEffect(() => {
    setReviewsApiClient(api);
    setReviewsAuthBridge({
      isAuthenticated: () => isAuthenticated,
      getUsername: () => user?.username ?? null,
      paths,
      loginUrl,
    });
    return () => {
      setReviewsApiClient(null);
      setReviewsAuthBridge(null);
    };
  }, [api, isAuthenticated, user, paths, loginUrl]);

  return <ReviewsUiContext.Provider value={value}>{children}</ReviewsUiContext.Provider>;
}

/** Match current pathname against a reviews segment (`/questions`, `/ask`, …). */
export function useReviewsRouteMatch(segment: string): boolean {
  const { p } = useReviewsUi();
  const target = p(segment);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function useReviewsUi(): ReviewsUiContextValue {
  const ctx = useContext(ReviewsUiContext);
  if (!ctx) {
    throw new Error('useReviewsUi must be used within ReviewsUiProvider');
  }
  return ctx;
}

/** @deprecated Use useReviewsUi — mirrors niatreviews useAuth persona fields */
export function useReviewsAuth() {
  const { persona, isReady, user, isAuthenticated } = useReviewsUi();
  return {
    role: persona,
    isRoleReady: isReady,
    user,
    isAuthenticated,
  };
}
