import type { Metadata } from "next";
import PolicyAccordionClient, { type PolicySection } from "@/components/customer/common/PolicyAccordionClient";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Urban Nursery",
  description: "Urban Nursery's 100% Transit Safe Guarantee. Free replacements for damaged plants, fast refunds, and hassle-free returns on accessories.",
  alternates: { canonical: "/legal/return-policy" },
};

const policySections: PolicySection[] = [
  {
    id: "1", title: "100% Transit Safe Plant Guarantee",
    summary: "Guaranteed fresh delivery from local nurseries with instant replacements.",
    content: [
      "Since Urban Nursery delivers directly from nearby nurseries in your pincode, plants avoid long multi-day courier transits and arrive fresh.",
      "If your plant arrives damaged, broken, or in poor condition, you are covered under our 100% Transit Safe Guarantee.",
      "To request a free replacement, notify us within 24 hours of delivery by sharing your Order ID and 2 clear photos via support@urbannursery.com or our WhatsApp help desk.",
    ],
  },
  {
    id: "2", title: "Eligibility for Returns & Replacements",
    summary: "Conditions for perishable plants and non-plant accessories.",
    content: [
      "Live Plants: Live plants are perishable natural items, so physical return pickups are not required. We issue instant free replacements or store credits based on photo verification.",
      "Pots, Planters & Garden Accessories: Non-perishable unused accessories can be returned or exchanged within 7 days of delivery in their original condition.",
      "Final Sale Items: Customized gift sets, clearance plants, and gift cards are non-refundable.",
    ],
  },
  {
    id: "3", title: "Refund Processing & Timelines",
    summary: "How and when approved refunds or credits are issued.",
    content: [
      "Once your claim photo is verified by our team, refunds are initiated within 24 hours back to your original payment method (UPI, Card, Net Banking).",
      "Depending on your bank, UPI refunds reflect almost instantly, while bank card refunds take 3–5 business days.",
      "Alternatively, you can choose instant Urban Nursery Store Credit for immediate repurchases.",
    ],
  },
  {
    id: "4", title: "Pickup & Return Logistics for Accessories",
    summary: "How returns work for non-plant gardening products.",
    content: [
      "If an accessory is damaged or incorrect, Urban Nursery will arrange a free doorstep pickup at no cost to you.",
      "If you wish to return a planter or tool due to personal choice, a nominal reverse courier charge of ₹60 will be deducted from the refund amount.",
    ],
  },
  {
    id: "5", title: "Order Cancellations & Delivery Changes",
    summary: "Canceling or updating orders before dispatch.",
    content: [
      "Orders can be canceled directly from your account within 30 minutes of placement for a 100% full refund.",
      "Once the local nursery packs the order and hands it to the local delivery rider, cancellations cannot be accepted.",
    ],
  },
];

export default function ReturnRefundPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 pt-28 pb-16 sm:px-6 lg:px-8 max-w-[1200px] mx-auto box-border overflow-x-hidden">
      <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4">Customer Peace of Mind</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">Return &amp; Refund Policy</h1>
          <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90 max-w-xl">
            We stand behind every plant shipped from our local partner nurseries. Learn about our Transit Safe Guarantee and quick replacement process.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto">
        {[
          { icon: "🌱", title: "Transit Safe Guarantee", desc: "Free instant replacement if your plant arrives damaged or unhealthy." },
          { icon: "📸", title: "Photo Verification", desc: "No physical plant returns required — simply share 2 photos within 24 hours." },
          { icon: "⚡", title: "Fast Processing", desc: "Approved claims are processed within 24 hours to your original payment mode." },
        ].map((card) => (
          <div key={card.title} className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary-green)] flex items-center justify-center font-bold text-lg mb-3">{card.icon}</div>
            <h3 className="font-bold text-base text-[var(--foreground)] mb-1">{card.title}</h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <PolicyAccordionClient sections={policySections} sectionHeading="Detailed Policy Guidelines" />

      <div className="w-full max-w-5xl mx-auto mt-16 bg-[var(--primary-light)] border border-[var(--primary-green)]/20 rounded-2xl p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left box-border">
        <div>
          <h3 className="text-lg font-bold text-[var(--primary-dark)]">Need to submit a replacement claim?</h3>
          <p className="text-sm text-[var(--muted)] mt-1">Have your order ID and plant photos ready. Our support team responds within 24 hours.</p>
        </div>
        <a href="/contact" className="mt-4 sm:mt-0 inline-block bg-[var(--primary-green)] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors shadow-xs text-center shrink-0">
          Submit a Claim
        </a>
      </div>
    </div>
  );
}