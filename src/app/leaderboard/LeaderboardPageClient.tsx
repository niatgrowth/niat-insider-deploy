"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Trophy,
  MapPin,
  School,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  useIndividualLeaderboard,
  useCampusLeaderboard,
  useMyCampusLeaderboard
} from "@/hooks/useLeaderboard";
import { useAuthStore } from "@/store/authStore";
import { fetchFoundingEditorProfile } from "@/lib/authApi";
import { getAuthorProfileHref } from "@/lib/authorRoute";
import type {
  LeaderboardEntry,
  CampusLeaderboardEntry,
  UserRank
} from "@/types/leaderboard";

// ─── Color Utilities ─────────────────────────────────────────────────────────
const getAvatarGradient = (initial: string) => {
  const charCode = initial.charCodeAt(0) || 0;
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-400 to-teal-600",
    "from-rose-400 to-red-600",
    "from-violet-500 to-purple-700",
    "from-pink-500 to-rose-600",
    "from-cyan-400 to-blue-600",
    "from-fuchsia-500 to-purple-600",
  ];
  return gradients[charCode % gradients.length];
};

type Tab = "overall" | "campuses" | "my-campus";

const formatName = (slug: string) => (slug || "").replace(/-/g, " ").toUpperCase();

/** Shared shape for podium + table rows (student or campus). */
type LeaderboardRowDisplay = {
  position: number | string;
  href: string;
  displayName: string;
  initial: string;
  article_count: number;
  isUser?: boolean;
  isOutsideTop10?: boolean;
};

function entryToDisplay(entry: LeaderboardEntry, username?: string): LeaderboardRowDisplay {
  const isUser = username && entry.author_username ? entry.author_username.toLowerCase() === username.toLowerCase() : false;
  // Fallback to author_username if author_profile_slug is missing to avoid 404s
  const slugToUse = entry.author_profile_slug || entry.author_username || "";
  return {
    position: entry.position,
    href: getAuthorProfileHref(slugToUse),
    displayName: formatName(slugToUse),
    initial: slugToUse.charAt(0).toUpperCase(),
    article_count: entry.article_count,
    isUser,
  };
}

function campusToDisplay(campus: CampusLeaderboardEntry, userCampusName: string | null): LeaderboardRowDisplay {
  const name = (campus.campus_name || "").trim();
  const isUser = campus.is_user_campus || (userCampusName && name.toLowerCase() === userCampusName.toLowerCase());
  return {
    position: campus.position,
    href: `/${campus.campus_slug}`,
    displayName: name.toUpperCase(),
    initial: (name.charAt(0) || "?").toUpperCase(),
    article_count: campus.article_count,
    isUser: !!isUser,
  };
}

export default function LeaderboardPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("overall");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  const username = user?.username;

  // Fetch campus name from profile
  const [campusName, setCampusName] = useState<string | null>(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchFoundingEditorProfile().then((profile) => {
      if (profile?.campus_name) setCampusName(profile.campus_name);
    });
  }, [isAuthenticated]);

  const { data: individualData, isLoading: individualLoading, error: individualError } = useIndividualLeaderboard();
  const { data: campusesData, isLoading: campusesLoading, error: campusesError } = useCampusLeaderboard();
  const { data: myCampusData, isLoading: myCampusLoading, error: myCampusError } = useMyCampusLeaderboard(isAuthenticated && activeTab === "my-campus");

  const viewTitle = useMemo(() => {
    if (activeTab === "campuses") return "Campus Rankings";
    if (activeTab === "my-campus") return campusName ? `${campusName} Leaders` : "My Campus Leaderboard";
    return "Global Contributors";
  }, [activeTab, campusName]);

  const hero = useMemo(() => {
    if (activeTab === "campuses") {
      return {
        title: (
          <>
            Top{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
              Campuses
            </span>
          </>
        ),
        subtitle:
          "Leading NIAT campuses ranked by total published articles from student contributors.",
      };
    }
    return {
      title: (
        <>
          Top{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
            AI Champions
          </span>
        </>
      ),
      subtitle:
        "These highest-ranked students are those who consistently build, innovate, and perform.",
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-indigo-50/20">
      <Navbar />

      {/* Sticky Tab Bar - directly below navbar */}
      <div className="sticky top-0 z-30 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-sm shadow-slate-900/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end gap-2 py-3">
            <TabButton active={activeTab === "overall"} onClick={() => setActiveTab("overall")} icon={<Trophy className="h-4 w-4" />} label="Overall" />
            <TabButton active={activeTab === "campuses"} onClick={() => setActiveTab("campuses")} icon={<MapPin className="h-4 w-4" />} label="Campuses" />
            <TabButton
              active={activeTab === "my-campus"}
              onClick={() => setActiveTab("my-campus")}
              icon={<School className="h-4 w-4" />}
              label={campusName ? campusName : "My Campus"}
              disabled={!isAuthenticated}
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

        {/* Header */}
        <header className="mb-14 text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            {hero.title}
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed font-medium">{hero.subtitle}</p>
        </header>

        <div className="space-y-16">
          {activeTab === "overall" && (
            <IndividualView data={individualData} isLoading={individualLoading} error={individualError} title={viewTitle} username={username} />
          )}
          {activeTab === "campuses" && (
            <CampusesView
              data={campusesData}
              isLoading={campusesLoading}
              error={campusesError}
              userCampusName={campusName}
              isAuthenticated={isAuthenticated}
              tableTitle={viewTitle}
            />
          )}
          {activeTab === "my-campus" && (
            <IndividualView data={myCampusData} isLoading={myCampusLoading} error={myCampusError} title={viewTitle} requiresAuth username={username} />
          )}
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({ active, onClick, icon, label, disabled = false }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean;
}) {
  if (disabled) {
    return (
      <button disabled className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-400 bg-slate-100/50 cursor-not-allowed">
        {icon} {label}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${active
          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-1 ring-slate-800"
          : "text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-md hover:shadow-slate-900/5 border border-transparent hover:border-slate-200"
        }`}
    >
      {icon} {label}
    </button>
  );
}

// ─── Podium ───────────────────────────────────────────────────────────────────
function Podium({ top3 }: { top3: LeaderboardRowDisplay[] }) {
  const first = top3.find((u) => u.position === 1);
  const second = top3.find((u) => u.position === 2);
  const third = top3.find((u) => u.position === 3);

  if (!first && !second && !third) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-8 shadow-2xl shadow-slate-900/[0.04] ring-1 ring-slate-900/5 md:p-12 mb-8">
      {/* Warm + cool ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-amber-200/20 via-orange-100/10 to-indigo-200/15 blur-[100px]" />

      <div className="relative flex flex-col items-center justify-center gap-4 md:flex-row md:items-end md:gap-0 mt-4">
        {/* Rank 2 */}
        {second && (
          <div className="order-2 flex w-full max-w-[220px] flex-col items-center md:order-1 z-10">
            <PodiumAvatar row={second} />
            <div className="flex h-32 w-full items-center justify-center rounded-t-3xl border-x border-t border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50 md:h-40 shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)]">
              <span className="select-none bg-gradient-to-b from-slate-400 to-slate-600 bg-clip-text text-6xl font-black text-transparent drop-shadow-sm md:text-7xl">
                2
              </span>
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {first && (
          <div className="order-1 z-20 flex w-full max-w-[240px] flex-col items-center md:order-2 md:-mx-4">
            <div className="mb-3">
              <Trophy className="h-9 w-9 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            </div>
            <PodiumAvatar row={first} isFirst />
            <div className="relative flex h-48 w-full items-center justify-center rounded-t-3xl border-x border-t border-amber-300/80 bg-gradient-to-b from-amber-100 via-amber-50/50 to-amber-50 md:h-56 shadow-[inset_0_4px_20px_rgba(245,158,11,0.1)]">
              <span className="select-none text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-600 via-amber-700 to-orange-800 drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
                1
              </span>
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50" />
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {third && (
          <div className="order-3 flex w-full max-w-[220px] flex-col items-center z-10">
            <PodiumAvatar row={third} />
            <div className="flex h-24 w-full items-center justify-center rounded-t-3xl border-x border-t border-orange-200/80 bg-gradient-to-b from-orange-50 to-orange-50/30 md:h-32 shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)]">
              <span className="select-none bg-gradient-to-b from-orange-500 to-amber-700 bg-clip-text text-5xl font-black text-transparent drop-shadow-sm md:text-6xl">
                3
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Podium Avatar ────────────────────────────────────────────────────────────
function PodiumAvatar({ row, isFirst = false }: { row: LeaderboardRowDisplay; isFirst?: boolean }) {
  const isClickable = !row.href.startsWith("/author/");

  const content = (
    <>
      <div className={`relative mb-3 ${isFirst ? "h-20 w-20" : "h-16 w-16"}`}>
        {isFirst && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-amber-400/40 to-orange-500/30 blur-md" />
        )}
        <div
          className={`flex h-full w-full items-center justify-center rounded-full border-4 shadow-xl transition-transform duration-300 group-hover:scale-110 ${isFirst
              ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-100 shadow-amber-500/20"
              : "border-white bg-gradient-to-br from-slate-50 to-slate-100 shadow-slate-900/10"
            }`}
        >
          <span
            className={`font-black ${isFirst ? "bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-3xl text-transparent" : "text-xl text-slate-600"}`}
          >
            {row.initial}
          </span>
        </div>
      </div>

      <p className={`mb-2 max-w-[140px] truncate text-center text-sm font-black text-slate-800 transition-colors group-hover:text-indigo-950`}>{row.displayName}</p>

      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 shadow-sm transition-all duration-300 ${
        isFirst ? "bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/80 text-amber-900 shadow-amber-500/20" : `bg-white border border-slate-200 text-slate-700 group-hover:border-indigo-200 group-hover:shadow-indigo-900/5`
      }`}>
        <FileText size={10} className={isFirst ? "text-amber-600" : `text-slate-400 group-hover:text-indigo-500 transition-colors`} />
        <span className="text-sm font-black">{row.article_count}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Articles</span>
      </div>
    </>
  );

  return (
    <div className={`relative flex flex-col items-center ${isFirst ? "mt-0 z-10" : "mt-8 opacity-90"}`}>
      {row.isUser && (
        <span className="absolute -top-3 right-0 bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm shadow-amber-500/30 rounded-md z-20">
          YOU
        </span>
      )}
      {isClickable ? (
        <Link href={row.href} className="flex flex-col items-center group">
          {content}
        </Link>
      ) : (
        <div className="flex flex-col items-center group cursor-default">
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Individual View ──────────────────────────────────────────────────────────
function IndividualView({ data, isLoading, error, title, requiresAuth = false, username }: {
  data?: { top10: LeaderboardEntry[]; your_rank: UserRank | null };
  isLoading: boolean;
  error: unknown;
  title: string;
  requiresAuth?: boolean;
  username?: string;
}) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load rankings" />;
  if (!data && requiresAuth) return <EmptyState message="Please login to see your campus data" />;
  if (!data?.top10 || data.top10.length === 0) return <EmptyState message="No data available yet" />;

  const top3 = data.top10.slice(0, 3).map((e: LeaderboardEntry) => entryToDisplay(e, username));
  const remainingData = data.top10.slice(3).map((e: LeaderboardEntry) => entryToDisplay(e, username));

  let appendedRow: LeaderboardRowDisplay | null = null;
  if (data.your_rank && !data.your_rank.in_top10 && username) {
    appendedRow = {
      position: data.your_rank.position,
      href: getAuthorProfileHref(username),
      displayName: formatName(username),
      initial: username.charAt(0).toUpperCase(),
      article_count: data.your_rank.article_count,
      isUser: true,
      isOutsideTop10: true,
    };
  }

  const remaining = [...remainingData];
  if (appendedRow) {
    remaining.push(appendedRow);
  }

  return (
    <div className="animate-fade-in flex flex-col items-center w-full">
      <div className="w-full">
        <Podium top3={top3} />
      </div>

      <div className="w-full mt-6">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{data.top10.length} Contributors</span>
        </div>
        
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5">
          {/* Header */}
          <div className="grid grid-cols-[80px_1fr_120px] gap-4 border-b border-slate-200/80 bg-slate-50 px-4 sm:px-8 py-5">
            <span className="text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Rank</span>
            <span className="pl-2 sm:pl-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Contributor</span>
            <span className="pr-2 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Score</span>
          </div>
          <div className="flex flex-col bg-white">
            {remaining.map((row) => (
              <RankRow key={`${row.href}-${row.position}`} row={row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rank Row ─────────────────────────────────────────────────────────────────
function RankRow({ row }: { row: LeaderboardRowDisplay }) {
  const rowRef = useRef<any>(null);
  const isClickable = !row.href.startsWith("/author/");

  useEffect(() => {
    // Only auto-scroll if the user's row is outside the top 10 (appended at the bottom)
    if (row.isUser && row.isOutsideTop10) {
      const timer = setTimeout(() => {
        if (rowRef.current) {
          rowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [row.isUser, row.isOutsideTop10]);

  const className = `group grid grid-cols-[80px_1fr_120px] items-center gap-4 px-4 sm:px-8 py-5 transition-all duration-300 ${
    row.isUser
      ? `bg-gradient-to-r from-amber-100 via-orange-50/50 to-amber-100 hover:from-amber-200 hover:via-orange-100/50 hover:to-amber-200 shadow-[inset_0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/60 relative z-10`
      : `bg-gradient-to-r from-slate-50/40 via-white/40 to-slate-50/40 hover:from-indigo-50/60 hover:via-white hover:to-amber-50/60 hover:shadow-lg hover:shadow-indigo-900/5 border border-transparent hover:border-indigo-200/50 backdrop-blur-sm`
  } ${row.isOutsideTop10 ? "border-t-[3px] border-dashed border-amber-300" : "border-b border-slate-200/60 last:border-0"}`;

  const content = (
    <>
      <div className="flex justify-center items-center relative">
        <span className={`text-xl font-black ${row.isUser ? "text-amber-600 drop-shadow-sm" : `text-slate-400 group-hover:text-indigo-500 transition-colors`}`}>
          #{row.position}
        </span>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border shadow-sm transition-transform duration-300 group-hover:scale-110 shrink-0 ${
          row.isUser
            ? "border-amber-400 bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-4 ring-amber-200 ring-offset-2 shadow-amber-500/40"
            : `border-transparent bg-gradient-to-br ${getAvatarGradient(row.initial)} text-white shadow-md group-hover:ring-2 group-hover:ring-indigo-300 group-hover:ring-offset-2 opacity-90 group-hover:opacity-100`
        }`}>
          <span className="text-xl font-black drop-shadow-md">{row.initial}</span>
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className={`text-lg font-bold truncate transition-colors ${
              row.isUser ? "text-amber-900" : `text-slate-700 group-hover:text-indigo-950`
            }`}>
              {row.displayName}
            </p>
            {row.isUser && (
              <span className="inline-flex items-center rounded-md bg-gradient-to-r from-amber-500 to-orange-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm shadow-amber-500/40">
                YOU
              </span>
            )}
          </div>
          {row.isOutsideTop10 && (
            <span className="text-xs font-bold text-amber-600/80 uppercase tracking-widest mt-1">
              Your Current Position
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pr-2">
        <FileText size={18} className={row.isUser ? "text-amber-600" : `text-slate-400 group-hover:text-indigo-400 transition-colors`} />
        <span className={`text-2xl font-black ${row.isUser ? "text-amber-900 drop-shadow-sm" : `text-slate-700 group-hover:text-indigo-900 transition-colors`}`}>
          {row.article_count}
        </span>
      </div>
    </>
  );

  if (isClickable) {
    return (
      <Link ref={rowRef} href={row.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div ref={rowRef} className={`${className} cursor-default`}>
      {content}
    </div>
  );
}

// ─── Campuses View ────────────────────────────────────────────────────────────
function CampusesView({
  data,
  isLoading,
  error,
  userCampusName,
  isAuthenticated,
  tableTitle,
}: {
  data?: { campuses: CampusLeaderboardEntry[] };
  isLoading: boolean;
  error: unknown;
  userCampusName: string | null;
  isAuthenticated: boolean;
  tableTitle: string;
}) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load campus data" />;
  if (!data?.campuses || data.campuses.length === 0) return <EmptyState message="No campus data available" />;

  const sorted = [...data.campuses].sort((a, b) => a.position - b.position);
  // limit the main table to top 10
  const top10Campuses = sorted.slice(0, 10);
  const top3 = top10Campuses.slice(0, 3).map((c) => campusToDisplay(c, userCampusName));
  const remainingData = top10Campuses.slice(3).map((c) => campusToDisplay(c, userCampusName));

  const userCampus =
    sorted.find((c) => c.is_user_campus) ??
    (userCampusName
      ? sorted.find((c) => c.campus_name.toLowerCase() === userCampusName.toLowerCase())
      : undefined);

  let appendedRow: LeaderboardRowDisplay | null = null;
  if (userCampus && userCampus.position > 10) {
    appendedRow = {
      ...campusToDisplay(userCampus, userCampusName),
      isUser: true,
      isOutsideTop10: true,
    };
  }

  const remaining = [...remainingData];
  if (appendedRow) {
    remaining.push(appendedRow);
  }

  return (
    <div className="animate-fade-in flex flex-col items-center w-full">
      <div className="w-full">
        <Podium top3={top3} />
      </div>

      <div className="w-full mt-6">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{tableTitle}</h3>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{top10Campuses.length} Campuses</span>
        </div>
        
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5">
          <div className="grid grid-cols-[80px_1fr_120px] gap-4 border-b border-slate-200/80 bg-slate-50 px-4 sm:px-8 py-5">
            <span className="text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Rank</span>
            <span className="pl-2 sm:pl-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Campus</span>
            <span className="pr-2 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Score</span>
          </div>
          <div className="flex flex-col bg-white">
            {remaining.map((row) => (
              <RankRow key={`${row.href}-${row.position}`} row={row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── States ───────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/60 bg-white py-32 shadow-xl shadow-slate-900/5 backdrop-blur-sm w-full">
      <Loader2 className="mb-4 h-12 w-12 animate-spin text-amber-500" />
      <p className="font-bold text-slate-600 text-lg">Crunching the rankings...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 py-24 shadow-lg shadow-red-900/5 w-full">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <p className="mb-2 font-black text-slate-900 text-xl">Something went wrong</p>
      <p className="text-base text-slate-600 font-medium">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 py-32 backdrop-blur-sm w-full">
      <p className="font-bold text-slate-500 text-lg">{message}</p>
    </div>
  );
}
