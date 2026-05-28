"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Calendar, Edit3, MapPin, Rocket } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CampusCard from '../components/CampusCard';
import VideoCarousel from '../components/VideoCarousel';
import type { Campus } from '../types';
import type { ApiArticle } from '../types/articleApi';
import { AUTH_ROLES, useAuthStore } from '@/store/authStore';

const HOME_CAMPUS_PREVIEW_COUNT = 6;
const HERO_SLOGAN_TERMS = ['Campus Life', 'Onboarding Kit', 'Clubs', 'Hackathons', 'Internships'];
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NIAT Insider',
  url: 'https://www.niatinsider.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.niatinsider.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

type Props = {
  campuses: Campus[];
  latestArticles: ApiArticle[];
  featuredArticles: ApiArticle[];
};

export default function HomePageClient({ campuses, latestArticles, featuredArticles }: Props) {
  const campusPreview = useMemo(() => campuses.slice(0, HOME_CAMPUS_PREVIEW_COUNT), [campuses]);
  const role = useAuthStore((state) => state.role);
  const [heroSearch, setHeroSearch] = useState('');
  const [sloganTermIndex, setSloganTermIndex] = useState(0);
  const [showSloganTerm, setShowSloganTerm] = useState(true);
  const [showNavSearch, setShowNavSearch] = useState(false);
  const myCampusId = useAuthStore((state) => state.campusId);
  const sloganSwapTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

  void latestArticles;
  void featuredArticles;

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setShowSloganTerm(false);
      if (sloganSwapTimeoutRef.current != null) {
        window.clearTimeout(sloganSwapTimeoutRef.current);
      }
      sloganSwapTimeoutRef.current = window.setTimeout(() => {
        setSloganTermIndex((prev) => (prev + 1) % HERO_SLOGAN_TERMS.length);
        setShowSloganTerm(true);
      }, 180);
    }, 2200);
    return () => {
      window.clearInterval(intervalId);
      if (sloganSwapTimeoutRef.current != null) {
        window.clearTimeout(sloganSwapTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    let last = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const threshold = window.innerWidth < 768 ? 400 : 500;
        const next = window.scrollY > threshold;
        if (next !== last) {
          last = next;
          setShowNavSearch(next);
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <Navbar showSearch={showNavSearch} />

      <section className="hero-gradient py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.95fr] gap-8 items-center">
            <div className="text-center lg:text-left">
              <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 mb-4">
                Real student voices across NIAT campuses
              </p>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                The unofficial NIAT survival guide
              </h1>
              <p className="text-white/85 text-base md:text-lg mb-3 max-w-2xl lg:max-w-3xl mx-auto lg:mx-0">
                For the students. By the students. Of the students.
              </p>
              <p className="text-white/90 text-base md:text-lg mb-6 max-w-3xl mx-auto lg:mx-0">
                Find out everything. Like everything.
                <span className={`ml-2 inline-block text-white/95 font-semibold transition-opacity duration-200 ${showSloganTerm ? 'opacity-100' : 'opacity-0'}`}>
                  {HERO_SLOGAN_TERMS[sloganTermIndex]}
                </span>
              </p>
              <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 mb-5">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Find your campus — type name or city"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    suppressHydrationWarning
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </form>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link href="/campuses" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[#991b1b] font-semibold hover:bg-[#fff1f2] transition-colors">
                  Explore all Campuses <ChevronRight className="h-4 w-4" />
                </Link>
                <Link href="/articles" className="inline-flex items-center gap-1.5 rounded-lg border border-white/35 bg-white/10 px-4 py-2 text-white font-medium hover:bg-white/20 transition-colors">
                  Explore Articles <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-white/80 text-sm mb-3">At a glance</p>
              <div className="space-y-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-3xl font-bold text-white">{campuses.length}+</p>
                  <p className="text-xs text-white/70">Universities in NIAT ecosystem</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-3xl font-bold text-white">200+</p>
                  <p className="text-xs text-white/70">Student insiders already onboarded</p>
                </div>
                <Link href="/campuses" className="inline-flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm text-white/90 hover:bg-white/20 transition-colors">
                  Start your campus journey <Rocket className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(role === AUTH_ROLES.niat || role === AUTH_ROLES.verifiedNiat) && myCampusId != null && (
        <section className="bg-section py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(() => {
              const campus = campuses.find((c) => String(c.id) === String(myCampusId));
              const campusName = campus ? `${campus.name}, ${campus.city}` : 'My campus';
              return (
                <div className="bg-white rounded-lg shadow-card border-l-4 border-[#991b1b] p-6">
                  <p className="text-sm text-black mb-1">Welcome back</p>
                  <h2 className="font-display text-xl font-bold text-black mb-4">
                    {campusName}
                  </h2>
                  <Link
                    href={campus ? `/${campus.slug}` : '/campuses'}
                    className="inline-flex items-center text-[#991b1b] font-medium hover:underline"
                  >
                    Go to my campus <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-black mb-6">NIAT Around India</h2>
          <p className="text-[#64748b] mb-6">NIAT is offered at 15+ universities across India.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campusPreview.length === 0 ? (
              <p className="col-span-full text-center text-sm text-[#64748b]">No campuses available yet.</p>
            ) : (
              campusPreview.map((campus) => <CampusCard key={campus.id} campus={campus} />)
            )}
          </div>
          <div className="mt-8 text-center">
            <Link href="/campuses" className="inline-flex items-center gap-1.5 rounded-lg bg-[#991b1b] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#7f1d1d] transition-colors">
              Explore all Campuses <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-section">
        <VideoCarousel />
      </section>

      <section className="py-12 bg-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-black mb-8">New to NIAT? Start here.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link href="/guide#week1" className="block bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow border border-transparent hover:border-[#991b1b]/20">
              <Calendar className="h-8 w-8 text-[#991b1b] mb-3" />
              <h3 className="font-display text-lg font-bold text-black mb-1">Week 1 at NIAT</h3>
              <p className="text-sm text-[#64748b] mb-3">What to do first</p>
              <span className="inline-flex items-center text-[#991b1b] text-sm font-medium">Read more <ChevronRight className="h-4 w-4 ml-1" /></span>
            </Link>
            <Link href="/campuses" className="block bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow border border-transparent hover:border-[#991b1b]/20">
              <MapPin className="h-8 w-8 text-[#991b1b] mb-3" />
              <h3 className="font-display text-lg font-bold text-black mb-1">Find your campus</h3>
              <p className="text-sm text-[#64748b] mb-3">Browse all campuses</p>
              <span className="inline-flex items-center text-[#991b1b] text-sm font-medium">Read more <ChevronRight className="h-4 w-4 ml-1" /></span>
            </Link>
            <Link href="/guide#contribute" className="block bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow border border-transparent hover:border-[#991b1b]/20">
              <Edit3 className="h-8 w-8 text-[#991b1b] mb-3" />
              <h3 className="font-display text-lg font-bold text-black mb-1">How to contribute</h3>
              <p className="text-sm text-[#64748b] mb-3">Share what you know</p>
              <span className="inline-flex items-center text-[#991b1b] text-sm font-medium">Read more <ChevronRight className="h-4 w-4 ml-1" /></span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
