import type { User } from "./user";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

/** Current user's vote: 1 = upvote, -1 = downvote, null = no vote */
export type UserVote = 1 | -1 | null;

export interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  author: User;
  category: Category | null;
  tags: Tag[];
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  /** 1 = upvoted, -1 = downvoted, null = not voted (or anonymous) */
  user_vote?: UserVote;
}

export interface PaginatedPosts {
  results: Post[];
  next: string | null;
  previous?: string | null;
  /** Total count (e.g. from search API). */
  count?: number;
}
