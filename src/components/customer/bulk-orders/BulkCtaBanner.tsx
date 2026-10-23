import Link from "next/link";
import { ArrowRight, Building2, Phone } from "lucide-react";

export default function BulkCtaBanner() {
  return (
    <section className="py-24 px-6 bg-[#F2F7F4] relative overflow-hidden border-t border-line/60">
      <div className="w-full max-w-[920px] mx-auto relative group">

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-brand-primary/10 rounded-[36px] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

        {/* Main Card */}
        <div className="relative z-10 bg-white border border-brand-primary/15 rounded-[32px] py-14 px-6 sm:px-12 text-center shadow-[0_12px_40px_rgba(21,128,61,0.06)] overflow-hidden">

          {/* Decorative Rings */}
          <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full border border-brand-primary/10 pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full border border-brand-primary/10 pointer-events-none" />

          {/* Commercial Desk Icon Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-light text-brand-primary mb-6 shadow-sm border border-brand-primary/10 animate-urban-nursery-float">
            <Building2 size={28} strokeWidth={2.2} />
          </div>

          {/* Subtitle Badge */}
          <div className="block mb-2">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-brand-primary bg-brand-light/60 px-3 py-1 rounded-full border border-brand-primary/10 font-sans">
              Pan-India Enterprise Sourcing
            </span>
          </div>

          {/* Title */}
          <h2 className="text-[clamp(28px,4vw,42px)] font-black text-foreground m-0 mb-4 tracking-tight leading-[1.15] max-w-[660px] mx-auto">
            Ready to Green Your Workplace or Next Major Event?
          </h2>

          {/* Description */}
          <p className="text-muted-text text-[15px] sm:text-[16px] leading-[1.7] max-w-[580px] mx-auto m-0 mb-9 font-sans">
            Receive itemized volume discount quotes, custom planter logo mockups, GST tax invoices for ITC credit, and guaranteed alive delivery nationwide.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 justify-center flex-wrap items-center font-sans">
            <a
              href="#inquiry-form"
              className="bg-brand-primary text-white py-3.5 px-8 rounded-xl text-[15px] font-bold shadow-[0_4px_16px_rgba(21,128,61,0.25)] hover:bg-brand-dark hover:shadow-[0_6px_22px_rgba(21,128,61,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center gap-2.5 no-underline cursor-pointer"
            >
              <span>Request Custom Quotation</span>
              <ArrowRight size={18} />
            </a>

            <a
              href="tel:+918008722675"
              className="bg-brand-light/40 text-brand-primary border-2 border-brand-primary/80 hover:border-brand-primary hover:bg-brand-primary hover:text-white py-3.5 px-7 rounded-xl text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 no-underline shadow-sm"
            >
              <Phone size={18} />
              <span>Call: 1800-872-2675</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}