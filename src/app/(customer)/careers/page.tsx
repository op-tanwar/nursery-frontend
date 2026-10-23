import type { Metadata } from "next";
import PolicyAccordionClient, { type PolicySection } from "@/components/customer/common/PolicyAccordionClient";

export const metadata: Metadata = {
  title: "Careers | Urban Nursery — Build the Future of Green Living",
  description: "Join Urban Nursery's team of plant lovers, engineers, and logistics experts. Explore open roles in Indore and remote positions.",
  alternates: { canonical: "/careers" },
};

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
}

const jobOpenings: JobOpening[] = [
  {
    id: "1", title: "Senior Frontend Developer (Next.js / React)",
    department: "Engineering", location: "Indore, MP (Hybrid / Remote)", type: "Full-Time",
    summary: "Build high-performance, pixel-perfect e-commerce user experiences and maintain core web vitals.",
    responsibilities: [
      "Develop responsive and accessible web applications using Next.js, React, and Tailwind CSS.",
      "Optimize web performance targeting 95+ Lighthouse scores and Core Web Vitals.",
      "Collaborate with UI/UX designers to translate Figma designs into modular, clean TypeScript code.",
    ],
  },
  {
    id: "2", title: "E-Commerce Logistics & Operations Specialist",
    department: "Operations", location: "Indore, MP (On-site)", type: "Full-Time",
    summary: "Oversee live plant packaging quality, dispatch workflows, and cold-chain thermal logistics.",
    responsibilities: [
      "Manage daily order fulfillment and coordinate with courier partners for timely plant delivery.",
      "Ensure zero-damage packaging standards using eco-friendly, biodegradable materials.",
      "Monitor inventory levels and streamline greenhouse dispatch processing.",
    ],
  },
  {
    id: "3", title: "Horticulturist & Plant Care Specialist",
    department: "Plant Care", location: "Indore, MP (On-site)", type: "Full-Time",
    summary: "Provide expert botanical advice, test indoor cultivars, and write care guides for customers.",
    responsibilities: [
      "Inspect plant health across greenhouse inventory and treat pest or soil issues proactively.",
      "Draft care instruction cards and online guides for rare and tropical plant varieties.",
      "Assist customer support with complex plant health inquiries and care diagnoses.",
    ],
  },
];

// Convert job openings to PolicySection format (title + summary + content[]) for accordion reuse
function jobsToSections(jobs: JobOpening[]): PolicySection[] {
  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    summary: `${job.department} · ${job.type} · ${job.location} — ${job.summary}`,
    content: [
      "Key Responsibilities:",
      ...job.responsibilities,
      `▶ Apply via email: careers@urbannursery.com?subject=Application for ${job.title}`,
    ],
  }));
}

import CareersAccordionClient from "@/components/customer/careers/CareersAccordionClient";

export default function CareersPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 pt-28 pb-16 sm:px-6 lg:px-8 max-w-[1200px] mx-auto box-border overflow-x-hidden">
      {/* HERO — Pure RSC */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4">Join Our Team</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">Build the Future of Green Living</h1>
          <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90 max-w-xl">
            We are on a mission to connect people with nature through sustainable e-commerce. Explore our open roles and grow your career with Urban Nursery.
          </p>
        </div>
      </div>

      {/* WHY JOIN US — Pure RSC */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto">
        {[
          { icon: "🌱", title: "Impact-Driven Work", desc: "Help bring living greenery to thousands of homes using 100% eco-friendly practices." },
          { icon: "🚀", title: "Growth & Autonomy", desc: "Work with modern stacks and high ownership in a fast-growing environment." },
          { icon: "💚", title: "Great Culture", desc: "Competitive compensation, plant discounts, flexible work hours, and learning allowances." },
        ].map((card) => (
          <div key={card.title} className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary-green)] flex items-center justify-center font-bold text-lg mb-3">{card.icon}</div>
            <h3 className="font-bold text-base text-[var(--foreground)] mb-1">{card.title}</h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* JOBS ACCORDION — Client leaf */}
      <div className="w-full space-y-4 max-w-5xl mx-auto mb-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--foreground)] tracking-tight">Current Openings</h2>
        <CareersAccordionClient jobs={jobOpenings} />
      </div>

      {/* EMAIL CTA BANNER — Pure RSC */}
      <div className="w-full max-w-5xl mx-auto bg-[var(--primary-light)] border border-[var(--primary-green)]/20 rounded-2xl p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left box-border">
        <div>
          <h3 className="text-lg font-bold text-[var(--primary-dark)]">Don&apos;t see a role that fits?</h3>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-lg">We are always looking for talented folks. Send your resume and portfolio directly to our hiring team!</p>
        </div>
        <a
          href="mailto:careers@urbannursery.com?subject=General%20Application%20-%20Urban%20Nursery"
          className="mt-4 sm:mt-0 inline-block bg-[var(--primary-green)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[var(--primary-dark)] transition-colors shadow-xs text-center shrink-0"
        >
          ✉️ Send Resume to careers@urbannursery.com
        </a>
      </div>
    </div>
  );
}