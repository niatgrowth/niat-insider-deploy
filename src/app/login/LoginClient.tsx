"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { loginByPhonePassword } from '@/lib/authApi';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/spinner';
import { FadeIn } from '@/components/ui/fade-in';
import { notify } from '@/lib/toast';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Must match proxy.ts / RequireOnboarding / RequireSessionServer: they all use `from`.
  const nextUrl = searchParams.get('from') ?? '/home';

  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length === 10;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      notify.error('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!password) {
      notify.error('Enter your password.');
      return;
    }
    const p = phoneDigits;
    setLoading(true);
    try {
      await loginByPhonePassword(p, password);
      await useAuthStore.getState().bootstrapAuth({ force: true });
      useAuthStore.setState({ authChecked: true });
      window.dispatchEvent(new Event('niat:auth'));
      notify.success('Welcome back! You are signed in.');
      router.replace(nextUrl.startsWith('/') ? nextUrl : '/home');
    } catch (e) {
      notify.apiError(e, 'Could not sign in. Check your mobile number and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <PublicNavbar />
      <main className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full min-w-0">
        <FadeIn
          className="rounded-2xl border border-[rgba(30,41,59,0.1)] p-5 sm:p-8 shadow-sm"
          style={{ backgroundColor: '#fff8eb' } as React.CSSProperties}
        >
          <h1 className="font-playfair text-2xl font-bold text-[#1e293b] mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-[#64748b] mb-6">
            Sign in with your mobile number and password.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-phone" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                Mobile number
              </label>
              <input
                id="login-phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                }}
                placeholder="e.g. 9876543210"
                autoComplete="tel"
                suppressHydrationWarning
                className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
              />
              {phone.length > 0 && !isPhoneValid && (
                <p className="mt-1 text-xs text-red-600" role="alert">Mobile number must be exactly 10 digits.</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 pr-10 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#1e293b] focus:outline-none rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  suppressHydrationWarning
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-sm font-medium text-[#991b1b] hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isPhoneValid || !password || loading}
              className="w-full rounded-xl bg-[#991b1b] px-8 py-3 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center">
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                </span>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748b]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-[#991b1b] hover:underline">
              Register
            </Link>
          </p>
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
