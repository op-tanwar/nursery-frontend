import { FileText, Sparkles, PackageCheck, Truck, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    tag: "Consultation",
    icon: FileText,
    title: "Share Requirements",
    desc: "Submit your estimated volume, event date, preferred plant species, and pot branding guidelines using our brief form below.",
    deliverable: "Instant Inquiry Ack",
  },
  {
    step: "02",
    tag: "Estimation",
    icon: Sparkles,
    title: "Quotation & Samples",
    desc: "Receive an itemized commercial proposal within 24 hours featuring volume discounts, GST breakdowns, and optional sample box dispatch.",
    deliverable: "Proposal in 24h",
  },
  {
    step: "03",
    tag: "Production",
    icon: PackageCheck,
    title: "Branding & Packing",
    desc: "We laser-engrave pots, insert branded message cards, and prepare plants in shock-resistant honeycomb eco-packaging.",
    deliverable: "Botanist Quality Audit",
  },
  {
    step: "04",
    tag: "Fulfillment",
    icon: Truck,
    title: "Scheduled Delivery",
    desc: "Multi-address home courier dispatch or single-venue venue delivery with climate-controlled handling and Transit Safe guarantee.",
    deliverable: "100% Alive Delivery",
  },
] as const;

export default function BulkProcessSection() {
  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden border-t border-line/60">
      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Header matching AboutValues */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            Hassle-Free Fulfillment
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            Our 4-Step B2B Fulfillment Workflow
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans leading-[1.65]">
            From initial consultation to on-site delivery, our commercial logistics team manages every detail with botanical precision.
          </p>
        </div>

        {/* 4-Step Grid matching AboutValues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, index) => {
            const IconComponent = s.icon;

            return (
              <div
                key={s.step}
                className="border border-brand-primary/10 rounded-2xl p-8 bg-[#F4F9F5] transition-all duration-300 group hover:border-brand-primary hover:bg-white hover:shadow-[0_16px_36px_rgba(21,128,61,0.1)] hover:-translate-y-1 cursor-default relative overflow-hidden flex flex-col justify-between"
              >
                {/* Accent top border on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Step Top Bar: Step Number & Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white border border-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-lg select-none group-hover:bg-brand-primary group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                      {s.step}
                    </div>
                    <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white border border-brand-primary/15 text-brand-dark">
                      {s.tag}
                    </span>
                  </div>

                  {/* Phase Indicator */}
                  <div className="flex items-center gap-1.5 mb-2.5 text-brand-primary font-sans">
                    <IconComponent size={16} strokeWidth={2.2} />
                    <span className="text-[12px] font-bold uppercase tracking-wider">
                      Phase 0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-[18px] font-extrabold m-0 mb-3 tracking-tight text-foreground group-hover:text-brand-dark transition-colors">
                    {s.title}
                  </h3>

                  <p className="m-0 text-[14px] text-muted-text leading-[1.65] font-sans">
                    {s.desc}
                  </p>
                </div>

                {/* Step Deliverable Footer */}
                <div className="pt-4 mt-6 border-t border-brand-primary/10 flex items-center justify-between text-[12px] font-sans">
                  <span className="text-muted-text font-medium">Standard:</span>
                  <span className="text-brand-primary font-bold">
                    ⚡ {s.deliverable}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Estimate CTA Link */}
        <div className="mt-14 text-center">
          <a
            href="#inquiry-form"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary/10 border border-brand-primary/25 text-brand-dark hover:bg-brand-primary hover:text-white font-bold text-[14px] transition-all duration-200 no-underline shadow-xs"
          >
            <span>Have a project in mind? Request your estimate</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}