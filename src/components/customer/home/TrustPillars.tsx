import { ShieldCheck, Truck, Zap, HeartHandshake } from "lucide-react";

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Greenhouse Vetted",
    desc: "Every plant undergoes a meticulous health inspection before packing. Only disease-free, root-bound, healthy plants leave our facility.",
  },
  {
    icon: Truck,
    title: "Secure Transit Tech",
    desc: "Custom-engineered, eco-friendly packaging fixes the pot in place, preventing soil spillage and root shock during transit.",
  },
  {
    icon: Zap,
    title: "24-Hour Dispatch",
    desc: "Orders are processed swiftly and handed over to logistics partners within 24 hours to ensure the shortest time away from light.",
  },
  {
    icon: HeartHandshake,
    title: "Transit Protection",
    desc: "In the rare event your plant arrives damaged or dead *on arrival*, send us a unboxing video within 24 hours and we'll send a free replacement.",
  },
] as const;

export default function TrustPillars() {
  return (
    <section className="w-full  bg-[#f8fdf9] border-t border-line py-[80px] px-6 box-border relative overflow-hidden">
      {/* Background Subtle Gradient Glow adapted for light theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-full pointer-events-none bg-[radial-gradient(circle_at_top,rgba(21,128,61,0.08),transparent_50%)]" />

      <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {TRUST_PILLARS.map((p) => {
          const IconComponent = p.icon;

          return (
            <div
              key={p.title}
              className="group relative flex flex-col gap-4 p-6 rounded-2xl bg-brand-light border border-brand-primary/15 backdrop-blur-md transition-all duration-300 hover:bg-brand-primary/10 hover:border-brand-primary/30 hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(21,128,61,0.15)] overflow-hidden"
            >
              {/* Absolute Background Decorative Leaf */}
              <div className="absolute right-[-30px] bottom-[-30px] opacity-[0.05] text-[#2cbb0017] pointer-events-none transition-transform duration-500 ease-out group-hover:scale-125 group-hover:opacity-[0.12] group-hover:-rotate-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2cbb0017"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-40 h-40"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-13.9.2" />
                  <path d="M9 22v-4h4" />
                </svg>
              </div>

              {/* Lucide Icon Wrapper Box */}
              <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-white group-hover:shadow-[0_0_15px_rgba(21,128,61,0.4)]">
                <IconComponent size={24} strokeWidth={2} />
              </div>

              {/* Typography Content Wrapper */}
              <div className="flex flex-col relative z-10">
                <h3 className="m-0 mb-2 text-[17px] font-bold text-foreground leading-[1.4] font-sans tracking-wide transition-colors duration-300 group-hover:text-brand-primary">
                  {p.title}
                </h3>
                <p className="m-0 text-[13.5px] text-muted-text leading-[1.6] font-sans font-normal tracking-normal">
                  {p.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}