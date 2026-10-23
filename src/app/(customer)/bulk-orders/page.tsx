import type { Metadata } from "next";
import BulkHeroSection from "@/components/customer/bulk-orders/BulkHeroSection";
import BulkUseCasesSection from "@/components/customer/bulk-orders/BulkUseCasesSection";
import BulkProcessSection from "@/components/customer/bulk-orders/BulkProcessSection";
import BulkInquiryFormSection from "@/components/customer/bulk-orders/BulkInquiryFormSection";
import BulkFaqSection from "@/components/customer/bulk-orders/BulkFaqSection";
import BulkCtaBanner from "@/components/customer/bulk-orders/BulkCtaBanner";
import { BreadcrumbJsonLd, FaqPageJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Corporate Plant Gifting & Commercial Landscaping | Urban Nursery India",
  description:
    "Enterprise bulk plant orders, corporate green gifting, and office landscaping. Tiered wholesale pricing, custom logo-engraved planters, GST invoices, and Pan-India multi-destination fulfillment.",
  alternates: { canonical: `${SITE_URL}/bulk-orders` },
  openGraph: {
    title: "Corporate Plant Gifting & Commercial Landscaping | Urban Nursery India",
    description:
      "Transform workspaces and special events with botanist-inspected living greenery. Custom engraved pots, compliant GST invoicing, and safe Pan-India doorstep delivery.",
    url: `${SITE_URL}/bulk-orders`,
    siteName: "Urban Nursery",
    type: "website",
    images: [
      {
        url: "/images/logo-new.png",
        width: 1200,
        height: 630,
        alt: "Urban Nursery Commercial Greenery & Corporate Gifting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Plant Gifting & Commercial Landscaping | Urban Nursery India",
    description:
      "Enterprise green gifting, office landscaping, and wholesale live plant sourcing with 100% Transit Safe guarantee.",
    images: ["/images/logo-new.png"],
  },
};

const BULK_FAQS = [
  {
    question: "What is the minimum order quantity (MOQ) for bulk orders?",
    answer:
      "Our tiered wholesale pricing starts at just 25 units for plants and planters. For custom branding (logo printing or laser engraving on pots), our MOQ is 50 units. For quantities of 200, 500, or 1,000+ units, we offer deeper enterprise contract discounting.",
  },
  {
    question: "Can we print our company logo or custom message on the planters?",
    answer:
      "Yes! We offer precision laser engraving on ceramic, terracotta, and fiber pots, as well as metallic vinyl embossing, screen printing, and customized plant care message cards printed with your brand logo, corporate colors, and personalized employee/client notes.",
  },
  {
    question: "Can we order a physical sample kit before placing our final bulk order?",
    answer:
      "Absolutely. We offer curated sample boxes containing 1-3 selected plant varieties along with sample branded pots delivered to your office within 2-3 business days. The cost of the sample box is fully credited towards your confirmed bulk order invoice.",
  },
  {
    question: "Do you provide GST invoices and enterprise payment terms?",
    answer:
      "Yes, all B2B orders include compliant GST tax invoices (18% / 12% as applicable) for claiming Input Tax Credit (ITC). We accept corporate bank transfers (NEFT/RTGS), corporate credit cards, and approved 30-day PO billing terms for verified enterprises.",
  },
  {
    question: "Can you deliver directly to multiple employee home addresses across India?",
    answer:
      "Yes! For remote team welcome kits and holiday gifting, we provide seamless multi-destination fulfillment. Simply share an Excel or CSV file of recipient addresses, and we will package and deliver live plants directly to each employee's doorstep with tracking and 100% Transit Safe guarantee.",
  },
];

const BREADCRUMBS = [
  { name: "Home", url: SITE_URL },
  { name: "Bulk Orders & Corporate Gifting", url: `${SITE_URL}/bulk-orders` },
];

export default function BulkOrdersPage() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <FaqPageJsonLd items={BULK_FAQS} />

      {/* 1. Hero Section with Value Prop, Trust Metrics & Showcase */}
      <BulkHeroSection />

      {/* 2. Key Bulk Order Categories & Use Cases (4-Card Grid) */}
      <BulkUseCasesSection />

      {/* 3. 4-Step B2B Fulfillment Workflow & Timeline */}
      <BulkProcessSection />

      {/* 4. Refactored High-Trust Inquiry Form */}
      <BulkInquiryFormSection />

      {/* 5. Enterprise Frequently Asked Questions Accordion */}
      <BulkFaqSection />

      {/* 6. Closing High-Contrast CTA Banner */}
      <BulkCtaBanner />
    </main>
  );
}