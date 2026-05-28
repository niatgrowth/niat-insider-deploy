export interface Answer {
  id: string;
  body: string;
  author: {
    username: string;
    is_verified_senior: boolean;
  };
  upvote_count: number;
  downvote_count: number;
  created_at: string;
  updated_at: string;
  user_vote?: 1 | -1 | null;
}

export interface FollowUp {
  id: string;
  body: string;
  author: { username: string; is_verified_senior?: boolean };
  answer_id?: string;
  parent_id?: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  slug: string;
  title: string;
  body?: string;
  category?: string;
  author: { username: string; id: string };
  is_answered: boolean;
  upvote_count: number;
  downvote_count: number;
  view_count: number;
  is_faq?: boolean;
  faq_order?: number;
  created_at: string;
  updated_at?: string;
  answers?: Answer[];
  answer?: Answer | null;
  answer_count?: number;
  user_vote?: 1 | -1 | null;
  has_answer?: boolean;
  followups?: FollowUp[];
}

export interface FAQ extends Question {
  answers: Answer[];
  answer?: Answer | null;
  faq_order: number;
}

export interface PaginatedQuestions {
  next: string | null;
  previous: string | null;
  results: Question[];
}
