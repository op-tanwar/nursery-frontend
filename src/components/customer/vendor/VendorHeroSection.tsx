import Image from "next/image";
import Link from "next/link";
import type { IVendorDetails } from "@/types/vendor.types";
import { StarRating } from "@/components/customer/common/ShopItemCard";

interface VendorHeroSectionProps {
  vendor: IVendorDetails | any;
}

export default function VendorHeroSection({ vendor }: VendorHeroSectionProps) {
  const vendorName = vendor?.name || vendor?.businessName || "Certified Nursery";
  const vendorDescription =
    vendor?.description ||
    vendor?.bio ||
    "Curating rare houseplants, handcrafted ceramic pots, and premium organic soils. Bringing nature closer to your living spaces with sustainable and healthy greenery.";
  const vendorRating = vendor?.rating ?? vendor?.stats?.lifetimeRating ?? 4.8;
  const avatarUrl =
    vendor?.avatar && typeof vendor.avatar === "string" && vendor.avatar.startsWith("http")
      ? vendor.avatar
      : "/images/logo-new.png";
  const vendorLocation = vendor?.location || vendor?.city || "Indore, Madhya Pradesh";
  const memberSince = vendor?.joinedDate || "Recently";

  return (
    <>
      {/* 1. HERO GRADIENT & VENDOR CARD HEADER */}
      <section
        className="relative border-b border-emerald-100/60 overflow-hidden py-16 md:py-20"
        style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 35%, #fcfdfc 70%)" }}
      >
        {/* Soft Background Accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-12 w-48 h-48 sm:w-64 sm:h-64 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 sm:gap-8">

            {/* Identity & Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-xl shadow-emerald-900/5 shrink-0 ring-1 ring-emerald-900/10">
                <Image
                  src={avatarUrl}
                  alt={vendorName}
                  fill
                  priority
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-cover"
                />
              </div>

              <div className="pt-1 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    {vendorName}
                  </h1>
                  {vendor?.verified && (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-sm shrink-0"
                      title="Verified Seller"
                    >
                      ✓
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap">
                  <span>📍 {vendorLocation}</span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span>Member since {memberSince}</span>
                </p>

                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-3 leading-relaxed font-normal">
                  {vendorDescription}
                </p>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="flex flex-row sm:flex-row items-center gap-3 w-full sm:w-auto lg:shrink-0 pt-2 justify-center sm:justify-start">
              <Link
                href={`/contact?vendor=${encodeURIComponent(vendorName)}`}
                className="flex-1 sm:flex-none bg-white text-slate-700 border border-slate-200/90 font-bold text-xs sm:text-sm py-2.5 px-4 sm:px-5 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 whitespace-nowrap no-underline"
              >
                💬 Contact Nursery
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS & LIFETIME RATING BREAKDOWN GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Lifetime Rating Overview */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase">
                Lifetime Seller Rating
              </span>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-4xl sm:text-5xl font-black">
                  {vendorRating}
                </span>
                <div className="flex flex-col">
                  <StarRating rating={vendorRating} />
                  <span className="text-xs text-emerald-200 mt-1 font-medium">
                    Based on {(vendor?.stats?.totalReviews || 0).toLocaleString()} reviews
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-emerald-700/60 text-xs">
              <div>
                <p className="text-emerald-200 font-medium">Response Rate</p>
                <p className="text-base sm:text-lg font-extrabold mt-0.5">{vendor?.stats?.responseRate || "99%"}</p>
              </div>
              <div>
                <p className="text-emerald-200 font-medium">Total Orders Fulfilled</p>
                <p className="text-base sm:text-lg font-extrabold mt-0.5">{(vendor?.stats?.totalSales || 0).toLocaleString()}+</p>
              </div>
            </div>
          </div>

          {/* Star Distribution Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
              Rating Distribution
            </h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage =
                  vendor?.ratingBreakdown?.[stars as keyof typeof vendor.ratingBreakdown] ??
                  (stars === 5 ? 85 : stars === 4 ? 10 : 2);
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-10 sm:w-12 font-bold text-slate-600 flex items-center gap-1 shrink-0">
                      {stars} ★
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-400 font-medium shrink-0">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seller Guarantee Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-around md:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3">
              <span className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-lg font-bold shrink-0">🌿</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Healthy Plant Guarantee</h4>
                <p className="text-xs text-slate-500 mt-0.5">30-day replacement window for damaged plants.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-100">
              <span className="p-2.5 bg-amber-50 text-amber-700 rounded-xl text-lg font-bold shrink-0">📦</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Eco-Friendly Packaging</h4>
                <p className="text-xs text-slate-500 mt-0.5">Zero-plastic, 100% biodegradable custom boxes.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
