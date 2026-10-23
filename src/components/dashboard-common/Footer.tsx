"use client";

import Link from "next/link";

export default function AdminFooter() {
  return (
    <footer className="min-h-12 w-full bg-white border-t border-slate-200 px-4 sm:px-6 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0 text-[11px] font-medium text-slate-500 text-center md:text-left transition-colors">
      {/* Brand Copyright */}
      <div className="flex items-center gap-1.5">
        <span>&copy; {new Date().getFullYear()}</span>
        <span className="font-semibold text-slate-700">Urban Nursery Care Systems</span>
        <span className="hidden lg:inline text-slate-300">•</span>
        <span className="hidden lg:inline text-slate-400">Merchant Partner Portal</span>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-slate-600">
        <Link
          href="/nursery/nursery-terms"
          className="hover:text-emerald-600 transition-colors underline-offset-4 hover:underline"
        >
          Terms of Service
        </Link>
        <span className="text-slate-300">•</span>
        <Link
          href="/nursery/nursery-faq"
          className="hover:text-emerald-600 transition-colors underline-offset-4 hover:underline"
        >
          Merchant FAQ
        </Link>
        <span className="text-slate-300">•</span>
        <Link
          href="/nursery/payout-policy"
          className="hover:text-emerald-600 transition-colors underline-offset-4 hover:underline"
        >
          Payout Policy
        </Link>
        <span className="text-slate-300">•</span>
        <Link
          href="/nursery/packaging-guidelines"
          className="hover:text-emerald-600 transition-colors underline-offset-4 hover:underline"
        >
          Packaging Guide
        </Link>
        <span className="text-slate-300">•</span>
        <Link
          href="/nursery/contact-admin-support"
          className="hover:text-emerald-600 transition-colors underline-offset-4 hover:underline"
        >
          Support Desk
        </Link>
      </div>

      {/* Engine Status Indicator */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
        <span className="text-slate-400 text-[10px] font-mono">Mesh v3.1.0</span>
        <div className="w-[1px] h-3 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span className="text-slate-700 font-bold text-[10px] tracking-wide uppercase">
            System Online
          </span>
        </div>
      </div>
    </footer>
  );
}