"use client";

import React from "react";
import {
  ShieldCheck,
  MapPin,
  Truck,
  AlertTriangle,
  Scale,
  ArrowLeft,
  DollarSign,
  PackageCheck,
  Ban,
  FileCheck
} from "lucide-react";
import Link from "next/link";

export default function NurseryTermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs my-8">

      {/* Header Pipeline */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <Link
          href="/nursery/dashboard"
          className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Urban Nursery Merchant Terms & Conditions
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Merchant Onboarding Framework, Hyperlocal Compliance & Operational Service Level Agreements (SLA).
          </p>
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start mb-8">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black text-amber-900 m-0 uppercase tracking-wider">
            Mandatory Operational Compliance Notice
          </h4>
          <p className="text-amber-800 text-xs mt-1 m-0 leading-relaxed">
            Urban Nursery platform par active rehne ke liye sabhi registered nursery vendors ko is Hyperlocal Terms framework ko strictly follow karna hoga. SLA violation ya repeated order rejection par merchant catalog integration instantly suspend kar diya jayega.
          </p>
        </div>
      </div>

      {/* Terms Body Modules */}
      <div className="space-y-8 text-slate-700 text-xs leading-relaxed">

        {/* Section 1 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-black tracking-tight m-0">
              1. Strict Hyperlocal Geofencing & City-to-City Barrier
            </h3>
          </div>
          <p className="pl-6 text-slate-600">
            1.1 Urban Nursery strictly operational boundary control system par work karta hai. Koi bhi registered nursery partner sirf apni assigned corporate city limit aur system-verified operational node ke andar hi inventory sell karne ke liye eligible hai.
          </p>
          <p className="pl-6 text-slate-600">
            1.2 **Strict Local Barrier Constraints:** Example ke liye, Indore base-node nursery ka product catalog Indore city grid ke bahar (Bhopal, Ujjain, etc.) kisi bhi customer dashboard ya feed search par visible nahi hoga. Cross-city fulfillment restricted hai taaki live plant health compromise na ho.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900">
            <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-black tracking-tight m-0">
              2. Pincode Serviceability Protocols (10 KM Radius Grid)
            </h3>
          </div>
          <p className="pl-6 text-slate-600">
            2.1 Logistics speed aur dispatch timeline maintain rakhne ke liye nurseries ko onboarding ke waqt unke exact location coordinates ke according specific dynamic pincodes assign kiye jate hain.
          </p>
          <p className="pl-6 text-slate-600">
            2.2 **Core Radial Bounds:** Merchant ko admin panel par mapped approved pincodes (Under 10 KM radial distance) ke incoming orders process karna compulsory hai. Radius matrix update hone par updated schema sync karna mandatory hoga.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-black tracking-tight m-0">
              3. Same-Day Dispatch & Order Fulfillment SLAs
            </h3>
          </div>
          <p className="pl-6 text-slate-600">
            3.1 Urban Nursery ka core value proposition **Same-Day Fresh Delivery** hai. Order notification receive hone ke **30 minutes** ke andar nursery partner ko plant pack karke pickup status ready mark karna mandatory hai.
          </p>
          <p className="pl-6 text-slate-600">
            3.2 **Rider Handover:** Mapped local rider delay-free fulfillment execute kar sake, iske liye nursery counter par packed asset time par handover karna zaroori hai. Repeated packaging delay se merchant SLA rating decrement ho sakti hai.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-black tracking-tight m-0">
              4. Real-time Inventory Accuracy & Botanical Standards
            </h3>
          </div>
          <p className="pl-6 text-slate-600">
            4.1 Nursery partner ko apne Merchant Dashboard par live inventory and stock counts zero error rate ke sath synchronize rakhne padenge.
          </p>
          <p className="pl-6 text-slate-600">
            4.2 **Plant Quality Assurance:** Handover kiye jane wale sabhi plants pest-free, properly hydrated, aur premium plastic/terracotta pot configuration mein hone chahiye jo catalog image aur product specs se exact match karte hon.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-black tracking-tight m-0">
              5. Financial Commission, Payouts & Settlement Cycles
            </h3>
          </div>
          <p className="pl-6 text-slate-600">
            5.1 Urban Nursery fixed percentage platform commission + applicable GST deduct karke baaki gross merchant payout clear karta hai.
          </p>
          <p className="pl-6 text-slate-600">
            5.2 **Payout Timelines:** Delivered orders ke payout weekly cycle (har Tuesday & Friday) direct registered bank account mein Razorpay/NEFT via transfer kiye jate hain. Detailed breakdown statement Merchant Billing panel par accessible rehta hai.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900">
            <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-black tracking-tight m-0">
              6. Transit Safe Guarantee & Vendor Liability for Damaged Goods
            </h3>
          </div>
          <p className="pl-6 text-slate-600">
            6.1 Agar customer ko damaged, dead, ya wrong plant deliver hota hai aur customer 24 hours ke andar Transit Safe Guarantee claim raise karta hai, toh internal photo-verification complete hone par replacement item vendor end se fulfill karna hoga.
          </p>
          <p className="pl-6 text-slate-600">
            6.2 Agar damage incorrect packaging ya decayed root condition ki wajah se paaya gaya, toh product cost and replacement transit penalty merchant statement se deduct ki jayegi.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900">
            <Ban className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-black tracking-tight m-0">
              7. Prohibition of Off-Platform Disintermediation (Direct Customer Contact)
            </h3>
          </div>
          <p className="pl-6 text-slate-600">
            7.1 Nursery vendors Urban Nursery order packages mein apne personal business cards, direct contact phone numbers, or offline promotional flyers include nahi kar sakte.
          </p>
          <p className="pl-6 text-slate-600">
            7.2 **Anti-Bypassing Clause:** Platform through mile customers ko direct offline cash transaction ke liye divert karne ki koi bhi attempt severe terms breach maani jayegi jisse instant account blacklist aur pending payout freeze kar diya jayega.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-black tracking-tight m-0">
              8. Listing Compliance & Authentic Photography Guidelines
            </h3>
          </div>
          <p className="pl-6 text-slate-600">
            8.1 Plant details uploads (`CreatePlantPage`) par authentic visual media use karna compulsory hai. Stock imagery ya heavily edited filters strict disallowed hain.
          </p>
          <p className="pl-6 text-slate-600">
            8.2 Misleading measurements, incorrect pot dimensions, ya false plant care guidelines add karne par product status unpublish kar diya jayega.
          </p>
        </section>

      </div>

      {/* Footer Action & Acknowledgement */}
      <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-slate-500 text-[11px]">
          Last System Updated Revision: September 2026 • Urban Nursery Core Mesh v3.1.0
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            Download SLA PDF
          </button>
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border-0 bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs cursor-pointer transition-colors"
          >
            Accept & Agree Merchant Terms
          </button>
        </div>
      </div>

    </div>
  );
}