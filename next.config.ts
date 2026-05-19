import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/campus/:campusSlug/article/:articleSlug",
        destination: "/:campusSlug/article/:articleSlug",
        permanent: true,
      },
      {
        source: "/campus/:campusSlug/clubs/:clubId",
        destination: "/:campusSlug/clubs/:clubId",
        permanent: true,
      },
      {
        source: "/campus/:campusSlug/clubs",
        destination: "/:campusSlug/clubs",
        permanent: true,
      },
      {
        source: "/campus/:campusSlug",
        destination: "/:campusSlug",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/casual-conversations-peer-learning-niat-nri-vijayawada",
        destination: "/:campusSlug/article/casual-conversations-peer-learning-more-than-lectures-niat-nri",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/20-minutes-picking-earrings-btech-morning-routine-niat-adypu",
        destination: "/:campusSlug/article/chaotic-btech-mornings-chia-seeds-earring-decisions-campus-life-niat-pune",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/10-minute-campus-walk-hyderabad-access-niat-cdu",
        destination: "/:campusSlug/article/10-minute-campus-walk-hour-hyderabad-niat-chaitanya-compact-size",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-malla-reddy-vishwavidyapeeth-skills-matter-communication-coding-first-year-guide",
        destination: "/:campusSlug/article/skills-matter-more-than-cgpa-communication-coding-fundamentals-niat-mrv",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nri-university-first-batch-student-experience-building-campus-culture-entrepreneurship-club",
        destination: "/:campusSlug/article/first-batch-building-campus-culture-zero-entrepreneurship-club-niat-nri",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nri-university-entrepreneurship-club-leadership-building-ideas-campus-life",
        destination: "/:campusSlug/article/vice-president-entrepreneurship-club-real-leadership-building-niat-nri",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-sanjay-ghodawat-university-genai-masterclass-text-embeddings-project-practical-learning",
        destination: "/:campusSlug/article/building-ai-projects-beats-theory-genai-masterclass-niat-sgu",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-yenepoya-university-mangalore-weekend-travel-tannir-bhavi-beach-kadri-park-student-guide",
        destination: "/:campusSlug/article/weekend-escapes-tannir-bhavi-beach-kadri-park-mental-health-reset-niat-yenepoya",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-sanjay-ghodawat-university-first-year-btech-ai-python-programming-skills-learning",
        destination: "/:campusSlug/article/first-year-btech-ai-python-real-skills-niat-sgu",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-chalapathi-institute-of-engineering-and-technology-club-activities-fests-nsgc-president-experience",
        destination: "/:campusSlug/article/introvert-to-nsgc-president-college-clubs-changed-me-niat-chalapathi",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nadimpalli-satyanarayana-raju-institute-of-technology-campus-life-canteen-ground-conversations-hangout-spots",
        destination: "/:campusSlug/article/four-unexpected-campus-hangout-spots-niat-nsrit-visakhapatnam",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nadimpalli-satyanarayana-raju-institute-of-technology-advanced-technology-club-robotics-automation-projects-student-experience",
        destination: "/:campusSlug/article/advanced-technology-club-real-robotics-automation-projects-niat-nsrit",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nadimpalli-satyanarayana-raju-institute-of-technology-cultural-club-music-dance-art-student-life",
        destination: "/:campusSlug/article/cultural-club-changed-college-experience-beyond-coding-niat-nsrit",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-sanjay-ghodawat-university-30-days-campus-life-content-creator-insider-experience",
        destination: "/:campusSlug/article/30-days-content-creator-niat-campus-life-sgu-hostel-reality",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nadimpalli-satyanarayana-raju-institute-of-technology-sports-club-inter-campus-event-collaboration-cricket-kabaddi-volleyball",
        destination: "/:campusSlug/article/inter-campus-sports-collaboration-cricket-kabaddi-volleyball-niat-nsrit-visakhapatnam",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nadimpalli-satyanarayana-raju-institute-of-technology-72-hour-pursuit-club-challenge-experience",
        destination: "/:campusSlug/article/72-hour-pursuit-challenge-team-collaboration-niat-nsrit",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-malla-reddy-vishwavidyapeeth-first-day-packing-checklist-what-freshers-must-carry",
        destination: "/:campusSlug/article/first-day-packing-checklist-essentials-niat-mrv",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nadimpalli-satyanarayana-raju-institute-of-technology-media-club-creative-energy-campus-life",
        destination: "/:campusSlug/article/campus-clubs-media-club-accident-niat-nsrit-visakhapatnam",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nri-university-nsgc-leadership-election-interview-confidence-building-first-time-experience",
        destination: "/:campusSlug/article/nervous-interview-nsgc-leadership-found-voice-niat-nri",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-kapil-kavuri-hub-how-to-maximize-college-four-years-intentional-learning-clubs-internships",
        destination: "/:campusSlug/article/real-playbook-making-four-years-count-btech-niat-kkh",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-sanjay-ghodawat-university-first-year-friendship-leadership-journey-nervous-student",
        destination: "/:campusSlug/article/nervous-first-day-student-nsgc-president-niat-sgu",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nadimpalli-satyanarayana-raju-institute-of-technology-first-30-days-campus-life-freshers-guide",
        destination: "/:campusSlug/article/chaos-to-belonging-first-30-days-niat-nsrit-visakhapatnam",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-ajeenkya-dy-patil-university-curriculum-faculty-campus-placement-honest-student-review",
        destination: "/:campusSlug/article/niat-college-life-honest-review-curriculum-faculty-placements-adypu-pune",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-kapil-kavuri-hub-career-guidance-after-12th-grade-skills-development",
        destination: "/:campusSlug/article/college-not-just-degree-skills-development-after-12th-grade-niat-kkh",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-yenepoya-university-ethics-accountability-professional-growth-student-experience",
        destination: "/:campusSlug/article/ethics-accountability-tech-culture-niat-yenepoya-university",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-yenepoya-university-mangalore-beaches-parks-student-hangout-places-guide",
        destination: "/:campusSlug/article/best-beaches-parks-near-niat-yenepoya-panambur-tannirbhavi-hangout-spots",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-nri-university-first-six-months-learning-environment-hackathons-real-student-experience",
        destination: "/:campusSlug/article/first-six-months-college-support-fast-pace-industry-learning-niat-nri",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-kapil-kavuri-hub-first-year-programming-web-development-dsa-mern-stack-career-guide",
        destination: "/:campusSlug/article/first-year-web-development-python-dsa-mern-tech-career-start-niat-kkh",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-sanjay-ghodawat-university-robotic-arm-workshop-virtual-simulation-hands-on-experience",
        destination: "/:campusSlug/article/virtual-robotic-arm-workshop-control-systems-simulation-niat-sgu",
        permanent: true,
      },
      {
        source: "/:campusSlug/article/niat-vivekananda-global-university-survival-guide-food-spots-weather-tips-first-year-students",
        destination: "/:campusSlug/article/campus-survival-guide-food-weather-walking-tips-niat-vgu-jaipur",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
