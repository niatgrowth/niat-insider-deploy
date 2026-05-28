/**
 * Auth helpers for reviews UI — backed by ReviewsUiProvider (Insider cookies, not localStorage).
 */
import type { ReviewsPathConfig } from '@niat/reviews-ui/lib/paths';
import { reviewsPath } from '@niat/reviews-ui/lib/paths';

type AuthBridge = {
  isAuthenticated: () => boolean;
  getUsername: () => string | null;
  paths: ReviewsPathConfig;
  loginUrl: (from?: string) => string;
};

let bridge: AuthBridge | null = null;

export function setReviewsAuthBridge(next: AuthBridge | null) {
  bridge = next;
}

export function isAuthenticated(): boolean {
  return bridge?.isAuthenticated() ?? false;
}

export function getStoredUsername(): string | null {
  return bridge?.getUsername() ?? null;
}

export function getLoginUrl(from?: string): string {
  if (bridge) return bridge.loginUrl(from);
  const fromParam = from ? `?from=${encodeURIComponent(from)}` : '';
  return `/login${fromParam}`;
}

/** @deprecated Insider uses platform login only */
export function clearTokens(): void {
  // no-op; Insider logout via provider
}

export function reviewsLink(segment: string): string {
  if (!bridge) return segment;
  return reviewsPath(bridge.paths, segment);
}
