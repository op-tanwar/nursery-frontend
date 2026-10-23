import Link from "next/link";

const CATEGORIES = [
  { name: "Indoor Plants", queryName: "Indoor Plants", count: "240+ plants", icon: "🌿", tag: "Bestseller" },
  { name: "Outdoor Plants", queryName: "Outdoor Plants", count: "180+ plants", icon: "🌳", tag: null },
  { name: "Succulents", queryName: "Succulents", count: "95+ plants", icon: "🌵", tag: "New" },
  { name: "Medicinal Plants", queryName: "Medicinal Plants", count: "60+ plants", icon: "🌱", tag: "Essential" },
  { name: "Flowering Plants", queryName: "Flowering Plants", count: "120+ plants", icon: "🌸", tag: null },
  { name: "Aromatic Plants", queryName: "Aromatic Plants", count: "75+ plants", icon: "🍃", tag: "Popular" },
];

export default function PlantCategories() {
  return (
    <section className="py-20 px-6 bg-brand-dark relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-full pointer-events-none bg-[radial-gradient(circle_at_top,rgba(21,128,61,0.15),transparent_50%)]" />

      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Header Block */}
        <div className="text-center mb-12">
          <span className="text-[13px] font-semibold text-brand-light tracking-[0.08em] uppercase">
            Browse by Category
          </span>
          <h2 className="text-[clamp(28px,4vw,42px)] font-black m-0 mt-2.5 tracking-[-0.02em] text-white">
            Find Your Perfect Plant
          </h2>
        </div>

        {/* Categories Grid Container */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?type=Plants&category=${encodeURIComponent(cat.queryName)}`}
              className="group relative overflow-hidden bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-[18px] py-6 px-4 text-center cursor-pointer transition-all duration-250 ease-in-out hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:bg-brand-primary hover:border-brand-primary block no-underline"
            >
              {/* Optional Tag Pillar Badge */}
              {cat.tag && (
                <span
                  className={`absolute top-2.5 right-2.5 text-[9px] font-bold py-0.5 px-[7px] rounded-full uppercase tracking-[0.06em] text-white ${cat.tag === "New"
                    ? "bg-[#0369a1]"
                    : cat.tag === "Essential"
                      ? "bg-[#7c3aed]"
                      : "bg-brand-primary"
                    }`}
                >
                  {cat.tag}
                </span>
              )}

              {/* Icon Asset Container */}
              <div className="text-[36px] mb-3 select-none">
                {cat.icon}
              </div>

              {/* Category Meta Typography */}
              <div className="text-sm font-bold mb-1 text-white transition-colors duration-250 ease-in-out group-hover:text-white">
                {cat.name}
              </div>
              <div className="text-xs text-white/65 transition-colors duration-250 ease-in-out group-hover:text-white/90">
                {cat.count}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}