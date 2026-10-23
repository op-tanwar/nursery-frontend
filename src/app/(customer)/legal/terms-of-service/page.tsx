import type { Metadata } from "next";
import PolicyAccordionClient, { type PolicySection } from "@/components/customer/common/PolicyAccordionClient";

export const metadata: Metadata = {
  title: "Terms of Service | Urban Nursery",
  description: "Read Urban Nursery's Terms of Service covering platform usage, account registration, live plant policies, and governing law.",
  alternates: { canonical: "/legal/terms-of-service" },
};

const termsSections: PolicySection[] = [
  {
    id: "1", title: "Acceptance of Terms",
    summary: "Conditions for accessing and using the Urban Nursery platform.",
    content: [
      "By accessing or using Urban Nursery (urbannursery.com), you confirm that you have read, understood, and agreed to be bound by these Terms of Service.",
      "If you do not agree to all terms, you must refrain from accessing or purchasing products from our marketplace platform.",
      "We reserve the right to update or modify these terms at any time. Continued use of the website following changes indicates acceptance of the revised terms.",
    ],
  },
  {
    id: "2", title: "Account Registration & Security",
    summary: "Your responsibilities regarding your account details and local pincode settings.",
    content: [
      "Account Responsibility: You are responsible for maintaining the confidentiality of your account credentials and password.",
      "Accuracy: You agree to provide accurate, current, and complete delivery information (including your pincode) during checkout.",
      "Account Termination: We reserve the right to suspend or terminate accounts that engage in fraudulent activity, abuse, or unauthorized automated access.",
    ],
  },
  {
    id: "3", title: "Products, Pricing & Hyperlocal Nursery Stock",
    summary: "Rules governing inventory, plant descriptions, and local nursery order processing.",
    content: [
      "Live Plant Variations: Plants are natural, living organisms. Minor variations in size, foliage color, and pot shape compared to listed photos are normal and expected.",
      "Hyperlocal Nursery Inventory: Plant availability and local pricing depend on live inventory from partner nurseries within your pincode.",
      "Pricing Errors: In the event of a pricing or stock error from a partner nursery, we reserve the right to cancel affected pending orders and issue a full refund.",
    ],
  },
  {
    id: "4", title: "Intellectual Property Rights",
    summary: "Ownership of site content, visuals, and brand assets.",
    content: [
      "All content on this website — including text, custom design components, logos, photography, graphics, and code — is the intellectual property of Urban Nursery.",
      "You may not reproduce, distribute, or modify any content or vendor listings without explicit prior written consent from our team.",
    ],
  },
  {
    id: "5", title: "Limitation of Liability & Governing Law",
    summary: "Legal boundaries regarding store liability and disputes.",
    content: [
      "Limitation of Liability: Urban Nursery acts as a marketplace connecting buyers with verified local nurseries. We shall not be liable for indirect or consequential damages beyond the value of the ordered items.",
      "Third-Party Services: Our site integrates third-party payment gateways and courier rider services. We are not liable for external service outages beyond our control.",
      "Governing Law: These terms shall be governed and construed in accordance with applicable Indian laws and e-commerce regulations.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 pt-28 pb-16 sm:px-6 lg:px-8 max-w-[1200px] mx-auto box-border overflow-x-hidden">
      <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4">Legal Agreement</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">Terms of Service</h1>
          <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90 max-w-xl">
            Please read these terms carefully before using Urban Nursery. By using our website or ordering live plants, you agree to these guidelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto">
        {[
          { icon: "📜", title: "Clear Terms", desc: "Transparent rules and guidelines designed to protect buyers and partner nurseries." },
          { icon: "🌿", title: "Live Plant Policy", desc: "Fair expectations regarding natural variations in live plants and foliage." },
          { icon: "🛡️", title: "Fair Usage", desc: "Protections against fraudulent orders, misuse, or unauthorized asset copying." },
        ].map((card) => (
          <div key={card.title} className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary-green)] flex items-center justify-center font-bold text-lg mb-3">{card.icon}</div>
            <h3 className="font-bold text-base text-[var(--foreground)] mb-1">{card.title}</h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <PolicyAccordionClient sections={termsSections} sectionHeading="Store Regulations & Legal Guidelines" />

      <div className="w-full max-w-5xl mx-auto mt-16 bg-[var(--primary-light)] border border-[var(--primary-green)]/20 rounded-2xl p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left box-border">
        <div>
          <h3 className="text-lg font-bold text-[var(--primary-dark)]">Need legal or terms clarification?</h3>
          <p className="text-sm text-[var(--muted)] mt-1">If you have questions regarding our terms or store agreements, reach out to support.</p>
        </div>
        <a href="/contact" className="mt-4 sm:mt-0 inline-block bg-[var(--primary-green)] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors shadow-xs text-center shrink-0">
          Contact Legal Support
        </a>
      </div>
    </div>
  );
}