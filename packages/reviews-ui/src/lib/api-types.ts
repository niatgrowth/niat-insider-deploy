import type { PaginatedQuestions, Question } from '@niat/reviews-ui/types/question';

export type { PaginatedQuestions, Question };

export type FollowUp = {
  id: string;
  body: string;
  author: { username: string; is_verified_senior?: boolean };
  answer_id?: string;
  parent_id?: string | null;
  created_at: string;
};

export type SeniorDashboardStats = {
  my_answers?: { total: number };
  pending_questions?: Question[];
  follower_count?: number;
  recent_followups?: Array<{
    id?: string;
    question_slug?: string;
    question_title?: string;
    body?: string;
    created_at: string;
  }>;
  answer_upvotes_total?: number;
};

export type UnreadCountResponse = { count?: number; unread_count?: number };

export interface ReviewsApiClient {
  getQuestions(params: Record<string, string>): Promise<PaginatedQuestions>;
  searchQuestions(params: { q: string; ordering?: string; page_size?: string; cursor?: string }): Promise<PaginatedQuestions>;
  getSearchSuggestions?(q: string): Promise<Question[]>;
  getQuestionCategories(): Promise<string[]>;
  getFAQs(limit?: number): Promise<Question[]>;
  getQuestionDetail(slug: string): Promise<Question>;
  createQuestion(payload: { title: string; body?: string }): Promise<Question>;
  submitAnswer(slug: string, body: string): Promise<unknown>;
  upvoteQuestion(slug: string): Promise<unknown>;
  downvoteQuestion(slug: string): Promise<unknown>;
  getSeniorDashboard(): Promise<SeniorDashboardStats>;
  fetchUnreadCount(): Promise<UnreadCountResponse>;
  fetchNotifications(page?: number, unreadOnly?: boolean): Promise<unknown>;
  markNotificationRead(id: string): Promise<unknown>;
  markAllNotificationsRead(): Promise<unknown>;
}
