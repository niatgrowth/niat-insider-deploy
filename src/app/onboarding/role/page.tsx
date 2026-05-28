"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setOnboardingRole } from "@/lib/api/profiles";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { notify } from "@/lib/toast";
type SelectableRole = "intermediate_student" | "niat_student";

export default function OnboardingRolePage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const authChecked = useAuthStore((s) => s.authChecked);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const role = useAuthStore((s) => s.role);
  const [submittingRole, setSubmittingRole] = useState<SelectableRole | null>(null);

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isOnboarded) {
      router.replace("/home");
      return;
    }
    if (role === "verified_niat_student") {
      router.replace("/home");
      return;
    }
  }, [authChecked, user, isOnboarded, role, router]);

  const handleSelectRole = async (role: SelectableRole) => {
    setSubmittingRole(role);
    try {
      const data = await setOnboardingRole(role);
      setAuth({ role: data.role });
      notify.success(
        role === "intermediate_student"
          ? "Intermediate student profile selected. Complete your details next."
          : "NIAT student profile selected. Complete your verification details next."
      );
      router.push("/onboarding/profile");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        notify.error("Your session expired. Please sign in again.");
        router.push("/login");
        return;
      }
      notify.apiError(err, "Failed to save role. Please try again.");
    } finally {
      setSubmittingRole(null);
    }
  };

  return (
    <div className="flex-1 overflow-x-hidden">
      <main className="bg-section relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -left-16 h-72 w-72 rounded-full bg-[#991b1b]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[#991b1b]/10 blur-3xl" />
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="mx-auto mb-8 max-w-2xl text-center animate-[fadeIn_0.45s_ease-out]">
            <p className="inline-flex rounded-full border border-[rgba(153,27,27,0.25)] bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold text-[#991b1b] mb-3 shadow-sm">
              Onboarding Step 1 of 2
            </p>
            <h1 className="font-display text-3xl font-bold text-[#1e293b] sm:text-4xl">Choose Your Role</h1>
            <p className="mt-3 text-sm text-[#64748b] sm:text-base">
              Select the role that matches your current status to continue onboarding.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="group border-[rgba(30,41,59,0.12)] shadow-card bg-white/95 backdrop-blur hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-[#1e293b]">Intermediate Student</CardTitle>
                <CardDescription>
                  For students beginning their journey and setting up their base academic profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[#475569]">
                Fill your college and branch details to unlock the student experience.
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#991b1b] hover:bg-[#b91c1c] text-white shadow-sm hover:shadow-md transition-all"
                  onClick={() => handleSelectRole("intermediate_student")}
                  disabled={submittingRole !== null}
                >
                  {submittingRole === "intermediate_student" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Spinner size="sm" className="border-white/30 border-t-white" />
                      Saving…
                    </span>
                  ) : (
                    "Select Intermediate Student"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="group border-[rgba(30,41,59,0.12)] shadow-card bg-white/95 backdrop-blur hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-[#1e293b]">NIAT Student</CardTitle>
                <CardDescription>
                  For NIAT students who want verified status and contributor access after approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[#475569]">
                Submit your NIAT ID details, campus, and profile details to request verification.
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#991b1b] hover:bg-[#b91c1c] text-white shadow-sm hover:shadow-md transition-all"
                  onClick={() => handleSelectRole("niat_student")}
                  disabled={submittingRole !== null}
                >
                  {submittingRole === "niat_student" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Spinner size="sm" className="border-white/30 border-t-white" />
                      Saving…
                    </span>
                  ) : (
                    "Select NIAT Student"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

