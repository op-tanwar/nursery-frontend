"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
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

export default function BulkFaqSection() {
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
            Enterprise FAQs
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans leading-[1.65]">
            Answers to common questions regarding corporate procurement, branding options, sample kits, and invoicing.
          </p>
        </div>

        {/* Accordion List - Matched to 1200px Grid Width */}
        <div className="w-full space-y-4  max-w-3xl mx-auto ">
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
          Need a quick response for an upcoming event?{" "}
          <a
            href="mailto:corporate@urban-nursery.in"
            className="text-brand-primary font-bold hover:text-brand-dark hover:underline transition-colors"
          >
            Email corporate desk
          </a>{" "}
          or call our B2B hotline{" "}
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