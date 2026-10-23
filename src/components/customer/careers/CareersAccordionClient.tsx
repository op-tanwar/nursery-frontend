"use client";

import { useState } from "react";

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
}

export default function CareersAccordionClient({ jobs }: { jobs: JobOpening[] }) {
  const [openId, setOpenId] = useState<string | null>("1");

  const toggleJob = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <>
      {jobs.map((job) => {
        const isOpen = openId === job.id;
        return (
          <div key={job.id} className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xs transition-colors duration-200 box-border">
            <button
              type="button"
              onClick={() => toggleJob(job.id)}
              className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 hover:bg-[var(--primary-light)]/20 transition-colors focus:outline-none cursor-pointer select-none"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-[var(--primary-green)] bg-[var(--primary-light)] px-2.5 py-0.5 rounded-full uppercase tracking-wider">{job.department}</span>
                  <span className="text-xs text-[var(--muted)]">• {job.type}</span>
                  <span className="text-xs text-[var(--muted)]">• {job.location}</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[var(--foreground)] pr-2">{job.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-normal">{job.summary}</p>
              </div>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary-green)] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="px-6 pt-4 pb-6 border-t border-[var(--border-color)]/40 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2">Key Responsibilities:</h4>
                    <ul className="list-disc pl-5 text-xs sm:text-sm text-[var(--muted)] space-y-1.5 m-0">
                      {job.responsibilities.map((res, idx) => <li key={idx}>{res}</li>)}
                    </ul>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`mailto:careers@urbanursery.com?subject=Application for ${encodeURIComponent(job.title)}`}
                      className="inline-block bg-[var(--primary-green)] text-white px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm hover:bg-[var(--primary-dark)] transition-colors shadow-xs"
                    >
                      Apply via Email →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
