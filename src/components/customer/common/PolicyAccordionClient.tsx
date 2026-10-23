"use client";

import { useState } from "react";

export interface PolicySection {
  id: string;
  title: string;
  summary?: string;
  content: string[];
}

interface PolicyAccordionClientProps {
  sections: PolicySection[];
  sectionHeading?: string;
}

export default function PolicyAccordionClient({
  sections,
  sectionHeading,
}: PolicyAccordionClientProps) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="w-full space-y-4 max-w-5xl mx-auto">
      {sectionHeading && (
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--foreground)] tracking-tight">
          {sectionHeading}
        </h2>
      )}
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div
            key={section.id}
            className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xs transition-colors duration-200 box-border"
          >
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 hover:bg-[var(--primary-light)]/20 transition-colors focus:outline-none cursor-pointer select-none"
            >
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-[var(--foreground)] pr-2">
                  {section.title}
                </h3>
                {section.summary && (
                  <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5 font-normal">
                    {section.summary}
                  </p>
                )}
              </div>
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary-green)] shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {/* CSS Grid height animation — zero CLS */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pt-4 pb-6 text-[var(--muted)] text-sm sm:text-base leading-relaxed border-t border-[var(--border-color)]/40 space-y-3">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx} className="m-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
