"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

export default function HeroSearchForm() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      {/* Conversion Search Engine Bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center rounded-[14px] mb-4 w-full max-w-[480px] bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:border-emerald-600 focus-within:shadow-[0_10px_30px_rgba(21,128,61,0.08)] transition-all duration-300"
      >
        <div className="pl-4 text-slate-400 shrink-0">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for Monstera, Fiddle Leaf, Cactus..."
          className="flex-1 min-w-0 border-none outline-none px-3 py-[14px] text-[14px] bg-transparent text-slate-900 placeholder:text-slate-400 font-medium"
        />
        <button
          type="submit"
          className="shrink-0 h-full px-[22px] py-[14px] text-[14px] font-bold text-white cursor-pointer rounded-r-[13px] transition-colors duration-200 whitespace-nowrap bg-emerald-700 hover:bg-emerald-800 border-none active:scale-[0.99]"
        >
          Search
        </button>
      </form>

      {/* Shop Now Secondary Action */}
      <div className="mb-8 pl-0.5">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[14px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors duration-200 bg-transparent border-none cursor-pointer group p-0 no-underline"
        >
          <span>Or explore full collection</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </>
  );
}
