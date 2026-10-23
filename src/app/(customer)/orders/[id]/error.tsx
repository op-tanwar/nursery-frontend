"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrderDetailsErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Order Details Route Error Boundary]:", error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-20 text-center space-y-6 antialiased">
      <div className="bg-rose-50/60 border border-rose-200/80 rounded-3xl p-8 sm:p-12 space-y-5 shadow-xs">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto ring-6 ring-rose-100/50">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-rose-900 tracking-tight">
            Unable to Load Order Details
          </h2>
          <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
            {error?.message ||
              "An unexpected error occurred while processing your order request. Please try reloading."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-3">
          <Link
            href="/orders/me"
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition shadow-xs inline-flex items-center gap-1.5 no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Orders</span>
          </Link>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Page</span>
          </button>
        </div>
      </div>
    </div>
  );
}
