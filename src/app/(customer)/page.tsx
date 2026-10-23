import { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { SITE_URL } from "@/config/site";

// ⚡ PERF: Incremental Static Regeneration (ISR) with 60s cache revalidation
// Enables instant sub-20ms TTFB edge caching for Google Lighthouse 95+ performance
export const revalidate = 60;

// Static Server Components
import Hero from "@/components/customer/home/HeroSection";
import TrustPillars from "@/components/customer/home/TrustPillars";
import PlantCategories from "@/components/customer/home/Category";
import VendorOnboarding from "@/components/customer/home/VendorOnboarding";
import PlantoGuardBanner from "@/components/customer/home/PlantoGuardBanner";
import CallToAction from "@/components/customer/common/GlobalCTA";

// Async RSC Data-Fetching Components (stream independently)
import FeaturedPlantsServer from "@/components/customer/home/FeaturedPlantsServer";
import FeaturedPotsServer from "@/components/customer/home/FeaturedPotsServer";

// Skeleton Shimmer fallback for Suspense boundaries
import FeaturedGridSkeleton from "@/components/customer/home/FeaturedGridSkeleton";

import NurseryMarquee from "@/components/customer/home/NurseryMarquee";

// ⚡ PERF: Below-fold client carousel — code-split out of initial homepage JS
const TestimonialsCarousel = dynamic(
  () => import("@/components/customer/home/TestimonialsCarousel"),
  { ssr: true }
);

// ─── Static Page Metadata (SEO & OpenGraph) ────────────────────────────────
export const metadata: Metadata = {
  title: "Urban Nursery | Premium Plants, Delivered Alive",
  description:
    "India's first certified multi-vendor plant marketplace. 1,200+ botanist-verified plants from local nurseries delivered with eco-packaging across India.",
  openGraph: {
    title: "Urban Nursery | Premium Plants, Delivered Alive Across India",
    description:
      "Shop 1,200+ certified plants from trusted local nurseries. Botanist-inspected, eco-packaged, Pan-India delivery across Mumbai, Delhi, Bangalore, Pune, Indore and 150+ cities.",
    url: SITE_URL,
    siteName: "Urban Nursery",
    type: "website",
    images: [
      {
        url: "/images/logo-new.png",
        width: 1200,
        height: 630,
        alt: "Urban Nursery – India's First Certified Plant Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Urban Nursery | Premium Plants, Delivered Alive Across India",
    description:
      "1,200+ certified plants delivered across India. Botanist-verified. Eco-packaged. Pan-India.",
    images: ["/images/logo-new.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// ─── Homepage RSC ──────────────────────────────────────────────────────────
export default function Homepage() {
  return (
    <main>
      {/* 1. Hero Section */}
      <Hero />



      {/* 3. Plant Categories (Primary Shopping Paths) */}
      <PlantCategories />
      {/* 2. Nursery Partner Marquee (Immediate Trust & Social Proof) */}
      <NurseryMarquee />

      {/* 4. Featured Plants (Primary Catalog Showcase) */}
      <Suspense
        fallback={
          <FeaturedGridSkeleton
            title="Featured Plants"
            subtitle="Handpicked for You"
            bgColor="bg-[#f8fdf9]"
          />
        }
      >
        <FeaturedPlantsServer />
      </Suspense>

      {/* 5. Featured Pots (Secondary Catalog / Accessories) */}
      <Suspense
        fallback={
          <FeaturedGridSkeleton
            title="Featured Pots"
            subtitle="Curated Accessories"
            bgColor="bg-[#fcfdfc]"
          />
        }
      >
        <FeaturedPotsServer />
      </Suspense>

      {/* 6. Trust Pillars (Dark background contrast section for assurance) */}
      <TrustPillars />

      {/* 7. PlantoGuard Banner (Special Value Proposition / Safety Guarantee) */}
      <PlantoGuardBanner />

      {/* 8. Vendor Onboarding (Sell on Urban Nursery CTA) */}
      <VendorOnboarding />

      {/* 9. Customer Testimonials (Social Proof from Buyers) */}
      <TestimonialsCarousel />

      {/* 10. Global CTA (Final Bottom Conversion Section) */}
      <CallToAction />
    </main>
  );
}