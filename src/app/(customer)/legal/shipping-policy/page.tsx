import type { Metadata } from "next";
import PolicyAccordionClient, { type PolicySection } from "@/components/customer/common/PolicyAccordionClient";

export const metadata: Metadata = {
  title: "Shipping Policy | Urban Nursery",
  description: "Urban Nursery's hyperlocal same-day delivery: free shipping over ₹799, eco-friendly packaging, and live rider tracking.",
  alternates: { canonical: "/legal/shipping-policy" },
};

const shippingSections: PolicySection[] = [
  {
    id: "1", title: "Hyperlocal Dispatch & Same-Day Delivery",
    summary: "How fast your plants are packed and dispatched from nearby nurseries.",
    content: [
      "Urban Nursery works on a hyperlocal delivery model. Orders are fulfilled directly by verified local nurseries located within your pincode.",
      "Most orders placed before 2:00 PM are dispatched on the same day and delivered within 24 hours.",
      "Once your plant is assigned to a rider, you receive live SMS/WhatsApp tracking alerts.",
    ],
  },
  {
    id: "2", title: "Delivery Charges & Free Shipping Threshold",
    summary: "Clear rules on delivery pricing for your orders.",
    content: [
      "FREE Local Delivery: Applicable on all orders totaling ₹799 or above.",
      "Flat Standard Fee: Orders below ₹799 incur a flat local delivery fee of ₹49 at checkout.",
      "No Hidden Fees: Packaging and local handling charges are completely included in the item price.",
    ],
  },
  {
    id: "3", title: "Eco-Friendly Fresh Packaging",
    summary: "Protecting your plants during local transport.",
    content: [
      "Because plants are delivered locally from nearby nurseries without multi-day transit, heavy plastic wraps are unnecessary.",
      "Plants are placed in sturdy, soil-lock cardboard containers or re-usable plant totes to keep stems intact and soil contained during transit.",
    ],
  },
  {
    id: "4", title: "Pincode Coverage & Availability",
    summary: "How location filtering works across cities.",
    content: [
      "We currently operate across active urban pincodes in major cities.",
      "If a nursery in your pincode goes out of stock or closes for the day, available plant listings update dynamically to reflect live nursery stock.",
    ],
  },
  {
    id: "5", title: "Order Tracking & Delivery Issues",
    summary: "What to do if your delivery is delayed or rider cannot reach you.",
    content: [
      "Real-time Tracking: You can track delivery rider progress from your user dashboard once the order is dispatched.",
      "Unreachable Recipient: Riders attempt delivery twice and call your phone number. If you are unavailable, delivery will be rescheduled for the next morning.",
      "Address Edits: To update your address or drop-off instructions, contact us within 30 minutes of placing the order.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 pt-28 pb-16 sm:px-6 lg:px-8 max-w-[1200px] mx-auto box-border overflow-x-hidden">
      <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4">Safe &amp; Hyperlocal</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">Shipping Policy</h1>
          <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90 max-w-xl">
            Everything you need to know about how local nurseries package, dispatch, and deliver fresh plants directly to your doorstep.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto">
        {[
          { icon: "🚀", title: "Same-Day Delivery", desc: "Delivered within 24 hours directly from verified nurseries in your pincode." },
          { icon: "📦", title: "Eco Packaging", desc: "Soil-lock cardboard protection built to ensure zero spill during transit." },
          { icon: "🚚", title: "Free Over ₹799", desc: "Enjoy free doorstep delivery on all cart orders worth ₹799 or more." },
        ].map((card) => (
          <div key={card.title} className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary-green)] flex items-center justify-center font-bold text-lg mb-3">{card.icon}</div>
            <h3 className="font-bold text-base text-[var(--foreground)] mb-1">{card.title}</h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <PolicyAccordionClient sections={shippingSections} sectionHeading="Shipping Guidelines & Info" />

      <div className="w-full max-w-5xl mx-auto mt-16 bg-[var(--primary-light)] border border-[var(--primary-green)]/20 rounded-2xl p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left box-border">
        <div>
          <h3 className="text-lg font-bold text-[var(--primary-dark)]">Looking for your order status?</h3>
          <p className="text-sm text-[var(--muted)] mt-1">Check your dashboard or WhatsApp for live delivery tracking details.</p>
        </div>
        <a href="/contact" className="mt-4 sm:mt-0 inline-block bg-[var(--primary-green)] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors shadow-xs text-center shrink-0">
          Track &amp; Support
        </a>
      </div>
    </div>
  );
}