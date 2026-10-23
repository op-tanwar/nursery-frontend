import Image from "next/link";

// Nursery logos data (Real Next.js Image component ya <img> tag me use kar sakte ho)
const NURSERY_LOGOS = [
  { name: "Green Leaf Nursery", logo: "🌿 GreenLeaf" },
  { name: "Flora Haven", logo: "🌸 FloraHaven" },
  { name: "Urban Jungle Co.", logo: "🪴 UrbanJungle" },
  { name: "Botanica Roots", logo: "🌱 Botanica" },
  { name: "Paradise Plant Hub", logo: "🌵 ParadisePlants" },
  { name: "Ecology Gardens", logo: "🌳 EcoGardens" },
];

export default function NurseryMarquee() {
  // Infinite scroll effect create karne ke liye list ko duplicate karte hain
  const duplicatedLogos = [...NURSERY_LOGOS, ...NURSERY_LOGOS];

  return (
    <section className="w-full bg-background border-y border-brand-primary/10 py-6 overflow-hidden">
      <div className="w-full max-w-[1240px] mx-auto px-6 flex flex-col md:flex-row items-center gap-6 md:gap-8">

        {/* Left Side Header Text */}
        <div className="flex flex-col shrink-0 text-center md:text-left">
          <h3 className="m-0 text-base font-bold text-foreground tracking-tight">
            50+ Partnered Nurseries
          </h3>
          <p className="m-0 text-xs text-muted-text mt-1">
            Trusted local plant growers across India.
          </p>
        </div>

        {/* Vertical Divider Line (Hidden on Mobile) */}
        <div className="hidden md:block w-[1px] h-10 bg-brand-primary/20 shrink-0" />

        {/* Right Side Smooth Marquee Container */}
        <div className="relative w-full overflow-hidden flex items-center [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex items-center gap-10 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
            {duplicatedLogos.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer select-none"
              >
                {/* Visual Placeholder Badge for Logo (Replace with your <Image /> tag) */}
                <div className="text-lg font-bold text-foreground/80 flex items-center gap-2">
                  <span>{item.logo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}