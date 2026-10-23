import Link from "next/link";

const VENDOR_STEPS = [
  { step: "01", title: "List for Free", desc: "Upload your inventory catalog at zero cost — no setup fees, ever." },
  { step: "02", title: "We Handle Logistics", desc: "Urban Nursery manages end-to-end shipping, packaging & quality checks." },
  { step: "03", title: "Get Paid Instantly", desc: "Auto split payouts hit your account the moment delivery confirms." },
];

const STATS = [
  { label: "Active Vendors", value: "340+", icon: "🌾", bg: "bg-[#e8f5e9]" },
  { label: "Plants Delivered", value: "48K+", icon: "📦", bg: "bg-[#f0fdf4]" },
  { label: "Avg. Vendor Revenue", value: "₹82K/mo", icon: "💰", bg: "bg-[#fef9c3]" },
  { label: "Customer Rating", value: "4.9 ⭐", icon: "❤️", bg: "bg-[#fce7f3]" },
];

export default function VendorOnboarding() {
  return (
    <section className="py-20 px-6 bg-white border-t border-line">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center">

          {/* Left Side: Copy and Steps */}
          <div>
            <span className="text-[13px] font-semibold text-brand-primary tracking-[0.08em] uppercase">
              For Nursery Owners
            </span>
            <h2 className="text-[clamp(26px,3.5vw,40px)] font-black m-0 mt-3 mb-4 tracking-[-0.02em] text-foreground leading-[1.15]">
              Turn Your Nursery Into a
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent"> Pan-India Brand</span>
            </h2>
            <p className="text-muted-text font-sans leading-[1.7] mb-9 text-base max-w-[540px]">
              List your inventory for free. We handle everything — logistics, quality checks, marketing, and payments. You grow plants. We grow your business.
            </p>

            {/* Steps Flow Container */}
            <div className="space-y-7">
              {VENDOR_STEPS.map((s) => (
                <div key={s.step} className="flex gap-5">
                  <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center text-base font-extrabold text-brand-primary shrink-0 select-none">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="m-0 mb-1 text-base font-bold text-foreground font-sans">
                      {s.title}
                    </h4>
                    <p className="m-0 text-sm text-muted-text font-sans leading-[1.5]">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Link to vendor application */}
            <Link
              href="/apply"
              className="mt-9 inline-block bg-brand-primary text-white border-none py-3.5 px-[30px] rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 hover:opacity-95 active:scale-[0.98] no-underline"
            >
              Join as a Vendor — It&apos;s Free
            </Link>
          </div>

          {/* Right Side: Stats Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} rounded-[18px] p-7 text-center transition-all duration-300 hover:shadow-[0_12px_30px_rgba(21,128,61,0.05)] hover:-translate-y-0.5`}
              >
                <div className="text-3xl mb-2 select-none">
                  {stat.icon}
                </div>
                <div className="text-[26px] font-black text-foreground tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-muted-text font-sans tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}