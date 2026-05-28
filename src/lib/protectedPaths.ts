/** Path prefixes that require a session cookie (keep in sync with proxy.ts matcher). */
export const PROTECTED_PATH_PREFIXES = [
  '/home',
  '/write',
  '/contribute',
  '/profile',
  '/my-articles',
  '/onboarding',
  '/settings',
  '/reviews',
] as const;

export function isProtectedAppPath(pathname: string): boolean {
  for (const prefix of PROTECTED_PATH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }
  }
  return false;
}
