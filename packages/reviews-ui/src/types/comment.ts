import type { User } from "./user";

export interface CommentMinimal {
  id: string;
  body: string;
  author: User;
  created_at: string;
}

export interface Comment {
  id: string;
  post: string;
  /** Set when listing comments (e.g. profile); used for link to post */
  post_slug?: string | null;
  post_title?: string | null;
  author: User;
  parent: CommentMinimal | null;
  body: string;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface PaginatedComments {
  results: Comment[];
  next: string | null;
  previous: string | null;
}
