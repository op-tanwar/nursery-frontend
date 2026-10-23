import { Users, Store, PackageCheck, Headphones, ArrowUpRight } from "lucide-react";

const BENEFITS = [
  {
    icon: Users,
    tag: "Customer Reach",
    title: "Direct Customer Reach",
    desc: "Connect instantly with over 50,000+ verified plant lovers and collectors in your locality and nationwide. Scale your nursery without ad spend.",
    highlight: "50,000+ Active Gardeners",
  },
  {
    icon: Store,
    tag: "Digitization",
    title: "Zero Tech Hassle",
    desc: "No expensive website development required. Upload plant photos, manage stock levels, and set prices effortlessly using our lightweight seller dashboard.",
    highlight: "2-Minute Setup",
  },
  {
    icon: PackageCheck,
    tag: "Fulfillment",
    title: "Automated Tracking",
    desc: "Every order triggers doorstep pickup from your nursery. We provide pre-printed shipping waybills, custom bio-packaging supplies, and live tracking.",
    highlight: "Doorstep Pickups",
  },
  {
    icon: Headphones,
    tag: "Dedicated Desk",
    title: "Dedicated Support",
    desc: "Work with personal horticultural account managers. Receive packaging guidance, automated weekly payouts directly to your bank account, and priority help.",
    highlight: "Weekly Direct Payouts",
  },
] as const;

export default function ApplyBenefitsSection() {
  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden border-t border-line/60">
      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Header matching AboutValues */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            Why Partner With Us
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            Built to Multiply Your Nursery&apos;s Revenue
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans leading-[1.65]">
            We eliminate the operational friction of shipping, marketing, and payments so you can focus 100% on growing healthy, vibrant plants.
          </p>
        </div>

        {/* Benefits Grid with exact AboutValues padding & styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((item) => {
            const IconComponent = item.icon;

            return (
              <div
                key={item.title}
                className="border border-brand-primary/10 rounded-2xl p-8 bg-[#F4F9F5] transition-all duration-300 group hover:border-brand-primary hover:bg-white hover:shadow-[0_16px_36px_rgba(21,128,61,0.1)] hover:-translate-y-1 cursor-default relative overflow-hidden flex flex-col justify-between"
              >
                {/* Accent top border on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top Bar with Icon & Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white border border-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                      <IconComponent size={22} strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white border border-brand-primary/15 text-brand-dark">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-[18px] font-extrabold m-0 mb-3 tracking-tight text-foreground group-hover:text-brand-dark transition-colors">
                    {item.title}
                  </h3>

                  <p className="m-0 text-[14px] text-muted-text leading-[1.65] font-sans">
                    {item.desc}
                  </p>
                </div>

                {/* Card Footer Highlight */}
                <div className="pt-4 mt-6 border-t border-brand-primary/10 flex items-center justify-between text-[12px] font-bold text-brand-primary font-sans">
                  <span className="truncate pr-1">✓ {item.highlight}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}