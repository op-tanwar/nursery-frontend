"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ArrowLeft,
  Search,
  Truck,
  DollarSign,
  PackageCheck,
  Store,
  ShieldCheck,
  ChevronDown
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "orders" | "payouts" | "inventory" | "compliance";
  question: string;
  answer: string;
}

const faqList: FAQItem[] = [
  {
    id: "1",
    category: "orders",
    question: "How do I receive and process incoming plant orders?",
    answer: "When a customer in your pincode places an order, you will receive an instant push notification and SMS alert on your Merchant Dashboard. You need to verify the plant stock, pack it securely with soil-lock protection, and mark it 'Ready for Pickup' within 30 minutes."
  },
  {
    id: "2",
    category: "orders",
    question: "Who handles the delivery of the ordered plants?",
    answer: "Urban Nursery assigns verified local delivery riders. Once you mark an order as 'Ready for Pickup', a rider is dispatched to your nursery location to collect and deliver the package directly to the customer within same-day delivery slots."
  },
  {
    id: "3",
    category: "payouts",
    question: "How and when do I receive my merchant payouts?",
    answer: "Payouts are settled bi-weekly (every Tuesday and Friday) directly to your registered bank account via NEFT/UPI. You can view complete commission deductions, order breakdowns, and payout status under the 'Billing & Payouts' section on your dashboard."
  },
  {
    id: "4",
    category: "payouts",
    question: "What is the commission rate charged by Urban Nursery?",
    answer: "Urban Nursery charges a fixed platform commission percentage on successfully delivered orders to cover rider logistics, customer support, and platform maintenance. The exact commission slab is detailed in your onboarded merchant agreement."
  },
  {
    id: "5",
    category: "inventory",
    question: "What happens if a plant goes out of stock in my nursery?",
    answer: "You must immediately update product stock status to 'Out of Stock' or reduce quantity on your Catalog Management panel (`CreatePlantPage` or Catalog Editor). Accepting an order for an out-of-stock item leads to order cancellation penalties."
  },
  {
    id: "6",
    category: "inventory",
    question: "Can I sell non-plant gardening accessories like pots and fertilizers?",
    answer: "Yes, verified merchants can list ceramic pots, planters, organic soils, fertilizers, and gardening tools alongside live plants through the Catalog Manager."
  },
  {
    id: "7",
    category: "compliance",
    question: "Who pays for customer replacements in case of plant damage during transit?",
    answer: "If damage occurs due to rider negligence, Urban Nursery covers the loss. However, if the plant was unhealthy prior to dispatch, incorrectly packaged, or unwatered, the replacement item cost is charged to the merchant account under our Transit Safe Guarantee rules."
  },
  {
    id: "8",
    category: "compliance",
    question: "Can I include my nursery's direct contact card or flyer inside customer packages?",
    answer: "No. Off-platform disintermediation is strictly prohibited under Merchant Terms Section 7. Including direct phone numbers, personal store flyers, or offline cash payment requests will result in immediate account suspension."
  }
];

export default function NurseryFAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>("1");

  const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "orders", label: "Orders & Delivery", icon: Truck },
    { id: "payouts", label: "Payouts & Finance", icon: DollarSign },
    { id: "inventory", label: "Catalog & Stock", icon: Store },
    { id: "compliance", label: "Policy & SLA", icon: ShieldCheck }
  ];

  const filteredFaqs = faqList.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs my-8">
      {/* HEADER NAVIGATION */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <Link
          href="/nursery/dashboard"
          className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Nursery Merchant FAQ & Help Center
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Frequently Asked Questions regarding order processing, payouts, stock management, and SLAs.
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search merchant help topics, e.g. payouts, same-day delivery, stock out..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ACCORDION FAQ LIST */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full text-left px-5 py-4 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-800">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-600" : ""
                      }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 m-0">No matching questions found</p>
            <p className="text-[11px] text-slate-400 mt-1 m-0">
              Try searching with another keyword or pick a different category.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER HELP CARD */}
      <div className="mt-10 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-xs font-bold text-emerald-950 m-0">Still need help with your merchant account?</h4>
          <p className="text-[11px] text-emerald-800 mt-0.5 m-0">
            Our Merchant Support desk operates Monday – Saturday from 9:00 AM to 7:00 PM IST.
          </p>
        </div>
        <Link
          href="/nursery/contact-admin-support"
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
        >
          Contact Merchant Desk
        </Link>
      </div>
    </div>
  );
}