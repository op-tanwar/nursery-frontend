"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
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

export default function ApplyFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden border-t border-line/60">
      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Section Header matching AboutValues */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            Frequently Asked Questions
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            Everything Nursery Owners Ask
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans leading-[1.65]">
            Clear, honest answers about commissions, logistics, payouts, and seller policies.
          </p>
        </div>

        {/* Accordion List - Matched to 1200px Grid Width */}
        <div className="w-full max-w-3xl mx-auto  space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                  ? "border-brand-primary bg-[#F4F9F5] shadow-[0_12px_28px_rgba(21,128,61,0.08)]"
                  : "border-brand-primary/10 bg-white hover:border-brand-primary/30"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full text-left min-h-[56px] py-5 px-6 sm:px-8 flex justify-between items-center gap-4 transition-colors focus:outline-none cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <h3 className="font-extrabold text-[16px] sm:text-[17px] text-foreground pr-2 m-0 leading-snug font-sans tracking-tight">
                    {faq.question}
                  </h3>
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-all duration-300 ${isOpen
                      ? "rotate-180 bg-brand-primary text-white shadow-xs"
                      : "rotate-0 bg-white border border-brand-primary/15 text-brand-primary"
                      }`}
                  >
                    <ChevronDown size={17} strokeWidth={2.5} />
                  </span>
                </button>

                {/* CSS Grid Smooth Height Transition */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 sm:px-8 pt-2 pb-6 text-muted-text text-[14px] leading-[1.7] border-t border-brand-primary/10 font-sans font-normal">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assistance Footer */}
        <div className="mt-14 text-center text-[13px] sm:text-[14px] text-muted-text font-medium font-sans">
          Have a unique question about your nursery?{" "}
          <a
            href="mailto:partners@urban-nursery.in"
            className="text-brand-primary font-bold hover:text-brand-dark hover:underline transition-colors"
          >
            Email merchant desk
          </a>{" "}
          or call{" "}
          <a
            href="tel:+918008722675"
            className="text-brand-primary font-bold hover:text-brand-dark hover:underline transition-colors"
          >
            1800-872-2675
          </a>
        </div>

      </div>
    </section>
  );
}