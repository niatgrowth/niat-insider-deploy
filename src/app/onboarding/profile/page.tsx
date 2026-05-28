"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding, updateMeProfile } from "@/lib/authApi";
import { upsertIntermediateProfile, upsertNiatProfile } from "@/lib/api/profiles";
import { useAuthStore } from "@/store/authStore";
import { CampusSelector } from "@/components/onboarding/CampusSelector";
import {
  assertFileUnderMaxBytes,
  FILE_SIZE_HINT_ID_CARD,
  FILE_SIZE_HINT_PROFILE_IMAGE,
  MAX_PROFILE_UPLOAD_FILE_BYTES,
} from "@/lib/fileUploadLimits";
import { parseBackendError } from "@/lib/parseBackendError";
import { Spinner } from "@/components/ui/spinner";
import { notify } from "@/lib/toast";

const START_YEAR = 2024;
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) => START_YEAR + i);
const INTERMEDIATE_BRANCH_OPTIONS = [
  { value: "MPC", label: "MPC" },
  { value: "BIPC", label: "BIPC" },
  { value: "OTHERS", label: "Others" },
] as const;

export default function OnboardingProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authChecked = useAuthStore((s) => s.authChecked);
  const role = useAuthStore((s) => s.role);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const bootstrapAuth = useAuthStore((s) => s.bootstrapAuth);

  const [submitting, setSubmitting] = useState(false);

  const [collegeName, setCollegeName] = useState("");
  const [branch, setBranch] = useState<"MPC" | "BIPC" | "OTHERS" | "">("");
  const [branchOther, setBranchOther] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [campusId, setCampusId] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [yearJoined, setYearJoined] = useState<number | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  const [collegeNameError, setCollegeNameError] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [branchOtherError, setBranchOtherError] = useState<string | null>(null);
  const [idNumberError, setIdNumberError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [linkedinProfileError, setLinkedinProfileError] = useState<string | null>(null);
  const [yearJoinedError, setYearJoinedError] = useState<string | null>(null);
  const [campusError, setCampusError] = useState<string | null>(null);
  const [idCardError, setIdCardError] = useState<string | null>(null);
  const [profilePictureError, setProfilePictureError] = useState<string | null>(null);

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
    if (!role) {
      router.replace("/onboarding/role");
    }
  }, [authChecked, user, isOnboarded, role, router]);

  const clearInlineErrors = () => {
    setCollegeNameError(null);
    setBranchError(null);
    setBranchOtherError(null);
    setIdNumberError(null);
    setEmailError(null);
    setLinkedinProfileError(null);
    setYearJoinedError(null);
    setCampusError(null);
    setIdCardError(null);
    setProfilePictureError(null);
  };

  const finalizeOnboarding = async () => {
    await completeOnboarding();
    await bootstrapAuth({ force: true });
    if (role === "niat_student" || role === "verified_niat_student") {
      router.push("/onboarding/review");
      return;
    }
    router.push("/home");
  };

  const submitIntermediate = async () => {
    clearInlineErrors();
    let hasError = false;
    if (!collegeName.trim()) {
      setCollegeNameError("College name is required.");
      hasError = true;
    }
    if (!branch) {
      setBranchError("Branch is required.");
      hasError = true;
    }
    if (branch === "OTHERS" && !branchOther.trim()) {
      setBranchOtherError("Please specify your branch.");
      hasError = true;
    }
    if (hasError) return;

    await upsertIntermediateProfile({
      college_name: collegeName.trim(),
      branch: branch as "MPC" | "BIPC" | "OTHERS",
      branch_other: branch === "OTHERS" ? branchOther.trim() : "",
    });
    await finalizeOnboarding();
  };

  const submitNiat = async () => {
    clearInlineErrors();
    let hasError = false;
    if (!idNumber.trim()) {
      setIdNumberError("ID number is required.");
      hasError = true;
    }
    if (!campusId) {
      setCampusError("Campus is required.");
      hasError = true;
    }
    if (!idCardFile) {
      setIdCardError("ID card image is required.");
      hasError = true;
    } else {
      const idTypeOk =
        idCardFile.type.startsWith("image/") ||
        idCardFile.type === "application/pdf" ||
        idCardFile.name.toLowerCase().endsWith(".pdf");
      if (!idTypeOk) {
        setIdCardError("Please upload an image (JPG, PNG) or a PDF.");
        hasError = true;
      } else {
        const idSize = assertFileUnderMaxBytes(idCardFile, MAX_PROFILE_UPLOAD_FILE_BYTES);
        if (idSize) {
          setIdCardError(idSize);
          hasError = true;
        }
      }
    }
    if (!profilePictureFile) {
      setProfilePictureError("Profile picture is required.");
      hasError = true;
    } else if (!profilePictureFile.type.startsWith("image/")) {
      setProfilePictureError("Only image files are allowed.");
      hasError = true;
    } else {
      const picSize = assertFileUnderMaxBytes(profilePictureFile, MAX_PROFILE_UPLOAD_FILE_BYTES);
      if (picSize) {
        setProfilePictureError(picSize);
        hasError = true;
      }
    }
    if (!email.trim()) {
      setEmailError("Email is required.");
      hasError = true;
    }
    if (!linkedinProfile.trim()) {
      setLinkedinProfileError("LinkedIn profile URL is required.");
      hasError = true;
    }
    if (yearJoined == null) {
      setYearJoinedError("Year of joining is required.");
      hasError = true;
    }
    if (hasError) return;
    const selectedIdCardFile = idCardFile;

    try {
      await updateMeProfile({ email: email.trim() });
    } catch (err: unknown) {
      const maybeEmail = (err as { response?: { data?: { email?: string | string[] } } })?.response?.data?.email;
      const message = Array.isArray(maybeEmail) ? maybeEmail[0] : maybeEmail;
      setEmailError(typeof message === "string" ? message : "Please enter a valid email.");
      return;
    }

    const formData = new FormData();
    formData.append("student_id_number", idNumber.trim());
    formData.append("campus", campusId);
    formData.append("id_card_file", selectedIdCardFile as File);
    formData.append("profile_picture", profilePictureFile as File);
    formData.append("linkedin_profile", linkedinProfile.trim());

    await upsertNiatProfile(formData);
    await finalizeOnboarding();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setSubmitting(true);
    try {
      if (role === "intermediate_student") {
        await submitIntermediate();
        notify.success("Profile saved! Welcome to NIAT Insider.");
      } else if (role === "niat_student") {
        await submitNiat();
        notify.success("Profile submitted! Complete your campus review next.");
      } else {
        notify.error("Selected role is not supported for onboarding.");
      }
    } catch (err: unknown) {
      notify.error(parseBackendError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!role) return null;

  return (
    <div className="flex-1 overflow-x-hidden">
      <main className="bg-section relative overflow-hidden">
        <div className="pointer-events-none absolute -top-12 -right-16 h-72 w-72 rounded-full bg-[#991b1b]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-[#991b1b]/10 blur-3xl" />
        <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
          <Card className="border-[rgba(30,41,59,0.12)] shadow-card bg-white/95 backdrop-blur animate-[fadeIn_0.45s_ease-out]">
          <CardHeader>
            <p className="inline-flex w-fit rounded-full border border-[rgba(153,27,27,0.25)] bg-[#fff8eb] px-3 py-1 text-xs font-semibold text-[#991b1b] shadow-sm">
              Onboarding Step 2 of 2
            </p>
            <CardTitle className="text-2xl text-[#1e293b]">Complete Your Profile</CardTitle>
            <CardDescription>
              {role === "intermediate_student"
                ? "Add your academic details to continue."
                : "Submit your NIAT verification details to continue."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="onboarding-profile-form" onSubmit={handleSubmit} className="space-y-4">
              {role === "intermediate_student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <select
                      id="branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value as "MPC" | "BIPC" | "OTHERS" | "")}
                      className="w-full rounded-md border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    >
                      <option value="">Select branch</option>
                      {INTERMEDIATE_BRANCH_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {branchError && <p className="text-xs text-red-600">{branchError}</p>}
                  </div>
                  {branch === "OTHERS" && (
                    <div className="space-y-2">
                      <Label htmlFor="branch_other">Other branch</Label>
                      <Input
                        id="branch_other"
                        value={branchOther}
                        onChange={(e) => setBranchOther(e.target.value)}
                        placeholder="Enter your branch"
                        className="border-[rgba(30,41,59,0.15)] focus-visible:ring-[#991b1b]"
                      />
                      {branchOtherError && <p className="text-xs text-red-600">{branchOtherError}</p>}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="college_name">College Name</Label>
                    <Input
                      id="college_name"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="Enter your college name"
                      className="border-[rgba(30,41,59,0.15)] focus-visible:ring-[#991b1b]"
                    />
                    {collegeNameError && <p className="text-xs text-red-600">{collegeNameError}</p>}
                  </div>
                </>
              )}

              {role === "niat_student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="id_number">ID Number</Label>
                    <Input
                      id="id_number"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter your NIAT ID number"
                      className="border-[rgba(30,41,59,0.15)] focus-visible:ring-[#991b1b]"
                    />
                    {idNumberError && <p className="text-xs text-red-600">{idNumberError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="border-[rgba(30,41,59,0.15)] focus-visible:ring-[#991b1b]"
                    />
                    {emailError && <p className="text-xs text-red-600">{emailError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label id="niat_campus_label">Campus</Label>
                    <CampusSelector
                      value={campusId || null}
                      onChange={setCampusId}
                    />
                    {campusError && <p className="text-xs text-red-600">{campusError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin_profile">LinkedIn profile</Label>
                    <Input
                      id="linkedin_profile"
                      type="url"
                      value={linkedinProfile}
                      onChange={(e) => setLinkedinProfile(e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="border-[rgba(30,41,59,0.15)] focus-visible:ring-[#991b1b]"
                    />
                    {linkedinProfileError && <p className="text-xs text-red-600">{linkedinProfileError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year_joined">Year of joining</Label>
                    <select
                      id="year_joined"
                      value={yearJoined ?? ""}
                      onChange={(e) => setYearJoined(e.target.value ? parseInt(e.target.value, 10) : null)}
                      className="w-full rounded-md border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    >
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    {yearJoinedError && <p className="text-xs text-red-600">{yearJoinedError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id_card">ID Card (Image or PDF)</Label>
                    <Input
                      id="id_card"
                      type="file"
                      accept="image/*,application/pdf,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setIdCardFile(null);
                          setIdCardError(null);
                          return;
                        }
                        const tooBig = assertFileUnderMaxBytes(file, MAX_PROFILE_UPLOAD_FILE_BYTES);
                        if (tooBig) {
                          setIdCardError(tooBig);
                          e.target.value = "";
                          setIdCardFile(null);
                          return;
                        }
                        const typeOk =
                          file.type.startsWith("image/") ||
                          file.type === "application/pdf" ||
                          file.name.toLowerCase().endsWith(".pdf");
                        if (!typeOk) {
                          setIdCardError("Please upload an image (JPG, PNG) or a PDF.");
                          e.target.value = "";
                          setIdCardFile(null);
                          return;
                        }
                        setIdCardFile(file);
                        setIdCardError(null);
                      }}
                      className="border-[rgba(30,41,59,0.15)] file:mr-3 file:rounded-md file:border-0 file:bg-[#991b1b]/10 file:px-3 file:py-1.5 file:text-[#991b1b] file:font-medium hover:file:bg-[#991b1b]/20"
                    />
                    <p className="text-sm text-gray-500">{FILE_SIZE_HINT_ID_CARD}</p>
                    {idCardError && <p className="text-xs text-red-600">{idCardError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile_picture">Profile Picture</Label>
                    <Input
                      id="profile_picture"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setProfilePictureFile(null);
                          setProfilePictureError(null);
                          return;
                        }
                        const tooBig = assertFileUnderMaxBytes(file, MAX_PROFILE_UPLOAD_FILE_BYTES);
                        if (tooBig) {
                          setProfilePictureError(tooBig);
                          e.target.value = "";
                          setProfilePictureFile(null);
                          return;
                        }
                        if (!file.type.startsWith("image/")) {
                          setProfilePictureError("Only image files are allowed.");
                          e.target.value = "";
                          setProfilePictureFile(null);
                          return;
                        }
                        setProfilePictureFile(file);
                        setProfilePictureError(null);
                      }}
                      className="border-[rgba(30,41,59,0.15)] file:mr-3 file:rounded-md file:border-0 file:bg-[#991b1b]/10 file:px-3 file:py-1.5 file:text-[#991b1b] file:font-medium hover:file:bg-[#991b1b]/20"
                    />
                    <p className="text-sm text-gray-500">{FILE_SIZE_HINT_PROFILE_IMAGE}</p>
                    {profilePictureError && <p className="text-xs text-red-600">{profilePictureError}</p>}
                  </div>
                </>
              )}
            </form>
          </CardContent>

          <CardFooter>
            <Button
              form="onboarding-profile-form"
              type="submit"
              disabled={submitting}
              className="w-full bg-[#991b1b] hover:bg-[#b91c1c] text-white shadow-sm hover:shadow-md transition-all"
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Submitting…
                </span>
              ) : (
                "Submit and Continue"
              )}
            </Button>
          </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

