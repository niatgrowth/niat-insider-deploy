"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  fetchMe,
  updateMeProfile,
  fetchFoundingEditorProfile,
  updateFoundingEditorProfile,
  changePassword,
  checkUsernameAvailability,
  requestChangePhoneOtp,
  confirmChangePhone,
  type MeProfile,
  type FoundingEditorProfile,
} from '@/lib/authApi';
import { useCampuses } from '@/hooks/useCampuses';
import { CampusSelector } from '@/components/onboarding/CampusSelector';
import type { CampusListItem } from '@/types/campusApi';
import { Settings, X } from 'lucide-react';
import FoundingEditorBadge from '@/components/FoundingEditorBadge';
import { useAuthStore } from '@/store/authStore';
import { getMyProfile, upsertIntermediateProfile, upsertNiatProfile } from '@/lib/api/profiles';
import { API_BASE } from '@/lib/apiBase';
import NiatBadgeModal from '@/components/NiatBadgeModal';
import { notify } from '@/lib/toast';
import {
  assertFileUnderMaxBytes,
  FILE_SIZE_HINT_ID_CARD,
  FILE_SIZE_HINT_PROFILE_IMAGE,
  MAX_PROFILE_UPLOAD_FILE_BYTES,
} from '@/lib/fileUploadLimits';
import { parseBackendError } from '@/lib/parseBackendError';

const START_YEAR = 2024;
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) => START_YEAR + i);
const INTERMEDIATE_BRANCH_OPTIONS = [
  { value: 'MPC', label: 'MPC' },
  { value: 'BIPC', label: 'BIPC' },
  { value: 'OTHERS', label: 'Others' },
] as const;

const EMPTY_PROFILE: FoundingEditorProfile = {
  student_id_number: '',
  linkedin_profile: '',
  campus_id: null,
  campus_name: '',
  year_joined: null,
};

type IntermediateProfileForm = {
  college_name: string;
  branch: 'MPC' | 'BIPC' | 'OTHERS' | '';
  branch_other: string;
};

function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

export default function Profile() {
  const router = useRouter();
  const { campuses } = useCampuses();
  const badge = useAuthStore((state) => state.badge);
  const [me, setMe] = useState<MeProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<FoundingEditorProfile>(EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'password' | 'username' | 'phone'>('password');
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [campusLabel, setCampusLabel] = useState<string | null>(null);
  const [intermediateForm, setIntermediateForm] = useState<IntermediateProfileForm>({
    college_name: '',
    branch: '',
    branch_other: '',
  });
  const [intermediateLoading, setIntermediateLoading] = useState(false);
  const [intermediateSaving, setIntermediateSaving] = useState(false);
  const [intermediateSaved, setIntermediateSaved] = useState(false);
  const [niatProfilePictureFile, setNiatProfilePictureFile] = useState<File | null>(null);
  const [niatProfilePictureError, setNiatProfilePictureError] = useState<string | null>(null);
  const [niatProfilePictureUrl, setNiatProfilePictureUrl] = useState<string | null>(null);
  const [niatIdCardFile, setNiatIdCardFile] = useState<File | null>(null);
  const [niatIdCardError, setNiatIdCardError] = useState<string | null>(null);
  const [niatIdCardUrl, setNiatIdCardUrl] = useState<string | null>(null);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  const isVerifiedNiatStudent = me?.role === 'verified_niat_student';
  const isNiatStudent = me?.role === 'niat_student';
  const isIntermediateStudent = me?.role === 'intermediate_student';

  useEffect(() => {
    fetchMe().then((user) => {
      if (!user) {
        router.replace('/');
        return;
      }
      setMe(user);
      if (user.role === 'verified_niat_student') {
        fetchFoundingEditorProfile().then((p) => {
          setEditForm(p ?? EMPTY_PROFILE);
          setCampusLabel(p?.campus_name || null);
          setNiatProfilePictureUrl(resolveMediaUrl(p?.profile_picture));
          setNiatIdCardUrl(resolveMediaUrl(p?.id_card_file));
          setProfileLoading(false);
        });
      } else if (user.role === 'niat_student') {
        getMyProfile()
          .then((data) => {
            const profile = data?.profile as {
              student_id_number?: string | null;
              campus?: { id?: string | number; name?: string } | null;
              campus_name?: string | null;
              linkedin_profile?: string | null;
              id_card_file?: string | null;
              profile_picture?: string | null;
            } | null;
            const campusId = profile?.campus?.id != null ? String(profile.campus.id) : null;
            const campusName = profile?.campus?.name ?? profile?.campus_name ?? '';
            setEditForm({
              student_id_number: profile?.student_id_number ?? '',
              linkedin_profile: profile?.linkedin_profile ?? '',
              campus_id: campusId,
              campus_name: campusName,
              year_joined: null,
            });
            setCampusLabel(campusName || null);
            setNiatIdCardUrl(resolveMediaUrl(profile?.id_card_file));
            setNiatProfilePictureUrl(resolveMediaUrl(profile?.profile_picture));
          })
          .finally(() => setProfileLoading(false));
      } else if (user.role === 'intermediate_student') {
        setIntermediateLoading(true);
        getMyProfile()
          .then((data) => {
            const profile = data?.profile as {
              college_name?: string;
              branch?: 'MPC' | 'BIPC' | 'OTHERS';
              branch_other?: string;
            } | null;
            setIntermediateForm({
              college_name: profile?.college_name ?? '',
              branch: profile?.branch ?? '',
              branch_other: profile?.branch_other ?? '',
            });
          })
          .finally(() => setIntermediateLoading(false));
        setProfileLoading(false);
      } else {
        setProfileLoading(false);
      }
    });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!isVerifiedNiatStudent && !isNiatStudent) || saving) return;
    setNiatIdCardError(null);
    setNiatProfilePictureError(null);
    setProfileSaveError(null);
    setSaving(true);
    setSaved(false);
    try {
      if (isVerifiedNiatStudent) {
        if (niatProfilePictureFile && !niatProfilePictureFile.type.startsWith('image/')) {
          setNiatProfilePictureError('Only image files are allowed for profile picture.');
          return;
        }
        if (niatProfilePictureFile) {
          const picErr = assertFileUnderMaxBytes(niatProfilePictureFile, MAX_PROFILE_UPLOAD_FILE_BYTES);
          if (picErr) {
            setNiatProfilePictureError(picErr);
            return;
          }
        }
        if (niatIdCardFile) {
          const idOk =
            niatIdCardFile.type.startsWith('image/') ||
            niatIdCardFile.type === 'application/pdf' ||
            niatIdCardFile.name.toLowerCase().endsWith('.pdf');
          if (!idOk) {
            setNiatIdCardError('Please upload an image (JPG, PNG) or a PDF for ID card.');
            return;
          }
          const idErr = assertFileUnderMaxBytes(niatIdCardFile, MAX_PROFILE_UPLOAD_FILE_BYTES);
          if (idErr) {
            setNiatIdCardError(idErr);
            return;
          }
        }
        const payload = new FormData();
        payload.append('student_id_number', editForm.student_id_number ?? '');
        if (editForm.campus_id) {
          payload.append('campus_id', String(editForm.campus_id));
        } else {
          payload.append('campus_id', '');
        }
        payload.append('linkedin_profile', editForm.linkedin_profile ?? '');
        if (editForm.year_joined != null) {
          payload.append('year_joined', String(editForm.year_joined));
        }
        if (niatIdCardFile) {
          payload.append('id_card_file', niatIdCardFile);
        }
        if (niatProfilePictureFile) {
          payload.append('profile_picture', niatProfilePictureFile);
        }
        const updated = await updateFoundingEditorProfile(payload);
        setEditForm((prev) => ({ ...prev, ...updated }));
        setCampusLabel(updated.campus_name || null);
        setNiatIdCardUrl(resolveMediaUrl(updated.id_card_file) ?? niatIdCardUrl);
        setNiatIdCardFile(null);
        setNiatProfilePictureUrl(resolveMediaUrl(updated.profile_picture) ?? niatProfilePictureUrl);
        setNiatProfilePictureFile(null);
      } else {
        if (niatProfilePictureFile && !niatProfilePictureFile.type.startsWith('image/')) {
          setNiatProfilePictureError('Only image files are allowed for profile picture.');
          return;
        }
        if (niatProfilePictureFile) {
          const picErr = assertFileUnderMaxBytes(niatProfilePictureFile, MAX_PROFILE_UPLOAD_FILE_BYTES);
          if (picErr) {
            setNiatProfilePictureError(picErr);
            return;
          }
        }
        if (niatIdCardFile) {
          const idOk =
            niatIdCardFile.type.startsWith('image/') ||
            niatIdCardFile.type === 'application/pdf' ||
            niatIdCardFile.name.toLowerCase().endsWith('.pdf');
          if (!idOk) {
            setNiatIdCardError('Please upload an image (JPG, PNG) or a PDF for ID card.');
            return;
          }
          const idErr = assertFileUnderMaxBytes(niatIdCardFile, MAX_PROFILE_UPLOAD_FILE_BYTES);
          if (idErr) {
            setNiatIdCardError(idErr);
            return;
          }
        }
        const formData = new FormData();
        formData.append('student_id_number', editForm.student_id_number ?? '');
        if (editForm.campus_id) {
          formData.append('campus', String(editForm.campus_id));
        }
        formData.append('linkedin_profile', editForm.linkedin_profile ?? '');
        if (niatIdCardFile) {
          formData.append('id_card_file', niatIdCardFile);
        }
        if (niatProfilePictureFile) {
          formData.append('profile_picture', niatProfilePictureFile);
        }
        await upsertNiatProfile(formData);
        const refreshed = await getMyProfile();
        const refreshedProfile = refreshed?.profile as {
          student_id_number?: string | null;
          campus?: { id?: string | number; name?: string } | null;
          campus_name?: string | null;
          linkedin_profile?: string | null;
          id_card_file?: string | null;
          profile_picture?: string | null;
        } | null;
        setEditForm((prev) => ({
          ...prev,
          student_id_number: refreshedProfile?.student_id_number ?? prev.student_id_number,
          campus_id: refreshedProfile?.campus?.id != null ? String(refreshedProfile.campus.id) : prev.campus_id,
          campus_name: refreshedProfile?.campus?.name ?? refreshedProfile?.campus_name ?? prev.campus_name,
          linkedin_profile: refreshedProfile?.linkedin_profile ?? prev.linkedin_profile,
        }));
        setCampusLabel(refreshedProfile?.campus?.name ?? refreshedProfile?.campus_name ?? campusLabel);
        setNiatIdCardUrl(resolveMediaUrl(refreshedProfile?.id_card_file) ?? niatIdCardUrl);
        setNiatIdCardFile(null);
        setNiatProfilePictureUrl(resolveMediaUrl(refreshedProfile?.profile_picture) ?? niatProfilePictureUrl);
        setNiatProfilePictureFile(null);
      }
      setSaved(true);
      notify.success('Profile updated successfully.');
    } catch (err: unknown) {
      const msg = parseBackendError(err);
      setProfileSaveError(msg);
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      setSettingsError('Current password is required.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 8) {
      setSettingsError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSettingsError('New password and confirm password do not match.');
      return;
    }
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      const res = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      notify.success(res.detail || 'Password updated successfully.');
      setSettingsMessage(res.detail);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      const res = err as { response?: { data?: { detail?: string; current_password?: string; new_password?: string } } };
      const msg =
        res?.response?.data?.current_password ||
        res?.response?.data?.new_password ||
        res?.response?.data?.detail ||
        'Failed to update password.';
      setSettingsError(msg);
      notify.error(msg);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveIntermediate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIntermediateStudent || intermediateSaving) return;
    if (!intermediateForm.branch) return;
    setIntermediateSaving(true);
    setIntermediateSaved(false);
    try {
      const updated = await upsertIntermediateProfile({
        college_name: intermediateForm.college_name.trim(),
        branch: intermediateForm.branch as 'MPC' | 'BIPC' | 'OTHERS',
        branch_other: intermediateForm.branch === 'OTHERS' ? intermediateForm.branch_other.trim() : '',
      });
      setIntermediateForm({
        college_name: updated.college_name,
        branch: updated.branch,
        branch_other: updated.branch_other ?? '',
      });
      setIntermediateSaved(true);
      notify.success('Intermediate profile saved.');
    } catch (err: unknown) {
      notify.error(parseBackendError(err));
    } finally {
      setIntermediateSaving(false);
    }
  };

  const handleCheckUsername = async () => {
    if (!newUsername.trim()) {
      setSettingsError('Enter a username to check.');
      return;
    }
    setUsernameChecking(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      const res = await checkUsernameAvailability(newUsername);
      setUsernameAvailable(res.available);
      if (res.available) {
        notify.success('Username is available.');
        setSettingsMessage('Username is available.');
      } else {
        notify.error('Username is not available.');
        setSettingsError('Username is not available.');
      }
    } catch {
      notify.error('Failed to check username availability.');
      setSettingsError('Failed to check username availability.');
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setSettingsError('Username is required.');
      return;
    }
    if (usernameAvailable === false) {
      setSettingsError('Please choose an available username.');
      return;
    }
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      await updateMeProfile({ username: newUsername.trim() });
      const updatedMe = await fetchMe();
      setMe(updatedMe);
      notify.success('Username updated successfully.');
      setSettingsMessage('Username has been updated.');
      setNewUsername('');
      setUsernameAvailable(null);
    } catch {
      notify.error('Failed to update username.');
      setSettingsError('Failed to update username.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleRequestPhoneOtp = async () => {
    const digits = newPhoneNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      setSettingsError('Mobile number must be exactly 10 digits.');
      return;
    }
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      const res = await requestChangePhoneOtp(digits);
      setPhoneOtpSent(true);
      notify.success(res.detail || 'Verification code sent to your new number.');
      setSettingsMessage(res.detail);
    } catch (err: unknown) {
      const res = err as { response?: { data?: { detail?: string; phone_number?: string } } };
      const msg = res?.response?.data?.phone_number || res?.response?.data?.detail || 'Failed to send OTP.';
      setSettingsError(msg);
      notify.error(msg);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleConfirmPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = newPhoneNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      setSettingsError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!phoneOtpCode.trim()) {
      setSettingsError('OTP code is required.');
      return;
    }
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      const res = await confirmChangePhone(digits, phoneOtpCode.trim());
      const updatedMe = await fetchMe();
      setMe(updatedMe);
      notify.success(res.detail || 'Mobile number updated successfully.');
      setSettingsMessage(res.detail);
      setPhoneOtpSent(false);
      setPhoneOtpCode('');
      setNewPhoneNumber('');
    } catch (err: unknown) {
      const res = err as { response?: { data?: { detail?: string; phone_number?: string; code?: string } } };
      const msg =
        res?.response?.data?.phone_number ||
        res?.response?.data?.code ||
        res?.response?.data?.detail ||
        'Failed to update phone number.';
      setSettingsError(msg);
      notify.error(msg);
    } finally {
      setSettingsLoading(false);
    }
  };

  if (!me) return null;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-[#1e293b]">Profile</h1>
            <FoundingEditorBadge badge={badge} />
            {isVerifiedNiatStudent && (
              <button
                type="button"
                onClick={() => setShowBadgeModal(true)}
                className="text-xs font-medium text-[#0a66c2] hover:underline bg-transparent border-none cursor-pointer"
              >
                Open share badge
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(true);
              setSettingsError(null);
              setSettingsMessage(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(153,27,27,0.25)] px-3 py-2 text-[#991b1b] hover:bg-[#fbf2f3] transition-colors"
            aria-label="Open profile settings"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
        <p className="text-[#64748b] mb-8">Your account and profile details.</p>

        <section className="mb-8 p-6 rounded-xl border border-[rgba(30,41,59,0.1)]">
          <h2 className="font-display text-lg font-semibold text-[#1e293b] mb-4">Account</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-[#64748b]">Username</dt>
              <dd className="font-medium text-[#1e293b]">{me.username}</dd>
            </div>
            {me.email && (
              <div>
                <dt className="text-[#64748b]">Email</dt>
                <dd className="font-medium text-[#1e293b]">{me.email}</dd>
              </div>
            )}
            <div>
              <dt className="text-[#64748b]">Role</dt>
              <dd className="font-medium text-[#1e293b]">{me.role.replace('_', ' ')}</dd>
            </div>
            {campusLabel && (
              <div>
                <dt className="text-[#64748b]">Campus</dt>
                <dd className="font-medium text-[#1e293b]">{campusLabel}</dd>
              </div>
            )}
          </dl>
        </section>

        {isIntermediateStudent && (
          <section className="p-6 rounded-xl border border-[rgba(30,41,59,0.1)]">
            <h2 className="font-display text-lg font-semibold text-[#1e293b] mb-4">Profile information</h2>
            {intermediateLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
              </div>
            ) : (
              <form onSubmit={handleSaveIntermediate} className="space-y-4">
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-[#1e293b] mb-1">
                    Branch
                  </label>
                  <select
                    id="branch"
                    value={intermediateForm.branch}
                    onChange={(e) =>
                      setIntermediateForm((f) => ({ ...f, branch: e.target.value as 'MPC' | 'BIPC' | 'OTHERS' | '' }))
                    }
                    className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    required
                  >
                    <option value="">Select branch</option>
                    {INTERMEDIATE_BRANCH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {intermediateForm.branch === 'OTHERS' && (
                  <div>
                    <label htmlFor="branch_other" className="block text-sm font-medium text-[#1e293b] mb-1">
                      Other branch
                    </label>
                    <input
                      id="branch_other"
                      type="text"
                      value={intermediateForm.branch_other}
                      onChange={(e) => setIntermediateForm((f) => ({ ...f, branch_other: e.target.value }))}
                      className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                      placeholder="Enter your branch"
                      required
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="college_name" className="block text-sm font-medium text-[#1e293b] mb-1">
                    College name
                  </label>
                  <input
                    id="college_name"
                    type="text"
                    value={intermediateForm.college_name}
                    onChange={(e) => setIntermediateForm((f) => ({ ...f, college_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    placeholder="Enter your college name"
                    required
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={intermediateSaving}
                    className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d] disabled:opacity-60"
                  >
                    {intermediateSaving ? 'Saving…' : 'Save'}
                  </button>
                  {intermediateSaved && <span className="text-sm text-green-600">Saved.</span>}
                </div>
              </form>
            )}
          </section>
        )}

        {(isVerifiedNiatStudent || isNiatStudent) && (
          <section className="p-6 rounded-xl border border-[rgba(30,41,59,0.1)]">
            <h2 className="font-display text-lg font-semibold text-[#1e293b] mb-4">Profile details</h2>
            {profileLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                {profileSaveError && (
                  <p className="text-sm text-red-600 rounded-md border border-red-200 bg-red-50 px-3 py-2" role="alert">
                    {profileSaveError}
                  </p>
                )}
                <div>
                  <label id="profile_campus_label" className="block text-sm font-medium text-[#1e293b] mb-1">
                    Campus
                  </label>
                  <CampusSelector
                    value={editForm.campus_id != null ? String(editForm.campus_id) : null}
                    onChange={(id) => setEditForm((f) => ({ ...f, campus_id: id }))}
                  />
                </div>
                <div>
                  <label htmlFor="student_id_number" className="block text-sm font-medium text-[#1e293b] mb-1">
                    Student ID number
                  </label>
                  <input
                    id="student_id_number"
                    type="text"
                    value={editForm.student_id_number ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, student_id_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    placeholder="Enter your NIAT student ID"
                  />
                </div>
                <div>
                  <label htmlFor="linkedin_profile" className="block text-sm font-medium text-[#1e293b] mb-1">
                    LinkedIn profile
                  </label>
                  <input
                    id="linkedin_profile"
                    type="url"
                    value={editForm.linkedin_profile}
                    onChange={(e) => setEditForm((f) => ({ ...f, linkedin_profile: e.target.value }))}
                    className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                {(isNiatStudent || isVerifiedNiatStudent) && (
                  <div>
                    <label htmlFor="niat_id_card" className="block text-sm font-medium text-[#1e293b] mb-1">
                      ID card
                    </label>
                    {niatIdCardUrl && (
                      <p className="mb-2 text-xs text-[#334155]">
                        Current file: <a href={niatIdCardUrl} target="_blank" rel="noreferrer" className="text-[#0a66c2] hover:underline">View uploaded ID card</a>
                      </p>
                    )}
                    <input
                      id="niat_id_card"
                      type="file"
                      accept="image/*,application/pdf,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setNiatIdCardFile(null);
                          setNiatIdCardError(null);
                          return;
                        }
                        const tooBig = assertFileUnderMaxBytes(file, MAX_PROFILE_UPLOAD_FILE_BYTES);
                        if (tooBig) {
                          setNiatIdCardError(tooBig);
                          e.target.value = '';
                          setNiatIdCardFile(null);
                          return;
                        }
                        const ok =
                          file.type.startsWith('image/') ||
                          file.type === 'application/pdf' ||
                          file.name.toLowerCase().endsWith('.pdf');
                        if (!ok) {
                          setNiatIdCardError('Please upload an image (JPG, PNG) or a PDF.');
                          e.target.value = '';
                          setNiatIdCardFile(null);
                          return;
                        }
                        setNiatIdCardFile(file);
                        setNiatIdCardError(null);
                      }}
                      className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    />
                    <p className="text-sm text-gray-500 mt-1">{FILE_SIZE_HINT_ID_CARD}</p>
                    {niatIdCardError && (
                      <p className="mt-1 text-xs text-red-600">{niatIdCardError}</p>
                    )}
                  </div>
                )}
                {(isNiatStudent || isVerifiedNiatStudent) && (
                  <div>
                    <label htmlFor="niat_profile_picture" className="block text-sm font-medium text-[#1e293b] mb-1">
                      Profile picture
                    </label>
                    {niatProfilePictureUrl && (
                      <div className="mb-2">
                        <img
                          src={niatProfilePictureUrl}
                          alt="Current profile"
                          className="h-20 w-20 rounded-full object-cover border border-[rgba(30,41,59,0.2)]"
                        />
                      </div>
                    )}
                    <input
                      id="niat_profile_picture"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setNiatProfilePictureFile(null);
                          setNiatProfilePictureError(null);
                          return;
                        }
                        const tooBig = assertFileUnderMaxBytes(file, MAX_PROFILE_UPLOAD_FILE_BYTES);
                        if (tooBig) {
                          setNiatProfilePictureError(tooBig);
                          e.target.value = '';
                          setNiatProfilePictureFile(null);
                          return;
                        }
                        if (!file.type.startsWith('image/')) {
                          setNiatProfilePictureError('Only image files are allowed.');
                          e.target.value = '';
                          setNiatProfilePictureFile(null);
                          return;
                        }
                        setNiatProfilePictureFile(file);
                        setNiatProfilePictureError(null);
                      }}
                      className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    />
                    <p className="text-sm text-gray-500 mt-1">{FILE_SIZE_HINT_PROFILE_IMAGE}</p>
                    {niatProfilePictureError && (
                      <p className="mt-1 text-xs text-red-600">{niatProfilePictureError}</p>
                    )}
                  </div>
                )}
                {isVerifiedNiatStudent && (
                  <div>
                    <label htmlFor="year_joined" className="block text-sm font-medium text-[#1e293b] mb-1">
                      Year of joining
                    </label>
                    <select
                      id="year_joined"
                      value={editForm.year_joined ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, year_joined: e.target.value ? parseInt(e.target.value, 10) : null }))}
                      className="w-full px-3 py-2 border border-[rgba(30,41,59,0.2)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    >
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d] disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  {saved && <span className="text-sm text-green-600">Saved.</span>}
                </div>
              </form>
            )}
          </section>
        )}
      </div>
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[rgba(30,41,59,0.1)] bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(30,41,59,0.1)]">
              <h2 className="font-display text-lg font-semibold text-[#1e293b]">Profile Settings</h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-md text-[#64748b] hover:text-[#1e293b] hover:bg-[#f8fafc]"
                aria-label="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 pt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <button type="button" onClick={() => setSettingsTab('password')} className={`px-3 py-1.5 rounded-lg text-sm border ${settingsTab === 'password' ? 'bg-[#fbf2f3] border-[#991b1b] text-[#991b1b]' : 'border-[rgba(30,41,59,0.15)] text-[#475569]'}`}>Change Password</button>
                <button type="button" onClick={() => setSettingsTab('username')} className={`px-3 py-1.5 rounded-lg text-sm border ${settingsTab === 'username' ? 'bg-[#fbf2f3] border-[#991b1b] text-[#991b1b]' : 'border-[rgba(30,41,59,0.15)] text-[#475569]'}`}>Change Username</button>
                <button type="button" onClick={() => setSettingsTab('phone')} className={`px-3 py-1.5 rounded-lg text-sm border ${settingsTab === 'phone' ? 'bg-[#fbf2f3] border-[#991b1b] text-[#991b1b]' : 'border-[rgba(30,41,59,0.15)] text-[#475569]'}`}>Change Phone</button>
              </div>
            </div>

            <div className="px-5 pb-5">
              {settingsTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                  <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                  <button type="submit" disabled={settingsLoading} className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d] disabled:opacity-60">
                    {settingsLoading ? 'Saving...' : 'Update password'}
                  </button>
                </form>
              )}

              {settingsTab === 'username' && (
                <form onSubmit={handleChangeUsername} className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" value={newUsername} onChange={(e) => { setNewUsername(e.target.value); setUsernameAvailable(null); }} placeholder="New username" className="flex-1 rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                    <button type="button" onClick={handleCheckUsername} disabled={usernameChecking || !newUsername.trim()} className="px-3 py-2 rounded-lg border border-[#991b1b] text-[#991b1b] text-sm hover:bg-[#fbf2f3] disabled:opacity-60">
                      {usernameChecking ? 'Checking...' : 'Check'}
                    </button>
                  </div>
                  {usernameAvailable === true && <p className="text-sm text-green-600">Username is available.</p>}
                  {usernameAvailable === false && <p className="text-sm text-red-600">Username is not available.</p>}
                  <button type="submit" disabled={settingsLoading || !newUsername.trim()} className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d] disabled:opacity-60">
                    {settingsLoading ? 'Saving...' : 'Update username'}
                  </button>
                </form>
              )}

              {settingsTab === 'phone' && (
                <form onSubmit={handleConfirmPhone} className="space-y-3">
                  <div className="flex gap-2">
                    <input type="tel" inputMode="numeric" maxLength={10} value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="New mobile number" className="flex-1 rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                    <button type="button" onClick={handleRequestPhoneOtp} disabled={settingsLoading || newPhoneNumber.replace(/\D/g, '').length !== 10} className="px-3 py-2 rounded-lg border border-[#991b1b] text-[#991b1b] text-sm hover:bg-[#fbf2f3] disabled:opacity-60">
                      {settingsLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                  {phoneOtpSent && (
                    <input type="text" inputMode="numeric" maxLength={6} value={phoneOtpCode} onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter OTP code" className="w-full rounded-lg border border-[rgba(30,41,59,0.2)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]" />
                  )}
                  <button type="submit" disabled={settingsLoading || !phoneOtpSent || !phoneOtpCode.trim()} className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d] disabled:opacity-60">
                    {settingsLoading ? 'Updating...' : 'Confirm phone update'}
                  </button>
                </form>
              )}

              {settingsError && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">{settingsError}</p>}
              {settingsMessage && <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2.5 rounded-xl">{settingsMessage}</p>}
            </div>
          </div>
        </div>
      )}
      {showBadgeModal && me && (
        <NiatBadgeModal username={me.username} onClose={() => setShowBadgeModal(false)} />
      )}
      <Footer />
    </div>
  );
}
