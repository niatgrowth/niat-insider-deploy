/**
 * Insider auth uses HttpOnly `access_token` (short-lived) and `refresh_token`.
 * If we only check `access_token`, users with an expired access cookie but a valid
 * refresh cookie look "logged in" in the client (AuthBootstrapper runs refresh) while
 * proxy still treats them as guests — no `/` → `/home` redirect and blocked shells.
 *
 * NOTE: This check is optimistic — it only verifies cookie presence, not validity.
 * A revoked refresh_token will still pass here. The client's ensureRefreshed()
 * will catch the rejection and redirect to /login. This is an acceptable trade-off
 * to avoid adding a blocking network call in proxy.
 */
export function hasInsiderSessionCookiePair(
  accessToken: string | undefined,
  refreshToken: string | undefined
): boolean {
  // Falsy check handles undefined, null coerced, and empty string (no `!== undefined` trap).
  return !!(accessToken || refreshToken);
}
