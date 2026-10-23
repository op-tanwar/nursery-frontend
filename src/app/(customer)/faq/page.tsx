import type { Metadata } from "next";
import PolicyAccordionClient, { type PolicySection } from "@/components/customer/common/PolicyAccordionClient";

import { FaqPageJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions | Urban Nursery India",
  description: "Find answers about live plant delivery, 24-hour Transit Safe Guarantee, plant care, orders, cancellations, and pricing on Urban Nursery India.",
  alternates: { canonical: "/faq" },
};

// ─── FAQ data (hardcoded — no API needed) ─────────────────────────────────
type FAQCategory =
  | "Hyperlocal Delivery"
  | "Plant Quality & Guarantee"
  | "Orders & Cancellations"
  | "Local Nurseries & Pricing"
  | "General & Plant Care";

interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  { id: "1", category: "Hyperlocal Delivery", question: "How fast will my plant be delivered?", answer: "Since Urban Nursery connects you directly with local nurseries in your pincode, orders are usually delivered on the same day or within 24 hours via local delivery partners or nursery self-delivery." },
  { id: "2", category: "Hyperlocal Delivery", question: "What are the delivery charges?", answer: "We offer FREE Delivery on all orders above ₹799! For orders under ₹799, a nominal flat delivery fee of ₹49 applies at checkout." },
  { id: "3", category: "Hyperlocal Delivery", question: "How do I know if Urban Nursery delivers to my pincode?", answer: "Simply enter your 6-digit pincode in the top banner or product page. You will instantly see all verified local nurseries active in your location." },
  { id: "4", category: "Plant Quality & Guarantee", question: "What if my plant arrives damaged, broken, or unhealthy?", answer: "We offer a 100% Transit Safe Guarantee! Because plants are delivered locally from nearby nurseries without multi-day transit, damage is rare. However, if your plant arrives damaged, share a picture within 24 hours for a free instant replacement." },
  { id: "5", category: "Plant Quality & Guarantee", question: "Will the plant look exactly like the photos on the website?", answer: "Plants are live natural organisms, so slight variations in shape, leaf pattern, and height are natural. However, we ensure that every plant meets our strict height, stem density, and health standards before leaving the local nursery." },
  { id: "6", category: "Plant Quality & Guarantee", question: "Are your plants pet-friendly?", answer: "Yes! We have a dedicated 'Pet-Friendly' section featuring non-toxic indoor plants (like Peperomia, Boston Ferns, and Calatheas) safe for dogs and cats. Look for the pet-safe tag on the product page." },
  { id: "7", category: "Orders & Cancellations", question: "Can I cancel or modify my order after placing it?", answer: "You can cancel or modify your order within 30 minutes of placing it directly from your dashboard or by contacting support. Once the local nursery packs the plant and assigns a delivery rider, cancellations cannot be accepted." },
  { id: "8", category: "Orders & Cancellations", question: "What payment methods do you accept?", answer: "We accept all major online payment options including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallet payments via our secure payment gateway." },
  { id: "9", category: "Orders & Cancellations", question: "Can I add a custom gift note or message with my plant order?", answer: "Yes! During checkout, you can check the 'Is this a gift?' box and type your custom message. We will print a beautiful handwritten-style note card and include it with your plant gift." },
  { id: "10", category: "Local Nurseries & Pricing", question: "Why should I buy from Urban Nursery instead of traditional websites?", answer: "Traditional sites ship plants via long-distance couriers in dark boxes taking 4-5 days, which stresses and often damages plants. Urban Nursery sources directly from top local nurseries near you for fresh, same-day delivery with zero transit stress." },
  { id: "11", category: "Local Nurseries & Pricing", question: "Are plant prices higher than buying directly from physical nurseries?", answer: "Not at all! We work with local nursery partners to provide nursery-direct prices along with transparent delivery fees. You get local offline pricing with the convenience of home delivery." },
  { id: "12", category: "General & Plant Care", question: "Do plants come with pots and soil included?", answer: "Yes! All plants are delivered freshly potted in nutrient-rich soil mix along with high-quality durable nursery pots or premium ceramic/plastic planters as selected by you." },
  { id: "13", category: "General & Plant Care", question: "Do you provide plant care instructions?", answer: "Every plant comes with a physical Care Card attached, detailing light requirements, watering schedules, and soil advice. You can also scan the QR code on the card for a digital care guide." },
  { id: "14", category: "General & Plant Care", question: "I am a complete beginner. Which plants should I start with?", answer: "We recommend starting with our low-maintenance indoor category! Plants like Snake Plant, ZZ Plant, Money Plant, and Syngonium thrive easily in Indian home conditions with minimal watering." },
  { id: "15", category: "General & Plant Care", question: "How can I contact Urban Nursery customer support?", answer: "You can reach out to our team via WhatsApp support, email us at support@urbannursery.com, or visit our Contact Us page. Our support team is active from 9:00 AM to 8:00 PM daily." },
];

// Convert FAQ items to PolicySection format for reuse of PolicyAccordionClient
function faqsToSections(items: FAQItem[]): PolicySection[] {
  return items.map((faq) => ({
    id: faq.id,
    title: faq.question,
    content: [faq.answer],
  }));
}

const CATEGORIES = [
  "All",
  "Hyperlocal Delivery",
  "Plant Quality & Guarantee",
  "Orders & Cancellations",
  "Local Nurseries & Pricing",
  "General & Plant Care",
] as const;

// ─── Interactive FAQ shell (needs category filter + search + accordion) ───
// Pattern: RSC page passes all data to FAQInteractiveClient leaf
import FAQInteractiveClient from "@/components/customer/faq/FAQInteractiveClient";

export default function FaqPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 pt-28 pb-16 sm:px-6 lg:px-8 max-w-[1200px] mx-auto box-border overflow-x-hidden">
      <FaqPageJsonLd items={faqs} />
      {/* HERO — Pure RSC */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4">
            Help &amp; Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">
            Frequently Asked Questions
          </h1>
          <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90 max-w-xl">
            Have questions about local nursery delivery, plant care guarantee, or your order? We&apos;ve got all your answers right here.
          </p>
        </div>
      </div>

      {/* INTERACTIVE SECTION — Client leaf */}
      <FAQInteractiveClient faqs={faqs} categories={CATEGORIES as unknown as string[]} />
    </div>
  );
}