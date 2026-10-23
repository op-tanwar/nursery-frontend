import Link from "next/link";
import { PackageX, ArrowLeft, ShoppingBag } from "lucide-react";

export default function OrderNotFound() {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-20 text-center space-y-6 antialiased">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-14 space-y-5 shadow-xs">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
          <PackageX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Order Not Found
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            The requested order ID could not be found or is not associated with your account.
            Please double-check the URL or review your active orders list.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/orders/me"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs inline-flex items-center gap-2 no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
          <Link
            href="/shop"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition shadow-xs inline-flex items-center gap-2 no-underline"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
