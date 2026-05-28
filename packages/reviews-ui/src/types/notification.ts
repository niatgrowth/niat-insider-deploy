import type { User } from "./user";

export interface NotificationTarget {
  type: "post" | "comment";
  id: string;
  title?: string;
  slug?: string;
  body?: string;
  post_slug?: string;
  post_title?: string;
}

export interface Notification {
  id: string;
  actor: User;
  verb: string;
  target_data: NotificationTarget | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface UnreadCount {
  count: number;
}
