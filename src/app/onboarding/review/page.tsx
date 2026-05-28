"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getOnboardingStatus,
  submitOnboardingReview,
  type OnboardingReviewPayload,
} from "@/lib/api";
import {
  FACULTY_SUPPORT_OPTIONS,
  LEARNING_BALANCE_OPTIONS,
  PLACEMENT_REALITY_OPTIONS,
  EXPERIENCE_FEEL_OPTIONS,
  FINAL_RECOMMENDATION_OPTIONS,
  ONBOARDING_TEXT_MIN_LENGTH,
} from "../../../lib/onboarding-constants";
import { isAuthenticated } from "../../../lib/auth";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { LoadingScreen, Spinner } from "@/components/ui/spinner";
import { notify } from "@/lib/toast";

const STEPS = [
  {
    title: "Teaching & faculty support",
    ratingKey: "teaching_quality" as const,
    textKey: "faculty_support_text" as const,
    choiceKey: "faculty_support_choice" as const,
    textLabel: "In a few sentences, how supportive were your faculty?",
    textPlaceholder: "e.g. They were approachable, held regular doubt sessions, and helped with projects.",
    choiceOptions: FACULTY_SUPPORT_OPTIONS,
  },
  {
    title: "Hands-on learning & projects",
    ratingKey: "projects_quality" as const,
    textKey: "best_project_or_skill" as const,
    choiceKey: "learning_balance_choice" as const,
    textLabel: "What was the best project or skill you gained?",
    textPlaceholder: "e.g. A capstone project in ML; learned to deploy apps end-to-end.",
    choiceOptions: LEARNING_BALANCE_OPTIONS,
  },
  {
    title: "Placements & career readiness",
    ratingKey: "placement_support" as const,
    textKey: "job_ready_text" as const,
    choiceKey: "placement_reality_choice" as const,
    textLabel: "How did the program prepare you for jobs or internships?",
    textPlaceholder: "e.g. Resume workshops, mock interviews, and company talks helped a lot.",
    choiceOptions: PLACEMENT_REALITY_OPTIONS,
  },
  {
    title: "Your overall experience",
    ratingKey: "overall_satisfaction" as const,
    textKey: "one_line_experience" as const,
    choiceKey: "experience_feel_choice" as const,
    textLabel: "Sum up your NIAT experience in one line.",
    textPlaceholder: "e.g. Tough but rewarding; I grew more than I expected.",
    choiceOptions: EXPERIENCE_FEEL_OPTIONS,
  },
  {
    title: "Would you recommend it?",
    ratingKey: "recommendation_score" as const,
    textKey: "who_should_join_text" as const,
    choiceKey: "final_recommendation_choice" as const,
    textLabel: "Who do you think should consider joining NIAT?",
    textPlaceholder: "e.g. Students who want a mix of theory and real-world projects.",
    choiceOptions: FINAL_RECOMMENDATION_OPTIONS,
  },
];

const initialPayload: OnboardingReviewPayload = {
  teaching_quality: 0,
  faculty_support_text: "",
  faculty_support_choice: "",
  projects_quality: 0,
  best_project_or_skill: "",
  learning_balance_choice: "",
  placement_support: 0,
  job_ready_text: "",
  placement_reality_choice: "",
  overall_satisfaction: 0,
  one_line_experience: "",
  experience_feel_choice: "",
  recommendation_score: 0,
  who_should_join_text: "",
  final_recommendation_choice: "",
  linkedin_profile_url: "",
};

export default function OnboardingReviewPage() {
  const router = useRouter();
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingReviewPayload>(initialPayload);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    getOnboardingStatus()
      .then((status) => {
        if (status?.review_submitted) {
          router.replace("/home");
          return;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const current = STEPS[step - 1];
  const isLastStep = step === STEPS.length;

  const update = <K extends keyof OnboardingReviewPayload>(key: K, value: OnboardingReviewPayload[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    const r = data[current.ratingKey as keyof OnboardingReviewPayload];
    const t = data[current.textKey as keyof OnboardingReviewPayload];
    const c = data[current.choiceKey as keyof OnboardingReviewPayload];
    const base =
      typeof r === "number" && r >= 1 && r <= 5 &&
      typeof t === "string" && t.trim().length >= ONBOARDING_TEXT_MIN_LENGTH &&
      typeof c === "string" && c.length > 0;
    return base;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (isLastStep) {
      setSubmitting(true);
      submitOnboardingReview(data)
        .then(async () => {
          setSubmitted(true);
          await bootstrapAuth({ force: true });
          notify.success("Thank you! Your onboarding review was submitted.");
          router.replace("/home");
        })
        .catch((err) => {
          notify.apiError(err, "Could not submit your review. Please try again.");
        })
        .finally(() => setSubmitting(false));
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingScreen />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-section relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-20 h-72 w-72 rounded-full bg-[#991b1b]/10 blur-3xl animate-soft-float" />
        <div className="pointer-events-none absolute -bottom-16 -left-20 h-72 w-72 rounded-full bg-[#991b1b]/10 blur-3xl animate-soft-float-reverse" />
        <div className="rounded-2xl border border-[rgba(30,41,59,0.12)] p-10 max-w-md text-center shadow-card bg-white/95 backdrop-blur animate-fade-up">
          <h2 className="text-2xl font-bold text-[#1e293b] mb-3">You’re all set!</h2>
          <p className="text-[#64748b]">Thanks for completing your review. Redirecting you to the community…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 bg-section relative overflow-hidden">
      <div className="pointer-events-none absolute -top-12 -right-16 h-72 w-72 rounded-full bg-[#991b1b]/10 blur-3xl animate-soft-float" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-[#991b1b]/10 blur-3xl animate-soft-float-reverse" />
      <div className="w-full max-w-xl mx-auto">
        <div className="text-center mb-8 animate-fade-up">
          <p className="inline-flex rounded-full border border-[rgba(153,27,27,0.25)] bg-[#fff8eb] px-3 py-1 text-xs font-semibold text-[#991b1b] shadow-sm mb-3">
            Onboarding Step 3 of 3
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1e293b] mb-1">Welcome to NIAT Reviews</h1>
          <p className="text-sm text-[#64748b]">Complete this short review to join the community</p>
        </div>

        <div className="rounded-2xl border border-[rgba(30,41,59,0.12)] p-6 sm:p-8 shadow-card bg-white/95 backdrop-blur animate-fade-up-delayed">
          <div className="mb-6">
            <p className="text-sm text-[#64748b] mb-1">Step {step} of {STEPS.length}</p>
            <div className="h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
              <div className="h-full bg-[#991b1b] transition-all duration-500 ease-out" style={{ width: `${(step / STEPS.length) * 100}%` }} />
            </div>
          </div>

          <h2 className="text-lg font-bold text-[#1e293b] mb-6">{current.title}</h2>

          <>
          <div className="mb-6">
            <p className="text-sm font-medium text-[#1e293b] mb-2">Rate from 1 to 5 stars</p>
            <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => update(current.ratingKey, n)}
                className={cn(
                  "p-1 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#facc15]/40",
                  "hover:-translate-y-0.5 hover:scale-105 active:scale-95",
                  (data[current.ratingKey] as number) >= n && "animate-star-pop"
                )}
                aria-label={`${n} stars`}
              >
                <Star
                  className="w-8 h-8 transition-colors duration-200"
                  fill={(data[current.ratingKey] as number) >= n ? "#facc15" : "transparent"}
                  stroke={(data[current.ratingKey] as number) >= n ? "#eab308" : "#cbd5e1"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1e293b] mb-1">
              {current.textLabel} <span className="text-[#64748b] font-normal">(min {ONBOARDING_TEXT_MIN_LENGTH} characters)</span>
            </label>
          <textarea
            value={(data[current.textKey] as string) || ""}
            onChange={(e) => update(current.textKey, e.target.value)}
            placeholder={current.textPlaceholder}
            rows={3}
            className="w-full rounded-xl border border-[rgba(30,41,59,0.15)] px-4 py-2.5 text-[#1e293b] bg-white placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#991b1b]/30 resize-none"
          />
          </div>

          <div className="mb-8">
            <p className="text-sm font-medium text-[#1e293b] mb-2">Pick the option that fits best</p>
          <div className="space-y-2">
            {current.choiceOptions.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 transition-all duration-200",
                  (data[current.choiceKey] as string) === opt.value
                    ? "border-[#991b1b] bg-[#fff1f2] scale-[1.01] shadow-sm"
                    : "border-[rgba(30,41,59,0.15)] hover:bg-[#f8fafc] hover:border-[#991b1b]/35"
                )}
              >
                <input
                  type="radio"
                  name={current.choiceKey}
                  value={opt.value}
                  checked={(data[current.choiceKey] as string) === opt.value}
                  onChange={() => update(current.choiceKey, opt.value)}
                  className="text-[#991b1b] focus:ring-[#991b1b]"
                />
                <span className="text-sm text-[#1e293b]">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
          </>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-[rgba(30,41,59,0.18)] px-4 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#f8fafc]"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || submitting}
              className="rounded-xl bg-[#991b1b] text-white font-medium py-2.5 px-5 hover:bg-[#7f1d1d] disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Submitting…
                </span>
              ) : isLastStep ? (
                "Submit & join community"
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-fade-up {
          animation: fadeUp 420ms ease-out both;
        }
        .animate-fade-up-delayed {
          animation: fadeUp 520ms ease-out both;
        }
        .animate-soft-float {
          animation: softFloat 8s ease-in-out infinite;
        }
        .animate-soft-float-reverse {
          animation: softFloatReverse 9s ease-in-out infinite;
        }
        .animate-star-pop {
          animation: starPop 240ms ease-out;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes softFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }
        @keyframes softFloatReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, 10px, 0);
          }
        }
        @keyframes starPop {
          0% {
            transform: scale(0.85);
          }
          70% {
            transform: scale(1.12);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

