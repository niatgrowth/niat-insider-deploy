import type { AuthRole } from '@/store/authStore';

export const Permissions = {
  canAskQuestion: (role: AuthRole | null): boolean =>
    !!role && role !== 'verified_niat_student',

  canAnswerQuestion: (role: AuthRole | null): boolean =>
    role === 'verified_niat_student',

  canSeeSeniorDashboard: (role: AuthRole | null): boolean =>
    role === 'verified_niat_student',

  canSeeMyAnswers: (role: AuthRole | null): boolean =>
    role === 'verified_niat_student',

  showSeniorBadge: (is_verified_senior: boolean): boolean =>
    is_verified_senior === true,

  isModerator: (role: AuthRole | null): boolean =>
    role === 'moderator' || role === 'admin',
};
