const PRESS = [
  { name: "YourStory", quote: "Rewriting the rules of plant retail in India." },
  { name: "Economic Times", quote: "The Nykaa of plants — premium, certified, delivered." },
  { name: "Inc42", quote: "Urban Nursery's botanist-first model is a blueprint for agri-commerce." },
  { name: "Mint", quote: "Local nurseries are finally getting their digital moment." },
];

export default function AboutPress() {
  return (
    <section className="py-15 px-6 bg-white border-t border-[#f1f5f9]">
      <div className="w-full max-w-[1200px] mx-auto">

        <p className="text-center text-[13px] font-semibold text-[#94a3b8] tracking-[0.08em] uppercase mb-8 font-sans">
          As Seen In
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESS.map((p) => (
            <div
              key={p.name}
              className="bg-background border border-brand-light rounded-2xl p-[22px] px-5 transition-shadow hover:shadow-xs"
            >
              <p className="m-0 mb-3 text-[13px] font-black text-brand-primary tracking-wide uppercase font-sans">
                {p.name}
              </p>
              <p className="m-0 text-sm text-gray-700 italic leading-[1.55] font-sans">
                "{p.quote}"
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}