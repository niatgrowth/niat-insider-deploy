"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
} from "@/lib/authApi";
import { Spinner } from "@/components/ui/spinner";

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { detail?: string } } }).response;
    if (res?.data?.detail && typeof res.data.detail === "string") return res.data.detail;
  }
  return "Something went wrong. Please try again.";
}

export default function ForgotPasswordPage() {
  const OTP_LENGTH = 4;
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10;

  const handleRequestOtp = async () => {
    if (!isPhoneValid) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await requestForgotPasswordOtp(phoneDigits);
      setOtpSent(true);
      setMessage(res.detail);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (code.trim().length !== OTP_LENGTH) {
      setError(`Enter a valid ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await verifyForgotPasswordOtp(phoneDigits, code.trim());
      setOtpVerified(true);
      setMessage("Phone verified. Continue to reset password.");
      setStep(2);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    e.preventDefault();
    if (!otpVerified) {
      setError("Verify OTP before resetting password.");
      return;
    }



    if (newPassword.includes(" ")) {
    setError("Password should not contain spaces");
    return;
  }

  if (newPassword.length < 8) {
    setError("Password length should be at least 8 characters");
    return;
  }

  if (!/[A-Z]/.test(newPassword)) {
    setError("Password must contain at least 1 capital letter (A-Z)");
    return;
  }

  if (!/[a-z]/.test(newPassword)) {
    setError("Password must contain at least 1 small letter (a-z)");
    return;
  }

  if (!/[0-9]/.test(newPassword)) {
    setError("Password must contain at least 1 number (0-9)");
    return;
  }

  // if (!/[@$!%*?&]/.test(newPassword)) {
  //   setError("Password must contain at least 1 special character (@ $ ! % * ? &)");
  //   return;
  // }


    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await resetPasswordWithOtp({
        phone_number: phoneDigits,
        code: code.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(res.detail);
      setTimeout(() => router.replace("/login"), 900);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <main className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full min-w-0">
        <div className="rounded-2xl border border-[rgba(30,41,59,0.1)] p-5 sm:p-8 shadow-sm transition-all duration-300" style={{ backgroundColor: "#fff8eb" }}>
          <div className="mb-5">
            <h1 className="font-playfair text-2xl font-bold text-[#1e293b] mb-2">Reset your password</h1>
            <p className="text-sm text-[#64748b]">
              Step {step} of 2: {step === 1 ? "Verify your phone with OTP" : "Set a new secure password"}.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-[#991b1b]" : "bg-[#e2e8f0]"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-[#991b1b]" : "bg-[#e2e8f0]"}`} />
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-[fadeIn_.28s_ease-out]">
              <div>
                <label htmlFor="forgot-phone" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                  Mobile number
                </label>
                <input
                  id="forgot-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={phoneNumber}
                  disabled={otpSent}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setError(null);
                  }}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b] disabled:bg-slate-100 disabled:text-slate-500"
                />
                <p className="mt-1.5 text-xs text-[#64748b]">Enter the same phone number used during signup.</p>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={!isPhoneValid || loading}
                  className="w-full rounded-xl bg-[#991b1b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50"
                >
                  {loading ? <span className="inline-flex justify-center"><Spinner size="sm" className="border-white/30 border-t-white" /></span> : "Send OTP"}
                </button>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-[rgba(30,41,59,0.12)] bg-[#fff8eb] px-3 py-2 text-xs text-[#64748b]">
                  <span>OTP sent to {phoneDigits}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setCode("");
                      setMessage(null);
                      setError(null);
                    }}
                    className="font-medium text-[#991b1b] hover:underline"
                  >
                    Change number
                  </button>
                </div>
              )}

              {otpSent && (
                <div className="rounded-xl border border-[rgba(30,41,59,0.12)] bg-white p-3.5 transition-all duration-300">
                  <label htmlFor="forgot-otp" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                    OTP code
                  </label>
                  <input
                    id="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
                      setError(null);
                    }}
                    placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
                    className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-center tracking-[0.35em] text-base font-semibold text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                  />
                  <p className="mt-1.5 text-xs text-[#64748b]">Use the {OTP_LENGTH}-digit code sent to your mobile.</p>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={code.trim().length !== OTP_LENGTH || loading}
                    className="mt-3 w-full rounded-xl border border-[#991b1b] text-[#991b1b] px-4 py-2.5 text-sm font-medium hover:bg-[#fbf2f3] disabled:opacity-50"
                  >
                    {loading ? <span className="inline-flex justify-center"><Spinner size="sm" className="border-[#991b1b]/20" /></span> : "Verify OTP"}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-[fadeIn_.28s_ease-out]">
              <div>
                <label htmlFor="forgot-new-password" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                  New password
                </label>
                <input
                  id="forgot-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                />
                <p className="mt-1.5 text-xs text-[#64748b]">Use at least 8 characters.</p>
              </div>
              <div>
                <label htmlFor="forgot-confirm-password" className="block text-sm font-medium text-[#1e293b] mb-1.5">
                  Confirm password
                </label>
                <input
                  id="forgot-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#991b1b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50"
              >
                {loading ? <span className="inline-flex justify-center"><Spinner size="sm" className="border-white/30 border-t-white" /></span> : "Reset password"}
              </button>
            </form>
          )}

          {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">{error}</p>}
          {message && <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2.5 rounded-xl">{message}</p>}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 w-full text-center text-sm font-medium text-[#991b1b] hover:underline"
          >
            Back to login
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
