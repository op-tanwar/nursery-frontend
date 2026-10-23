import type { Metadata } from "next";
import ApplyHeroSection from "@/components/customer/apply/ApplyHeroSection";
import ApplyBenefitsSection from "@/components/customer/apply/ApplyBenefitsSection";
import ApplyHowItWorksSection from "@/components/customer/apply/ApplyHowItWorksSection";
import ApplyFormSection from "@/components/customer/apply/ApplyFormSection";
import ApplyFaqSection from "@/components/customer/apply/ApplyFaqSection";
import ApplyCtaBanner from "@/components/customer/apply/ApplyCtaBanner";
import NurseryMarquee from "@/components/customer/home/NurseryMarquee";
import { BreadcrumbJsonLd, FaqPageJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Sell Plants Online / Nursery Partner Program | Urban Nursery India",
  description:
    "Join India's certified plant nursery network. ₹0 setup fee, Pan-India courier pickups from your greenhouse, automated packaging supplies, and guaranteed weekly bank payouts.",
  alternates: { canonical: `${SITE_URL}/apply` },
  openGraph: {
    title: "Sell Plants Online / Nursery Partner Program | Urban Nursery India",
    description:
      "Join India's fastest-growing plant marketplace. List your nursery for free, receive automated pickups, and scale sales nationwide across 150+ cities.",
    url: `${SITE_URL}/apply`,
    siteName: "Urban Nursery",
    type: "website",
    images: [
      {
        url: "/images/logo-new.png",
        width: 1200,
        height: 630,
        alt: "Urban Nursery Partner Network - Sell Plants Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell Plants Online / Nursery Partner Program | Urban Nursery India",
    description:
      "Grow your local nursery into a nationwide online brand with zero setup fees and weekly direct payouts.",
    images: ["/images/logo-new.png"],
  },
};

const APPLY_FAQS = [
  {
    question: "What are the onboarding fees and commission rates?",
    answer:
      "Joining Urban Nursery is 100% free with ₹0 upfront setup fees, ₹0 catalog listing fees, and ₹0 recurring monthly subscriptions. We only charge a modest commission of 10-15% when an order is successfully completed and accepted by the customer. If you don't sell, you don't pay anything.",
  },
  {
    question: "How does packaging guidance and materials work?",
    answer:
      "We provide standardized eco-friendly packaging materials directly to your nursery, including breathable pot braces, root hydration moisture wraps, and heavy-duty corrugated transit boxes. Our botanical operations team provides complete hands-on training so your staff can pack plants safely in under 90 seconds.",
  },
  {
    question: "How do logistics pickups and schedules work?",
    answer:
      "You don't need to visit courier offices. When an order is placed, our logistics partner arrives directly at your nursery during your specified daily pickup window (usually 2:00 PM – 5:00 PM). All shipping waybills are auto-generated from your dashboard with single-click printing.",
  },
  {
    question: "When and how do I receive payouts?",
    answer:
      "Payouts are calculated every Monday for all orders delivered and confirmed during the previous week. Funds are transferred automatically to your verified bank account via direct NEFT/IMPS settlement, accompanied by a comprehensive GST breakdown report and transaction statement.",
  },
  {
    question: "What quality standards are required for plants?",
    answer:
      "All plants listed on Urban Nursery must be disease-free, pest-free, well-rooted, and accurately representative of their catalog photographs. Our team provides grading criteria for stem density, height, and root ball health to help ensure high customer ratings and zero return disputes.",
  },
];

const BREADCRUMBS = [
  { name: "Home", url: SITE_URL },
  { name: "Partner With Us", url: `${SITE_URL}/apply` },
];

export default function ApplyPage() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <FaqPageJsonLd items={APPLY_FAQS} />

      {/* 1. Hero Section with Trust Metrics & Showcase */}
      <ApplyHeroSection />
      {/* 2. Nursery Partner Marquee (Immediate Trust & Social Proof) */}
      <NurseryMarquee />

      {/* 2. Key Benefits 4-Card Grid */}
      <ApplyBenefitsSection />

      {/* 3. 3-Step Onboarding Journey & Timeline */}
      <ApplyHowItWorksSection />

      {/* 4. Core Merchant Application Form */}
      <ApplyFormSection />

      {/* 5. Frequently Asked Questions Accordion */}
      <ApplyFaqSection />

      {/* 6. Closing High-Contrast CTA Banner */}
      <ApplyCtaBanner />
    </main>
  );
}