import type { AuthRole } from '@/store/authStore';
import type { ReviewsPersona } from '@niat/reviews-ui';
import type { ReviewsUser } from '@/store/reviewsStore';

export function mapInsiderRoleToReviewsPersona(
  role: AuthRole | string | null,
  isVerifiedSenior: boolean
): ReviewsPersona | null {
  if (role === 'verified_niat_student' || isVerifiedSenior) {
    return 'senior';
  }
  if (
    role === 'intermediate_student' ||
    role === 'niat_student' ||
    role === 'moderator' ||
    role === 'admin'
  ) {
    return 'prospective';
  }
  return null;
}

export function toReviewsUiUser(user: ReviewsUser) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    is_verified_senior: user.is_verified_senior,
  };
}
