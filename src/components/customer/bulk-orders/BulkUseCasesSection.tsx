import { Gift, Hotel, HeartHandshake, Layers, ArrowUpRight } from "lucide-react";

const USE_CASES = [
  {
    icon: Gift,
    tag: "HR & Gifting",
    title: "Corporate & Welcome Kits",
    desc: "Celebrate onboarding, festivals, work anniversaries, and client appreciation with premium desktop plants. Custom logo-engraved planters and personalized gift cards.",
    highlights: ["Laser Logo Branding", "Personalized Note Cards", "Pan-India Home Delivery"],
    idealFor: "Corporate HRs & Client Teams",
  },
  {
    icon: Hotel,
    tag: "Commercial",
    title: "Real Estate & Hospitality",
    desc: "Transform lobbies, show flats, boutique hotels, and restaurants with botanist-inspected architectural plants in minimalist, heavy-duty fiber planters.",
    highlights: ["On-Site Space Planning", "Architectural Planters", "Commercial Maintenance"],
    idealFor: "Developers, Hotels & Cafes",
  },
  {
    icon: HeartHandshake,
    tag: "Celebrations",
    title: "Weddings & Milestones",
    desc: "Give guests a living, blooming keepsake that grows with time. Miniature succulents, peace lilies, and air plants curated in ceramic pots with customized tags.",
    highlights: ["Custom Date & Name Tags", "Zero Plastic Packaging", "Event-Day Delivery"],
    idealFor: "Weddings & Conferences",
  },
  {
    icon: Layers,
    tag: "Trade Supply",
    title: "Wholesale Plants & Planters",
    desc: "Direct-from-grower supply chain access for interior landscapers, nursery resellers, and facility management teams. Volume tier pricing on 1,200+ species.",
    highlights: ["Tiered Wholesale Rates", "1,200+ Plant Varieties", "Bulk Freight Logistics"],
    idealFor: "Landscapers & Resellers",
  },
] as const;

export default function BulkUseCasesSection() {
  return (
    <section
      id="use-cases"
      className="py-24 px-6 bg-white relative overflow-hidden border-t border-line/60"
    >
      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Header matching AboutValues */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            Tailored Solutions
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            Curated For Every Scale &amp; Occasion
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans leading-[1.65]">
            Whether welcoming hundreds of new remote hires, outfitting a luxury hotel lobby, or gifting cherished wedding guests, we bring spaces alive.
          </p>
        </div>

        {/* 4-Card Grid matching AboutValues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((item) => {
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

                  <p className="m-0 text-[14px] text-muted-text leading-[1.65] font-sans mb-4">
                    {item.desc}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-1.5 mb-5">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[12px] font-medium text-foreground/85 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Highlight Footer */}
                <div className="pt-4 border-t border-brand-primary/10 flex items-center justify-between text-[12px] font-sans">
                  <span className="text-muted-text font-medium truncate pr-1">
                    <strong className="text-foreground font-bold">For:</strong> {item.idealFor}
                  </span>
                  <a
                    href="#inquiry-form"
                    className="inline-flex items-center gap-1 font-bold text-brand-primary shrink-0 group-hover:translate-x-0.5 transition-transform ml-1"
                  >
                    <span>Inquire</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}