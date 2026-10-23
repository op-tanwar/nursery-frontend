"use client";

import { useState } from "react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface FAQInteractiveClientProps {
  faqs: FAQItem[];
  categories: string[];
}

export default function FAQInteractiveClient({ faqs, categories }: FAQInteractiveClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>("1");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <>
      {/* SEARCH */}
      <div className="text-center max-w-5xl mx-auto mb-8">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search questions (e.g. delivery time, damage, return)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] shadow-2xs focus:outline-none focus:border-[var(--primary-green)] transition-all"
          />
          <svg className="w-5 h-5 absolute left-4 top-3.5 text-[var(--muted)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-10 max-w-5xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? "bg-[var(--primary-green)] text-white border border-transparent shadow-xs"
                : "bg-[var(--panel-bg)] text-[var(--muted)] border border-[var(--border-color)] hover:border-[var(--primary-green)] hover:text-[var(--foreground)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ACCORDION LIST */}
      <div className="w-full space-y-4 max-w-5xl mx-auto">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xs transition-colors duration-200 box-border">
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 hover:bg-[var(--primary-light)]/20 transition-colors focus:outline-none cursor-pointer select-none"
                >
                  <span className="font-semibold text-base sm:text-lg text-[var(--foreground)] pr-2">{faq.question}</span>
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary-green)] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pt-4 pb-6 text-[var(--muted)] text-sm sm:text-base leading-relaxed border-t border-[var(--border-color)]/40">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full text-center py-16 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xs">
            <div className="w-12 h-12 bg-[var(--primary-light)] text-[var(--primary-green)] rounded-full flex items-center justify-center mx-auto mb-4 text-xl">🔍</div>
            <p className="text-[var(--foreground)] font-bold text-lg mb-1">No results found</p>
            <p className="text-[var(--muted)] text-sm mb-4">We couldn&apos;t find any questions matching your search.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="text-sm bg-[var(--primary-green)] text-white font-medium px-6 py-2.5 rounded-xl hover:bg-[var(--primary-dark)] transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* SUPPORT BANNER */}
      <div className="w-full max-w-5xl mx-auto mt-16 bg-[var(--primary-light)] border border-[var(--primary-green)]/20 rounded-2xl p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left box-border">
        <div>
          <h3 className="text-lg font-bold text-[var(--primary-dark)]">Still have questions?</h3>
          <p className="text-sm text-[var(--muted)] mt-1">Can&apos;t find the answer you&apos;re looking for? Reach out to our plant experts directly.</p>
        </div>
        <a href="/contact" className="mt-4 sm:mt-0 inline-block bg-[var(--primary-green)] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors shadow-xs text-center shrink-0">
          Contact Support
        </a>
      </div>
    </>
  );
}
