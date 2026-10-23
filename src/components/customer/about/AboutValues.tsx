import { Leaf, Users, ShieldCheck, Zap, Home, Globe } from "lucide-react";

const VALUES = [
  {
    icon: Leaf,
    title: "Nature First",
    desc: "Every decision we make passes one test: is this good for the plant, the grower, and the earth?",
  },
  {
    icon: Users,
    title: "Vendor Partnership",
    desc: "We don't exploit nurseries. We amplify them. Our success is measured by vendor revenue growth.",
  },
  {
    icon: ShieldCheck,
    title: "Scientific Integrity",
    desc: "We hire botanists, not marketers, to decide what goes in a box. No greenwashing.",
  },
  {
    icon: Zap,
    title: "Radical Reliability",
    desc: "We said 'Guaranteed Fresh or Immediate Refund'. We mean it. Every. Single. Time.",
  },
  {
    icon: Home,
    title: "Local Roots",
    desc: "Our vendors are local nursery families. We make sure their expertise reaches every Indian home.",
  },
  {
    icon: Globe,
    title: "Sustainable Scale",
    desc: "Biodegradable packaging, carbon-offset logistics. Growing big without leaving a footprint.",
  },
] as const;

export default function AboutValues() {
  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden border-t border-line/60">
      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            What We Stand For
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            Our Core Values
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans">
            Principles that guide how we build India&apos;s most trusted direct-to-consumer nursery network.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map((item) => {
            const IconComponent = item.icon;

            return (
              <div
                key={item.title}
                className="border border-brand-primary/10 rounded-2xl p-8 bg-[#F4F9F5] transition-all duration-300 group hover:border-brand-primary hover:bg-white hover:shadow-[0_16px_36px_rgba(21,128,61,0.1)] hover:-translate-y-1 cursor-default relative overflow-hidden"
              >
                {/* Accent top border on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon Container */}
                <div className="w-12 h-12 rounded-xl bg-white border border-brand-primary/10 text-brand-primary flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                  <IconComponent size={22} strokeWidth={2} />
                </div>

                <h3 className="text-[18px] font-extrabold m-0 mb-3 tracking-tight text-foreground">
                  {item.title}
                </h3>

                <p className="m-0 text-[14px] text-muted-text leading-[1.65] font-sans">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}