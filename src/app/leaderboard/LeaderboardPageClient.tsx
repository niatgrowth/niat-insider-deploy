"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Trophy, 
  MapPin, 
  School, 
  ChevronRight, 
  Crown,
  Loader2,
  AlertCircle,
  FileText,
  Building2
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

type Tab = "overall" | "campuses" | "my-campus";

const formatName = (slug: string) => (slug || "").replace(/-/g, " ").toUpperCase();

export default function LeaderboardPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("overall");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

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
    if (activeTab === "campuses") return "Campus Performance";
    if (activeTab === "my-campus") return campusName ? `${campusName} Leaders` : "My Campus Leaderboard";
    return "Global Contributors";
  }, [activeTab, campusName]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* Sticky Tab Bar - directly below navbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#e8edf2] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end gap-1 py-2">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <header className="mb-10 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#111827] mb-4">
            Top <span className="text-[#f7b801]">3 AI Champions</span>
          </h1>
          <p className="text-[#6b7280] text-lg max-w-2xl mx-auto">
            These highest-ranked students are those who consistently build, innovate, and perform.
          </p>
        </header>

        <div className="space-y-16">
          {activeTab === "overall" && (
            <IndividualView data={individualData} isLoading={individualLoading} error={individualError} title={viewTitle} />
          )}
          {activeTab === "campuses" && (
            <CampusesView data={campusesData} isLoading={campusesLoading} error={campusesError} userCampusName={campusName} />
          )}
          {activeTab === "my-campus" && (
            <IndividualView data={myCampusData} isLoading={myCampusLoading} error={myCampusError} title={viewTitle} requiresAuth />
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
      <button disabled className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#c4cbd6] cursor-not-allowed">
        {icon} {label}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-[#f7b801] text-white shadow-sm shadow-[#f7b801]/30"
          : "text-[#6b7280] hover:text-[#111827] hover:bg-[#f8fafc]"
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ─── Podium ───────────────────────────────────────────────────────────────────
function Podium({ top3 }: { top3: LeaderboardEntry[] }) {
  const first  = top3.find(u => u.position === 1);
  const second = top3.find(u => u.position === 2);
  const third  = top3.find(u => u.position === 3);

  return (
    <div className="relative bg-white rounded-3xl p-8 md:p-10 overflow-hidden border border-[#e8edf2] shadow-sm">
      {/* Subtle gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-[#f7b801]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center md:items-end justify-center gap-3 md:gap-0 mt-6">
        {/* Rank 2 */}
        {second && (
          <div className="order-2 md:order-1 w-full max-w-[180px] flex flex-col items-center">
            <PodiumAvatar entry={second} />
            <div className="w-full h-28 md:h-36 bg-gradient-to-b from-[#f1f5f9] to-[#e2e8f0] rounded-t-2xl flex items-center justify-center border-t border-x border-[#e2e8f0]">
              <span className="text-5xl font-black text-[#111827]/8 select-none">2</span>
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {first && (
          <div className="order-1 md:order-2 w-full max-w-[200px] flex flex-col items-center z-10 md:-mx-1">
            <div className="mb-2">
              <Trophy className="h-7 w-7 text-[#f7b801] drop-shadow-[0_0_12px_rgba(247,184,1,0.3)]" />
            </div>
            <PodiumAvatar entry={first} isFirst />
            <div className="w-full h-40 md:h-48 bg-gradient-to-b from-[#fef9e7] to-[#fef3c7] rounded-t-2xl flex items-center justify-center relative border-t border-x border-[#fde68a]">
              <span className="text-7xl font-black text-[#f7b801]/15 select-none">1</span>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f7b801]/40 to-transparent" />
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {third && (
          <div className="order-3 w-full max-w-[180px] flex flex-col items-center">
            <PodiumAvatar entry={third} />
            <div className="w-full h-20 md:h-28 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded-t-2xl flex items-center justify-center border-t border-x border-[#e8edf2]">
              <span className="text-4xl font-black text-[#111827]/5 select-none">3</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Podium Avatar ────────────────────────────────────────────────────────────
function PodiumAvatar({ entry, isFirst = false }: { entry: LeaderboardEntry; isFirst?: boolean }) {
  return (
    <div className="flex flex-col items-center mb-3 animate-fade-in group">
      <Link href={getAuthorProfileHref(entry.author_profile_slug)} className="flex flex-col items-center">
        <div className={`relative mb-2 ${isFirst ? "w-16 h-16" : "w-13 h-13"}`}>
          {isFirst && (
            <div className="absolute inset-0 rounded-full bg-[#f7b801]/20 blur-md animate-pulse" />
          )}
          <div className={`w-full h-full rounded-full border-2 ${isFirst ? "border-[#f7b801] bg-[#fffbeb]" : "border-[#e8edf2] bg-[#f8fafc]"} flex items-center justify-center shadow-md transition-transform group-hover:scale-105`}>
            <span className={`font-black ${isFirst ? "text-[#d97706] text-xl" : "text-[#6b7280] text-lg"}`}>
              {entry.author_profile_slug.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <p className="text-xs font-bold text-[#111827] mb-1.5 truncate max-w-[110px] text-center">
          {formatName(entry.author_profile_slug)}
        </p>

        <div className="bg-[#fffbeb] border border-[#fde68a] px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <FileText size={9} className="text-[#f7b801]" />
          <span className="text-xs font-black text-[#d97706]">{entry.article_count}</span>
          <span className="text-[9px] font-bold text-[#9ca3af] uppercase tracking-tight">Articles</span>
        </div>
      </Link>
    </div>
  );
}

// ─── Individual View ──────────────────────────────────────────────────────────
function IndividualView({ data, isLoading, error, title, requiresAuth = false }: {
  data?: any; isLoading: boolean; error: any; title: string; requiresAuth?: boolean;
}) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load rankings" />;
  if (!data && requiresAuth) return <EmptyState message="Please login to see your campus data" />;
  if (!data?.top10 || data.top10.length === 0) return <EmptyState message="No data available yet" />;

  const top3 = data.top10.slice(0, 3);
  const remaining = data.top10.slice(3);

  return (
    <div className="animate-fade-in">
      {/* Podium - full width */}
      <Podium top3={top3} />

      {/* Rank List + Your Position side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mt-8">
        {/* Rank List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#111827]">{title}</h3>
          <div className="bg-white rounded-2xl border border-[#e8edf2] shadow-sm overflow-hidden">
            {/* Header — mirrors the exact data-row grid layout */}
            <div className="grid grid-cols-[56px_1fr_90px] gap-4 px-6 py-3 bg-[#f8fafc] border-b border-[#e8edf2]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] text-center">Rank</span>
              {/* offset by avatar width (36px) + gap (12px) to sit above the name */}
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] pl-12">Contributor</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] text-right pr-2">Score</span>
            </div>
            <div className="divide-y divide-[#f1f5f9]">
              {remaining.map((entry: LeaderboardEntry) => (
                <RankRow key={entry.author_profile_slug} entry={entry} />
              ))}
            </div>
          </div>
        </div>

        {/* Your Position - sticky sidebar alongside rank list */}
        <div className="self-start lg:sticky lg:top-16">
          <h3 className="text-xl font-bold text-[#111827] mb-4">Your Position</h3>
          {data.your_rank ? (
            <UserRankCard rank={data.your_rank} />
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-[#e8edf2] text-center shadow-sm">
              <Crown size={32} className="text-[#f7b801]/40 mx-auto mb-3" />
              <p className="text-sm text-[#9ca3af]">Login to track your own ranking</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Rank Row ─────────────────────────────────────────────────────────────────
function RankRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <Link
      href={getAuthorProfileHref(entry.author_profile_slug)}
      className="grid grid-cols-[56px_1fr_90px] gap-4 px-6 py-4 items-center hover:bg-[#fffbeb] transition-colors group cursor-default"
    >
      <div className="flex justify-center">
        <span className="text-sm font-bold text-[#d1d5db]">#{entry.position}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#fffbeb] border border-[#fde68a] flex items-center justify-center text-sm font-bold text-[#f7b801]">
          {entry.author_profile_slug.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-semibold text-[#374151] group-hover:text-[#d97706] transition-colors">
          {formatName(entry.author_profile_slug)}
        </p>
      </div>
      <div className="flex items-center justify-end gap-1.5 pr-2">
        <FileText size={12} className="text-[#d1d5db]" />
        <span className="text-sm font-black text-[#374151]">{entry.article_count}</span>
      </div>
    </Link>
  );
}

// ─── User Rank Card ───────────────────────────────────────────────────────────
function UserRankCard({ rank }: { rank: UserRank }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#fde68a] shadow-sm relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#f7b801]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-4 top-4 opacity-5">
        <Crown size={80} className="text-[#f7b801]" />
      </div>

      <p className="text-[#9ca3af] text-xs font-bold uppercase tracking-widest mb-2">Your Ranking</p>
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-5xl font-black text-[#f7b801]">#{rank.position}</span>
        {rank.in_top10 && (
          <span className="bg-[#fef3c7] text-[#d97706] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#fde68a]">
            Top 10
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm bg-[#f8fafc] p-3 rounded-xl border border-[#e8edf2]">
          <div className="flex items-center gap-2 text-[#6b7280]">
            <FileText size={14} />
            <span>Total Articles</span>
          </div>
          <span className="font-bold text-[#111827]">{rank.article_count}</span>
        </div>
        <p className="text-xs text-[#9ca3af] italic text-center">
          {rank.in_top10 ? "Awesome work! Keep leading." : "Keep writing to reach the Top 10!"}
        </p>
      </div>
    </div>
  );
}

// ─── Campuses View ────────────────────────────────────────────────────────────
function CampusesView({ data, isLoading, error, userCampusName }: {
  data?: any; isLoading: boolean; error: any; userCampusName: string | null;
}) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load campus data" />;
  if (!data?.campuses || data.campuses.length === 0) return <EmptyState message="No campus data available" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-[#111827]">Campus Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.campuses.map((campus: CampusLeaderboardEntry) => (
          <CampusRankCard key={campus.campus_slug} campus={campus} userCampusName={userCampusName} />
        ))}
      </div>
    </div>
  );
}

// ─── Campus Card ──────────────────────────────────────────────────────────────
function CampusRankCard({ campus, userCampusName }: { campus: CampusLeaderboardEntry; userCampusName: string | null }) {
  const isUserCampus = campus.is_user_campus ||
    (userCampusName != null && campus.campus_name.toLowerCase() === userCampusName.toLowerCase());

  return (
    <Link
      href={`/${campus.campus_slug}`}
      className={`group relative bg-white p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        isUserCampus
          ? "border-[#fde68a] shadow-sm shadow-[#f7b801]/10"
          : "border-[#e8edf2] hover:border-[#fde68a]"
      }`}
    >
      {isUserCampus && (
        <span className="absolute -top-3 left-5 bg-[#f7b801] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
          My Campus
        </span>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl border transition-all ${isUserCampus ? "bg-[#fffbeb] border-[#fde68a] text-[#f7b801]" : "bg-[#f8fafc] border-[#e8edf2] text-[#9ca3af] group-hover:bg-[#fffbeb] group-hover:border-[#fde68a] group-hover:text-[#f7b801]"}`}>
          <Building2 size={20} />
        </div>
        <span className={`text-2xl font-black transition-colors ${isUserCampus ? "text-[#f7b801]/30" : "text-[#111827]/8 group-hover:text-[#f7b801]/20"}`}>
          #{campus.position}
        </span>
      </div>

      <h4 className="text-base font-bold text-[#111827] mb-1 group-hover:text-[#d97706] transition-colors">
        {campus.campus_name}
      </h4>

      <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex justify-between items-center">
        <div>
          <p className="text-[10px] text-[#9ca3af] uppercase font-bold tracking-wider">Total Articles</p>
          <p className="text-xl font-black text-[#f7b801]">{campus.article_count}</p>
        </div>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all border ${isUserCampus ? "bg-[#f7b801] text-white border-[#f7b801]" : "bg-[#f8fafc] border-[#e8edf2] text-[#9ca3af] group-hover:bg-[#f7b801] group-hover:text-white group-hover:border-[#f7b801]"}`}>
          <ChevronRight size={16} />
        </div>
      </div>
    </Link>
  );
}

// ─── States ───────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-[#e8edf2] shadow-sm">
      <Loader2 className="h-10 w-10 text-[#f7b801] animate-spin mb-4" />
      <p className="text-[#9ca3af] font-medium">Crunching the data...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-red-100 shadow-sm">
      <AlertCircle className="h-10 w-10 text-red-400 mb-4" />
      <p className="text-[#111827] font-bold mb-1">Something went wrong</p>
      <p className="text-[#6b7280] text-sm">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-[#e8edf2]">
      <p className="text-[#9ca3af] font-medium">{message}</p>
    </div>
  );
}
