"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import {
  requestOtpByPhone,
  verifyOtpByPhone,
  registerNiatverse,
  loginByUsernamePassword,
} from '@/lib/authApi';
import { extractDjangoError } from '@/lib/utils/errors';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/spinner';
import { FadeIn } from '@/components/ui/fade-in';
import { notify, getApiErrorMessage } from '@/lib/toast';

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length === 10;
  const passwordMatch = password === confirm && password.length >= 8;
  const canSubmit = phoneVerified && username.trim().length >= 2 && passwordMatch;

  const handleSendOtp = async () => {
    if (!isPhoneValid) {
      notify.error('Mobile number must be exactly 10 digits.');
      return;
    }
    const p = phoneDigits;
    setOtpSending(true);
    try {
      await requestOtpByPhone(p, { for: 'register' });
      setOtpSent(true);
      notify.success('Verification code sent to your phone.');
    } catch (e) {
      notify.apiError(e);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const p = phoneDigits;
    const code = otpCode.replace(/\D/g, '').slice(0, 4);
    if (!p || code.length !== 4) {
      notify.error('Enter the 4-digit code.');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await verifyOtpByPhone(p, code);
      if (res.verified) {
        setPhoneVerified(true);
        notify.success('Phone number verified. You can finish registration.');
      } else {
        notify.error('Invalid or expired code. Request a new one.');
      }
    } catch (e) {
      notify.apiError(e);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      try {
        await registerNiatverse({
          username: username.trim(),
          phone: phone.trim(),
          password,
        });
      } catch (error) {
        const responseData =
          error && typeof error === 'object' && 'response' in error
            ? (error as { response?: { data?: Record<string, unknown> } }).response?.data
            : null;
        const message = responseData
          ? extractDjangoError(responseData)
          : getApiErrorMessage(error);
        notify.error(message);
        return;
      }

      try {
        await loginByUsernamePassword(username.trim(), password);
      } catch {
        notify.success('Account created! Please sign in to continue.');
        router.replace('/login');
        return;
      }

      try {
        await useAuthStore.getState().bootstrapAuth({ force: true });
        window.dispatchEvent(new Event('niat:auth'));
        notify.success('Welcome to NIAT Insider! Let’s set up your profile.');
        router.replace('/onboarding/role');
      } catch (e) {
        notify.apiError(e);
      }
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
          style={{ backgroundColor: '#fff8eb' }}
        >
          <h1 className="font-playfair text-2xl font-bold text-[#1e293b] mb-6">
            Register — NIAT Student
          </h1>
          <p className="text-sm text-[#64748b] mb-6">
            Create an account with your mobile number and start as a NIAT Student on NIAT Insider.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-username" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                Mobile number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                    }}
                    readOnly={phoneVerified}
                    className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] ${
                      phoneVerified ? 'border-green-500 bg-green-50/50 pr-10' : 'border-[rgba(30,41,59,0.15)]'
                    }`}
                    placeholder="9876543210"
                  />
                  {!phoneVerified && phone.length > 0 && !isPhoneValid && (
                    <p className="mt-1 text-xs text-red-600" role="alert">Mobile number must be exactly 10 digits.</p>
                  )}
                  {phoneVerified && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" aria-label="Verified">
                      <CheckCircle className="h-5 w-5" />
                    </span>
                  )}
                </div>
                {!phoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!isPhoneValid || otpSending || otpSent}
                    className="shrink-0 rounded-xl border border-[#991b1b] bg-[#991b1b] px-3 py-2 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpSending ? <Spinner size="sm" className="border-white/30 border-t-white" /> : otpSent ? 'Sent' : 'Send OTP'}
                  </button>
                )}
              </div>
              {!phoneVerified && otpSent && (
                <div className="mt-3 flex gap-2 items-end">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                    }}
                    placeholder="0000"
                    className="w-24 rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpCode.replace(/\D/g, '').length !== 4 || otpVerifying}
                    className="rounded-xl bg-[#991b1b] px-4 py-2 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50"
                  >
                    {otpVerifying ? <Spinner size="sm" className="border-white/30 border-t-white" /> : 'Verify OTP'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2 pr-10 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#1e293b] focus:outline-none rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2 pr-10 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                  placeholder="Repeat password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((c) => !c)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#1e293b] focus:outline-none rounded"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="mt-1 text-sm text-red-600">Passwords don’t match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full rounded-xl bg-[#991b1b] py-3 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center">
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                </span>
              ) : phoneVerified ? (
                'Register'
              ) : (
                'Verify phone to continue'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748b]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#991b1b] hover:underline">
              Log in
            </Link>
          </p>
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
