"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Percent,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

interface PolicySection {
  id: string;
  title: string;
  summary: string;
  content: string[];
}

const payoutSections: PolicySection[] = [
  {
    id: "1",
    title: "Platform Commission Structure",
    summary: "Standard commission rates and applicable GST details.",
    content: [
      "Urban Nursery charges a competitive platform commission fee (typically 12% - 15% based on item category) on all successfully delivered orders.",
      "Applicable GST (18%) on the platform commission fee is deducted at source as per government e-commerce regulations.",
      "Shipping fees paid by customers go directly toward delivery rider allocations and are excluded from merchant commission calculations."
    ]
  },
  {
    id: "2",
    title: "Settlement Schedule & Payout Cycles",
    summary: "Bi-weekly transfer schedules and bank processing times.",
    content: [
      "Payouts are processed twice every week on Tuesday and Friday for all orders marked 'Delivered' in the preceding cycle.",
      "Orders delivered between Friday and Monday are settled on Tuesday. Orders delivered between Tuesday and Thursday are settled on Friday.",
      "Transfers are processed directly to your registered bank account via Razorpay Payouts / NEFT."
    ]
  },
  {
    id: "3",
    title: "Deductions, Refunds & Cancellation Deficits",
    summary: "Adjustments for merchant-led cancellations or damaged transit claims.",
    content: [
      "Order Cancellation Penalty: If an order is canceled due to incorrect inventory reporting or stock-out on your end, a flat processing penalty of ₹50 is debited from your next payout.",
      "Transit Damage Claims: Under our Transit Safe Guarantee, if an item is damaged due to poor packaging or decayed root condition, the replacement cost is adjusted from the merchant's pending balance.",
      "Customer Returns: Non-plant accessories returned by customers in unused condition will be refunded, and the item will be added back to your live stock."
    ]
  },
  {
    id: "4",
    title: "Tax Deduction & Invoicing (TDS / TCS Compliance)",
    summary: "Automated tax compliance reports and downloadable GST invoices.",
    content: [
      "Tax Deducted at Source (TDS under Section 194O): 1% TDS is deducted from the gross sale amount as required by Indian income tax laws.",
      "Tax Collected at Source (TCS under GST): 1% IGST/CGST/SGST TCS is withheld and deposited with tax authorities under your GSTIN.",
      "Monthly Tax Reports: Detailed tax summary certificates and payout statements can be downloaded directly from the 'Billing' tab on your dashboard."
    ]
  }
];

export default function PayoutPolicyPage() {
  const [openId, setOpenId] = useState<string | null>("1");

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs my-8">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <Link
          href="/nursery/dashboard"
          className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Merchant Payout & Billing Policy
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Commission structures, payout settlement cycles, TDS/TCS guidelines, and penalty matrix.
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <Calendar className="w-5 h-5 text-emerald-600 mb-2" />
          <h3 className="font-bold text-xs text-slate-900 m-0">Bi-Weekly Settlements</h3>
          <p className="text-[11px] text-slate-500 mt-1 m-0">
            Payouts credited every Tuesday & Friday directly to your registered bank account.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <Percent className="w-5 h-5 text-emerald-600 mb-2" />
          <h3 className="font-bold text-xs text-slate-900 m-0">Transparent Rates</h3>
          <p className="text-[11px] text-slate-500 mt-1 m-0">
            Flat category-based commission with clear invoice statements.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <FileText className="w-5 h-5 text-emerald-600 mb-2" />
          <h3 className="font-bold text-xs text-slate-900 m-0">TDS/TCS Compliant</h3>
          <p className="text-[11px] text-slate-500 mt-1 m-0">
            Automated government tax filings and monthly downloadable certificates.
          </p>
        </div>
      </div>

      {/* POLICY ACCORDION */}
      <div className="space-y-3 mb-8">
        {payoutSections.map((sec) => {
          const isOpen = openId === sec.id;
          return (
            <div key={sec.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : sec.id)}
                className="w-full text-left px-5 py-4 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-800 m-0">{sec.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 m-0 font-normal">{sec.summary}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 space-y-2">
                  {sec.content.map((p, idx) => (
                    <p key={idx} className="m-0">
                      • {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER ACKNOWLEDGEMENT */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-900 m-0 leading-relaxed">
          Need custom payout statements or facing bank transfer issues? {" "}
          <Link href="/nursery/contact-admin-support" className="font-bold underline">
            Contact Merchant Support Desk.
          </Link>
        </p>
      </div>
    </div>
  );
}