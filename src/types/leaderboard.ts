export interface LeaderboardEntry {
  position: number;
  author_username: string;
  author_profile_slug: string;
  article_count: number;
}

export interface UserRank {
  position: number;
  article_count: number;
  in_top10: boolean;
}

export interface IndividualLeaderboardResponse {
  top10: LeaderboardEntry[];
  your_rank: UserRank | null;
}

export interface CampusLeaderboardEntry {
  position: number;
  campus_name: string;
  campus_slug: string;
  article_count: number;
  is_user_campus: boolean;
}

export interface CampusLeaderboardResponse {
  campuses: CampusLeaderboardEntry[];
}
