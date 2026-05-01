import { Metadata } from "next";
import LeaderboardPageClient from "./LeaderboardPageClient";

export const metadata: Metadata = {
  title: "Leaderboard | NIAT Insider",
  description: "Celebrate the top contributors across the NIAT ecosystem and see where you stand.",
};

export default function LeaderboardPage() {
  return <LeaderboardPageClient />;
}
