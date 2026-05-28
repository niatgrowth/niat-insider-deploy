import { create } from 'zustand';

export interface ReviewsUser {
  id: string;
  username: string;
  email: string | null;
  phone_number: string | null;
  role: string;
  is_verified_senior: boolean;
  is_onboarded: boolean;
  niat_review_completed: boolean;
  needs_password_set: boolean;
  profile: Record<string, unknown> | null;
  badge: { type: string; awarded_at: string } | null;
}

interface ReviewsState {
  reviewsUser: ReviewsUser | null;
  isLoading: boolean;
  error: string | null;
  setReviewsUser: (user: ReviewsUser) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearReviewsUser: () => void;
}

export const useReviewsStore = create<ReviewsState>((set) => ({
  reviewsUser: null,
  isLoading: true,
  error: null,
  setReviewsUser: (user) => set({ reviewsUser: user, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearReviewsUser: () => set({ reviewsUser: null, isLoading: false, error: null }),
}));
