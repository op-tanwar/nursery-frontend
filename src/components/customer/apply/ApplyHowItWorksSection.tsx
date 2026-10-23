import { FileText, ShieldCheck, Sprout, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    time: "Takes ~2 Mins",
    icon: FileText,
    title: "Submit Application",
    desc: "Fill in foundational business details in our online form below. Provide your nursery name, physical location, and contact information.",
    deliverable: "Instant Confirmation",
  },
  {
    step: "02",
    time: "Within 24–48 Hours",
    icon: ShieldCheck,
    title: "Quick Verification & Audit",
    desc: "Our nursery relations specialist reviews your location, stock variety, and packaging readiness to ensure botanical quality standards.",
    deliverable: "Merchant Dashboard Activated",
  },
  {
    step: "03",
    time: "Day 3 & Beyond",
    icon: Sprout,
    title: "List Plants & Start Earning",
    desc: "Publish your live inventory catalog with your custom pricing. We dispatch courier riders for pickups and wire your payouts directly every week.",
    deliverable: "Weekly Direct Payouts",
  },
] as const;

export default function ApplyHowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-6 bg-white relative overflow-hidden border-t border-line/60"
    >
      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Header matching AboutValues */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            Simple 3-Step Journey
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            From Nursery Floor to Happy Customer
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans leading-[1.65]">
            Go live with zero downtime. Our streamlined onboarding gets your plants in front of verified buyers across India in under 48 hours.
          </p>
        </div>

        {/* 3-Step Grid with exact AboutValues padding & background */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  {/* Step Top Bar: Step Number & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white border border-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-lg select-none group-hover:bg-brand-primary group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                      {s.step}
                    </div>
                    <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white border border-brand-primary/15 text-brand-dark">
                      {s.time}
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
                  <span className="text-muted-text font-medium">Outcome:</span>
                  <span className="text-brand-primary font-bold">
                    ✓ {s.deliverable}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fast-Track Action Link */}
        <div className="mt-14 text-center">
          <a
            href="#apply-form"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary/10 border border-brand-primary/25 text-brand-dark hover:bg-brand-primary hover:text-white font-bold text-[14px] transition-all duration-200 no-underline shadow-xs"
          >
            <span>Ready to start? Fill in your details below</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}