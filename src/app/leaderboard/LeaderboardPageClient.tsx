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
  label?: string;
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
    label: "YOU",
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
    label: "MY CAMPUS",
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
            Champions
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

      {/* Sticky Tab Bar - simplified for performance */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
            <TabButton active={activeTab === "overall"} onClick={() => setActiveTab("overall")} icon={<Trophy className="h-3.5 w-3.5" />} label="Overall" />
            <TabButton active={activeTab === "campuses"} onClick={() => setActiveTab("campuses")} icon={<MapPin className="h-3.5 w-3.5" />} label="Campuses" />
            {isAuthenticated && (
              <TabButton
                active={activeTab === "my-campus"}
                onClick={() => setActiveTab("my-campus")}
                icon={<School className="h-3.5 w-3.5" />}
                label={campusName ? campusName : "My Campus"}
              />
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-4 md:py-16 landscape:py-2 md:landscape:py-16">

        {/* Header - responsive for landscape */}
        <header className="mb-4 md:mb-16 text-center animate-fade-in landscape:hidden md:landscape:block">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-2 md:mb-6 tracking-tight">
            {hero.title}
          </h1>
          <p className="text-slate-500 text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium px-4 md:px-0">{hero.subtitle}</p>
        </header>

        <div className="space-y-6 md:space-y-16">
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
            <IndividualView 
              data={myCampusData} 
              isLoading={myCampusLoading} 
              error={myCampusError} 
              title={viewTitle} 
              requiresAuth 
              username={username}
              customErrorMessages={{
                404: "No campus found associated with your profile. Please update your campus in settings."
              }}
            />
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
        
        @media (max-height: 600px) and (orientation: landscape) {
          .landscape\:hidden { display: none !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
      className={`flex items-center gap-1.5 px-3 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap ${active
          ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 ring-1 ring-slate-800"
          : "text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
        }`}
    >
      {icon} <span className="max-w-[80px] md:max-w-none truncate">{label}</span>
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
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200 bg-white p-2 md:p-12 mb-6 shadow-sm landscape:hidden md:landscape:block">
      {/* Simplified ambient glow */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-gradient-to-br from-amber-50/50 to-indigo-50/30" />

      <div className="relative flex flex-row items-end justify-center mt-2">
        {/* Rank 2 */}
        {second && (
          <div className="flex w-1/3 max-w-[120px] md:max-w-[220px] flex-col items-center z-10">
            <PodiumAvatar row={second} />
            <div className={`flex h-14 md:h-32 w-full items-center justify-center rounded-t-2xl md:rounded-t-3xl border-x border-t transition-colors duration-500 ${
              second.isUser 
                ? "border-amber-300 bg-gradient-to-b from-amber-100/50 to-amber-50/30 shadow-[0_-10px_20px_rgba(245,158,11,0.1)]" 
                : "border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50"
            }`}>
              <span className={`select-none text-3xl md:text-7xl font-black transition-colors duration-500 ${
                second.isUser ? "bg-gradient-to-b from-amber-500 to-orange-600 bg-clip-text text-transparent" : "bg-gradient-to-b from-slate-400 to-slate-600 bg-clip-text text-transparent"
              }`}>
                2
              </span>
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {first && (
          <div className="z-20 flex w-[36%] max-w-[140px] md:max-w-[240px] flex-col items-center -mx-1 md:-mx-4">
            <div className="mb-1 md:mb-3">
              <Trophy className={`h-5 w-5 md:h-9 md:w-9 transition-colors duration-500 ${first.isUser ? "text-amber-600 animate-bounce" : "text-amber-500"}`} />
            </div>
            <PodiumAvatar row={first} isFirst />
            <div className={`relative flex h-24 md:h-48 w-full items-center justify-center rounded-t-2xl md:rounded-t-3xl border-x border-t transition-colors duration-500 ${
              first.isUser
                ? "border-amber-400 bg-gradient-to-b from-amber-200/60 via-amber-100/40 to-amber-50/20 shadow-[0_-15px_30px_rgba(245,158,11,0.2)]"
                : "border-amber-300/80 bg-gradient-to-b from-amber-100 via-amber-50/50 to-amber-50"
            }`}>
              <span className="select-none text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-600 via-amber-700 to-orange-800">
                1
              </span>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {third && (
          <div className="flex w-1/3 max-w-[120px] md:max-w-[220px] flex-col items-center z-10">
            <PodiumAvatar row={third} />
            <div className={`flex h-12 md:h-24 w-full items-center justify-center rounded-t-2xl md:rounded-t-3xl border-x border-t transition-colors duration-500 ${
              third.isUser
                ? "border-orange-300 bg-gradient-to-b from-orange-100/50 to-orange-50/30 shadow-[0_-10px_20px_rgba(245,158,11,0.1)]"
                : "border-orange-200/80 bg-gradient-to-b from-orange-50 to-orange-50/30"
            }`}>
              <span className={`select-none text-2xl md:text-6xl font-black transition-colors duration-500 ${
                third.isUser ? "bg-gradient-to-b from-orange-600 to-amber-800 bg-clip-text text-transparent" : "bg-gradient-to-b from-orange-500 to-amber-700 bg-clip-text text-transparent"
              }`}>
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
      <div className={`relative mb-2 ${isFirst ? "h-14 w-14 md:h-20 md:w-20" : "h-12 w-12 md:h-16 md:w-16"}`}>
        {isFirst && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-amber-400/40 to-orange-500/30 blur-md" />
        )}
        <div
          className={`flex h-full w-full items-center justify-center rounded-full border-2 md:border-4 shadow-xl transition-transform duration-300 group-hover:scale-110 ${isFirst
              ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-100 shadow-amber-500/20"
              : "border-white bg-gradient-to-br from-slate-50 to-slate-100 shadow-slate-900/10"
            }`}
        >
          <span
            className={`font-black ${isFirst ? "bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-xl md:text-3xl text-transparent" : "text-base md:text-xl text-slate-600"}`}
          >
            {row.initial}
          </span>
        </div>
      </div>

      <p className={`mb-1 max-w-[100px] md:max-w-[140px] truncate text-center text-[10px] md:text-sm font-black text-slate-800 transition-colors group-hover:text-indigo-950`}>{row.displayName}</p>

      <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-sm transition-all duration-300 ${
        isFirst ? "bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/80 text-amber-900 shadow-amber-500/20" : `bg-white border border-slate-200 text-slate-700 group-hover:border-indigo-200 group-hover:shadow-indigo-900/5`
      }`}>
        <FileText size={10} className={isFirst ? "text-amber-600" : `text-slate-400 group-hover:text-indigo-500 transition-colors`} />
        <span className="text-xs font-black">{row.article_count}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Articles</span>
      </div>
    </>
  );

  return (
    <div className={`relative flex flex-col items-center ${isFirst ? "mt-0 z-10" : "opacity-90"}`}>
      {row.isUser && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-orange-600 px-2 py-0.5 text-[7px] md:text-[10px] font-black uppercase tracking-wider text-white shadow-md rounded-md z-20 border border-white/20 whitespace-nowrap">
          {row.label || "YOU"}
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
function IndividualView({ data, isLoading, error, title, requiresAuth = false, username, customErrorMessages }: {
  data?: { top10: LeaderboardEntry[]; your_rank: UserRank | null };
  isLoading: boolean;
  error: any;
  title: string;
  requiresAuth?: boolean;
  username?: string;
  customErrorMessages?: Record<number, string>;
}) {
  if (isLoading) return <LoadingState />;
  
  if (error) {
    const status = error.response?.status;
    const message = (status && customErrorMessages?.[status]) || "Failed to load rankings";
    return <ErrorState message={message} />;
  }

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
    <div className="animate-fade-in flex flex-col items-center w-full max-w-full overflow-hidden">
      <div className="w-full px-2 sm:px-0">
        <Podium top3={top3} />
      </div>

      <div className="w-full mt-4 md:mt-8">
        <div className="flex items-center justify-between mb-4 md:mb-6 px-4">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          <span className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">{data.top10.length} Contributors</span>
        </div>
        
        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5 mx-2 sm:mx-0">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_100px] md:grid-cols-[80px_1fr_120px] gap-2 md:gap-4 border-b border-slate-200/80 bg-slate-50 px-4 md:px-8 py-4 md:py-5">
            <span className="text-center text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Rank</span>
            <span className="pl-1 md:pl-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Contributor</span>
            <span className="pr-1 text-right text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Score</span>
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
  const isClickable = !row.href.startsWith("/author/");

  // Removed auto-scroll logic to fix scroll glitches and jumps

  const className = `group grid grid-cols-[50px_1fr_90px] md:grid-cols-[80px_1fr_120px] items-center gap-2 md:gap-4 px-3 md:px-8 py-2.5 md:py-5 transition-all duration-300 ${
    row.isUser
      ? `bg-amber-100/40 hover:bg-amber-100/60 relative z-10 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]`
      : `bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200`
  } ${row.isOutsideTop10 ? "border-t-[3px] border-dashed border-amber-300" : "border-b border-slate-200/60 last:border-0"}`;

  const content = (
    <>
      <div className="flex justify-center items-center relative">
        <span className={`text-lg md:text-xl font-black ${row.isUser ? "text-amber-600 drop-shadow-sm" : `text-slate-400 group-hover:text-indigo-500 transition-colors`}`}>
          #{row.position}
        </span>
      </div>
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        <div className={`flex h-9 w-9 md:h-14 md:w-14 items-center justify-center rounded-full border shadow-sm transition-transform duration-300 group-hover:scale-110 shrink-0 ${
          row.isUser
            ? "border-amber-400 bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-2 md:ring-4 ring-amber-200 ring-offset-1 md:ring-offset-2 shadow-amber-500/40"
            : `border-transparent bg-gradient-to-br ${getAvatarGradient(row.initial)} text-white shadow-md group-hover:ring-2 group-hover:ring-indigo-300 group-hover:ring-offset-2 opacity-90 group-hover:opacity-100`
        }`}>
          <span className="text-sm md:text-xl font-black drop-shadow-md">{row.initial}</span>
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <p className={`text-sm md:text-lg font-bold truncate transition-colors ${
              row.isUser ? "text-amber-900" : `text-slate-700 group-hover:text-indigo-950`
            }`}>
              {row.displayName}
            </p>
            {row.isUser && (
              <span className="inline-flex items-center rounded-md bg-gradient-to-r from-amber-500 to-orange-600 px-1.5 md:px-2.5 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-sm shadow-amber-500/40">
                YOU
              </span>
            )}
          </div>
          {row.isOutsideTop10 && (
            <span className="text-[9px] md:text-xs font-bold text-amber-600/80 uppercase tracking-widest mt-0.5 md:mt-1">
              Your Current Position
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 md:gap-2 pr-1 md:pr-2">
        <FileText size={14} className={`md:h-[18px] md:w-[18px] ${row.isUser ? "text-amber-600" : `text-slate-400 group-hover:text-indigo-400 transition-colors`}`} />
        <span className={`text-lg md:text-2xl font-black ${row.isUser ? "text-amber-900 drop-shadow-sm" : `text-slate-700 group-hover:text-indigo-900 transition-colors`}`}>
          {row.article_count}
        </span>
      </div>
    </>
  );

  if (isClickable) {
    return (
      <Link href={row.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
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
  const top3 = sorted.slice(0, 3).map((c) => campusToDisplay(c, userCampusName));
  const remaining = sorted.slice(3).map((c) => campusToDisplay(c, userCampusName));

  return (
    <div className="animate-fade-in flex flex-col items-center w-full max-w-full overflow-hidden">
      <div className="w-full px-2 sm:px-0">
        <Podium top3={top3} />
      </div>

      <div className="w-full mt-4 md:mt-8">
        <div className="flex items-center justify-between mb-4 md:mb-6 px-4">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{tableTitle}</h3>
          <span className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">{sorted.length} Campuses</span>
        </div>
        
        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5 mx-2 sm:mx-0">
          <div className="grid grid-cols-[50px_1fr_90px] md:grid-cols-[80px_1fr_120px] gap-2 md:gap-4 border-b border-slate-200/80 bg-slate-50 px-4 md:px-8 py-4 md:py-5">
            <span className="text-center text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Rank</span>
            <span className="pl-1 md:pl-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Campus</span>
            <span className="pr-1 text-right text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Score</span>
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
