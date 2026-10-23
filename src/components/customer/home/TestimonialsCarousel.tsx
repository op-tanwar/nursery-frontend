"use client";

import { useRef } from "react";
import { ArrowRight, ArrowLeft, Star, Quote, CheckCircle2 } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Urban Gardener",
    city: "Delhi",
    rating: 5,
    product: "Monstera Deliciosa",
    text: "The packaging was incredible! Not a single leaf was damaged, and the soil was still perfectly moist when delivered.",
    avatar: "AS",
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Balcony Plant Mom",
    city: "Mumbai",
    rating: 5,
    product: "Fiddle Leaf Fig",
    text: "Urban Nursery Guard completely removes the anxiety of ordering plants online. The instant refund policy shows they really care.",
    avatar: "PP",
  },
  {
    id: 3,
    name: "Rohan Das",
    role: "Beginner Parent",
    city: "Bangalore",
    rating: 5,
    product: "Snake Plant Golden",
    text: "Botanist-inspected plants really make a difference. My plant is thriving and throwing out new leaves already!",
    avatar: "RD",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    role: "Interior Designer",
    city: "Hyderabad",
    rating: 5,
    product: "Ceramic Pot Combo",
    text: "Beautiful, healthy plants delivered right to my doorstep. The real-time tracking kept me updated throughout.",
    avatar: "SR",
  },
];

export default function TestimonialsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - 380 : scrollLeft + 380;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50/50 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9 / 5 Rating from 2,500+ Plant Parents</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Loved by Plant Lovers <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Across India
              </span>
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
              aria-label="Next testimonial"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Grid Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none py-4 px-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="w-full min-w-[300px] sm:min-w-[360px] max-w-[380px] bg-white border border-slate-100/80 rounded-3xl p-7 flex-shrink-0 snap-start flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 group"
            >
              <div>
                {/* Fixed Header Layer: Rating + Quote Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-7 h-7 text-emerald-600/20 group-hover:text-emerald-600/40 transition-colors duration-300" />
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  "{t.text}"
                </p>
              </div>

              {/* User Details & Product Tag */}
              <div>
                <div className="mb-4">
                  <span className="inline-block text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                    Purchased: {t.product}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-emerald-600/20 shrink-0">
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{t.name}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {t.role} · <span className="text-slate-700 font-medium">{t.city}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}