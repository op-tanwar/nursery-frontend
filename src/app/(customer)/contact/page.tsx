import type { Metadata } from "next";
import ContactFormClient from "@/components/customer/contact/ContactFormClient";

export const metadata: Metadata = {
  title: "Contact Us | Urban Nursery",
  description: "Get in touch with Urban Nursery. Questions about plant orders, delivery, care advice, or bulk inquiries — our team responds within 24 hours.",
  alternates: { canonical: "/contact" },
};

const CONTACT_CARDS = [
  {
    icon: "📍",
    title: "Greenhouse & Nursery",
    content: (
      <>
        Urban Nursery HQ, Green Valley Road<br />
        Indore, Madhya Pradesh 452001, India
      </>
    ),
  },
  {
    icon: "💬",
    title: "Direct Support",
    content: (
      <>
        Email: <a href="mailto:support@urbannursery.com" className="text-[var(--primary-green)] font-medium hover:underline">support@urbannursery.com</a><br />
        Phone: +91 (800) 123-4567
      </>
    ),
  },
  {
    icon: "⏰",
    title: "Operating Hours",
    content: (
      <>
        Monday – Saturday: 9:00 AM – 7:00 PM IST<br />
        Sunday: 10:00 AM – 4:00 PM IST
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 pt-28 pb-16 sm:px-6 lg:px-8 max-w-[1200px] mx-auto box-border overflow-x-hidden">

      {/* HERO — Pure RSC */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-12 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4">
            We&apos;re Here To Help
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">Get in Touch</h1>
          <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90 max-w-xl">
            Have a question about your plant order, shipping details, or need plant care advice? Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto mb-16 items-start">

        {/* LEFT — Contact info cards (Pure RSC) */}
        <div className="lg:col-span-5 space-y-4">
          {CONTACT_CARDS.map((card) => (
            <div key={card.title} className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary-green)] flex items-center justify-center font-bold text-lg mb-3">
                {card.icon}
              </div>
              <h3 className="font-bold text-base text-[var(--foreground)] mb-1">{card.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed m-0">{card.content}</p>
            </div>
          ))}
        </div>

        {/* RIGHT — Interactive form (Client leaf) */}
        <ContactFormClient />
      </div>

      {/* BOTTOM HELP BANNER — Pure RSC */}
      <div className="w-full max-w-5xl mx-auto bg-[var(--primary-light)] border border-[var(--primary-green)]/20 rounded-2xl p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left box-border">
        <div>
          <h3 className="text-lg font-bold text-[var(--primary-dark)]">Need instant answers?</h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Check out our Frequently Asked Questions for quick info on shipping, refunds, and plant care.
          </p>
        </div>
        <a href="/faq" className="mt-4 sm:mt-0 inline-block bg-[var(--primary-green)] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors shadow-xs text-center shrink-0">
          View FAQs
        </a>
      </div>
    </div>
  );
}