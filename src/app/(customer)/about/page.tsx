import type { Metadata } from "next";
import AboutHero from "@/components/customer/about/AboutHero";

export const metadata: Metadata = {
  title: "About Us | Urban Nursery — India's Hyperlocal Plant Marketplace",
  description: "Learn about Urban Nursery's mission to connect plant lovers with certified local nurseries for same-day fresh plant delivery across India.",
  alternates: { canonical: "/about" },
};
import AboutStats from "@/components/customer/about/AboutStats";
import AboutTimeline from "@/components/customer/about/AboutTimeline";
import AboutValues from "@/components/customer/about/AboutValues";
import AboutTeam from "@/components/customer/about/AboutTeam";
import AboutPress from "@/components/customer/about/AboutPress";
import GlobalCTA from "@/components/customer/common/GlobalCTA";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* 1. Hero Section with Manifesto */}
      <AboutHero />

      {/* 2. Numerical Growth & Impact Metrics */}
      <AboutStats />

      {/* 3. Interactive History & Milestone Tracker */}
      <AboutTimeline />

      {/* 4. Core Principles & Philosophies */}
      <AboutValues />

      {/* 5. Executive Team Profiles & Careers Widget */}
      <AboutTeam />

      {/* 6. Media / Press Clippings Grid (Optional) */}
      {/* <AboutPress /> */}

      {/* 7. Bottom Conversion Call-To-Action */}
      <GlobalCTA />
    </main>
  );
}