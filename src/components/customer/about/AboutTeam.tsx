import { ArrowRight, Sparkles } from "lucide-react";

const TEAM = [
  {
    name: "Aryan Kapoor",
    role: "Co-Founder & CEO",
    bg: "from-[#15803d] to-[#22c55e]",
    initials: "AK",
    bio: "Ex-Flipkart logistics. Obsessive about supply chain efficiency and plant dad of 23.",
  },
  {
    name: "Meera Iyer",
    role: "Co-Founder & CPO",
    bg: "from-[#0369a1] to-[#38bdf8]",
    initials: "MI",
    bio: "Ex-Nykaa product. Believes every urban home deserves a slice of the wild.",
  },
  {
    name: "Dr. Ramesh Nair",
    role: "Head of Botanist Guild",
    bg: "from-[#7c3aed] to-[#a78bfa]",
    initials: "RN",
    bio: "PhD in Plant Pathology, 18 years of greenhouse research. Guarantees every plant's health.",
  },
  {
    name: "Priti Desai",
    role: "Head of Vendor Success",
    bg: "from-[#b45309] to-[#f59e0b]",
    initials: "PD",
    bio: "Grew up in a nursery family in Nashik. Speaks the language of every vendor partner.",
  },
] as const;

export default function AboutTeam() {
  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden border-t border-line/60">
      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            The People Behind the Plants
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            Meet the Team
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans">
            A blend of supply chain experts, plant scientists, and retail builders scaling green footprints.
          </p>
        </div>

        {/* Team Profiles Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="bg-white border border-line rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-[0_16px_40px_rgba(21,128,61,0.08)] hover:border-brand-primary/30 hover:-translate-y-1.5 flex flex-col items-center justify-between"
            >
              <div>
                {/* Initials Avatar */}
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.bg} flex items-center justify-center text-[22px] font-extrabold text-white mx-auto mb-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] select-none`}
                >
                  {member.initials}
                </div>

                <h3 className="text-[18px] font-extrabold m-0 mb-1 tracking-tight text-foreground">
                  {member.name}
                </h3>

                <p className="text-[13px] text-brand-primary font-semibold m-0 mb-3 font-sans">
                  {member.role}
                </p>

                <p className="text-[13px] text-muted-text leading-[1.65] m-0 font-sans">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hiring Board Box */}
        <div className="mt-12 bg-gradient-to-br from-[#052e16] to-[#14532d] rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_16px_40px_rgba(5,46,22,0.15)]">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-400 text-[12px] font-bold uppercase tracking-wider mb-2 font-sans">
              <Sparkles size={14} />
              We Are Growing
            </div>
            <h3 className="text-[22px] font-extrabold text-white m-0 mb-2 tracking-tight">
              We&apos;re Hiring Plant Enthusiasts
            </h3>
            <p className="m-0 text-white/70 text-[14px] font-sans max-w-[640px] leading-[1.6]">
              Botanists, logistics engineers, product designers — if you love plants and building high-impact platforms, we want to talk.
            </p>
          </div>

          <button className="bg-emerald-600 hover:bg-emerald-500 text-white border-none py-3.5 px-7 rounded-xl text-[14px] font-bold cursor-pointer whitespace-nowrap transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 group shrink-0">
            <span>See Open Roles</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}