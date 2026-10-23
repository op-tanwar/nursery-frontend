const GUARD_FEATURES = [
  "🔬 Botanist Inspected", 
  "📍 Real-time Tracking", 
  "💧 Hydration Protected", 
  "↩️ Instant Refund Policy"
];

export default function PlantoGuardBanner() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-[#052e16] via-brand-dark to-brand-primary relative overflow-hidden">
      
      {/* Top Right Decorative Blob */}
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-white/5 pointer-events-none" />

      <div className="w-full max-w-[1200px] mx-auto text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-block bg-white/10 border border-white/20 rounded-xl py-2 px-5 text-[13px] font-bold text-[#86efac] mb-6 tracking-wider uppercase select-none">
          🛡️ Urban Nursery Guard™
        </div>

        {/* Heading */}
        <h2 className="text-[clamp(28px,4.5vw,54px)] font-black text-white m-0 mb-5 tracking-tight leading-[1.1]">
          Guaranteed Fresh.
          <br />
          Or Your Money Back — Instantly.
        </h2>

        {/* Paragraph */}
        <p className="text-[clamp(14px,2vw,18px)] text-white/70 leading-[1.7] max-w-[600px] mx-auto m-0 mb-10 font-sans">
          Every plant goes through our Transit Protection Engine — verified by botanists at source, packaged to survive the journey, and tracked every mile.
        </p>

        {/* Interactive Features Badges */}
        <div className="flex gap-4 justify-center flex-wrap">
          {GUARD_FEATURES.map((item) => (
            <span
              key={item}
              className="bg-white/10 border border-white/15 text-white py-2.5 px-[18px] rounded-full text-sm font-medium transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:-translate-y-0.5 cursor-default select-none"
            >
              {item}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}