import type { Metadata } from "next";
import PolicyAccordionClient, { type PolicySection } from "@/components/customer/common/PolicyAccordionClient";

export const metadata: Metadata = {
  title: "Privacy Policy | Urban Nursery",
  description: "Learn how Urban Nursery collects, uses, and protects your personal data. Encrypted payments, zero data selling, full user control.",
  alternates: { canonical: "/legal/privacy-policy" },
};

const privacySections: PolicySection[] = [
  {
    id: "1", title: "Information We Collect",
    summary: "Personal, location, and technical data gathered when you shop on Urban Nursery.",
    content: [
      "Account & Order Details: When you place an order or create an account, we collect your name, email address, local delivery address, pincode, and contact number.",
      "Pincode & Location Data: To connect you with nearby verified nurseries, we collect and process your pincode and delivery location.",
      "Payment Details: Payments are processed securely via encrypted third-party payment gateways (Razorpay, UPI, Cards, Net Banking). We never store raw credit/debit card numbers on our servers.",
      "Automated Technical Data: We collect IP addresses, browser types, device identifiers, and session cookies to optimize page load times and maintain your cart state.",
    ],
  },
  {
    id: "2", title: "How We Use Your Data",
    summary: "Purposes for which your personal information is processed.",
    content: [
      "Hyperlocal Order Fulfillment: Sharing delivery details with nearby partner nurseries and local courier riders to dispatch fresh plants to your doorstep.",
      "Customer Support: Resolving plant health concerns, transit replacement requests under our Transit Safe Guarantee, or order modifications.",
      "Platform Optimization: Analyzing website speed, improving site navigation, and enhancing hyperlocal nursery search accuracy.",
      "Marketing Communications: Sending promotional discount codes or seasonal plant care advice only if you explicitly opt-in. You can unsubscribe at any time.",
    ],
  },
  {
    id: "3", title: "Data Sharing & Partner Nurseries",
    summary: "Trusted local nurseries and logistics partners who help deliver your orders.",
    content: [
      "Partner Nurseries & Delivery Riders: We share your delivery recipient name, phone number, address, and pincode with the local nursery preparing your order and the assigned rider.",
      "Analytics & Performance Tools: We use privacy-compliant, server-side analytics to monitor system performance without selling or monetizing user data.",
      "Legal & Regulatory Compliance: We may disclose personal information if required by applicable laws or valid legal processes in India.",
    ],
  },
  {
    id: "4", title: "Cookies & Storage Preferences",
    summary: "Managing cookies, session state, and location tracking choices.",
    content: [
      "Essential Session Cookies: Required for core site functions like remembering your selected pincode, cart items, and active login session.",
      "Performance & Preference Cookies: Help us save your local nursery filter choices and analyze user traffic to improve website experience.",
      "Privacy Controls: You can manage or disable cookie preferences through your browser settings at any time.",
    ],
  },
  {
    id: "5", title: "Your Data Rights & Contact Information",
    summary: "How to access, update, or request full erasure of your account data.",
    content: [
      "Data Access & Updates: You can view or update your address, phone number, and profile details directly from your account dashboard.",
      "Right to Erasure (Account Deletion): You can request complete deletion of your account and personal details by contacting our compliance team.",
      "Privacy Inquiries: For any privacy concerns or data requests, please email privacy@urbannursery.com or contact us through our official support channel.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 pt-28 pb-16 sm:px-6 lg:px-8 max-w-[1200px] mx-auto box-border overflow-x-hidden">
      {/* HERO — Pure RSC */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4">
            Security &amp; Trust
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">Privacy Policy</h1>
          <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90 max-w-xl">
            Your privacy matters to us. Learn how Urban Nursery collects, uses, and protects your personal data and privacy choices.
          </p>
        </div>
      </div>

      {/* HIGHLIGHTS GRID — Pure RSC */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto">
        {[
          { icon: "🔒", title: "Encrypted Payments", desc: "All checkout payments are processed securely via industry-standard encrypted gateways." },
          { icon: "🚫", title: "Zero Data Selling", desc: "We never sell, trade, or rent your personal contact information to third-party advertisers." },
          { icon: "⚖️", title: "Full User Control", desc: "You can request data access, update address preferences, or delete your account anytime." },
        ].map((card) => (
          <div key={card.title} className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary-green)] flex items-center justify-center font-bold text-lg mb-3">{card.icon}</div>
            <h3 className="font-bold text-base text-[var(--foreground)] mb-1">{card.title}</h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* INTERACTIVE ACCORDION — Client leaf */}
      <PolicyAccordionClient sections={privacySections} sectionHeading="Privacy Terms & Data Guidelines" />

      {/* HELP BANNER — Pure RSC */}
      <div className="w-full max-w-5xl mx-auto mt-16 bg-[var(--primary-light)] border border-[var(--primary-green)]/20 rounded-2xl p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left box-border">
        <div>
          <h3 className="text-lg font-bold text-[var(--primary-dark)]">Have privacy questions or data requests?</h3>
          <p className="text-sm text-[var(--muted)] mt-1">Contact our privacy compliance team for data export or erasure requests.</p>
        </div>
        <a href="/contact" className="mt-4 sm:mt-0 inline-block bg-[var(--primary-green)] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors shadow-xs text-center shrink-0">
          Contact Privacy Team
        </a>
      </div>
    </div>
  );
}