"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, CheckCircle2, ArrowUpRight, ShieldCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { newsletterService } from "@/services/newsletterService";

interface FooterLink {
  readonly label: string;
  readonly href: string;
  readonly badge?: string;
}

interface FooterColumn {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Categories",
    links: [
      { label: "Premium Plants", href: "/shop?type=Plants" },
      { label: "Designer Pots", href: "/shop?type=Pots" },
      { label: "Care & Accessories", href: "/shop?type=Accessories" },
      { label: "Gardening Tools", href: "/shop?type=Gardening Tools" },
      { label: "Plant Care", href: "/shop?type=Plant Care" },
      { label: "Seeds & Bulbs", href: "/shop?type=Seeds %26 Bulbs" },
      { label: "Plant Stands", href: "/shop?type=Plant Stands" },
      { label: "Artificial & Dried", href: "/shop?type=Artificial %26 Dried" },
    ],
  },
  {
    title: "Popular Collections",
    links: [
      { label: "Indoor Plants", href: `/shop?type=Plants&category=${encodeURIComponent("Indoor Plants")}` },
      { label: "Outdoor Plants", href: `/shop?type=Plants&category=${encodeURIComponent("Outdoor Plants")}` },
      { label: "Ceramic Pots", href: `/shop?type=Pots&category=${encodeURIComponent("Ceramic Pots")}` },
      { label: "Organic Fertilizers", href: `/shop?type=Plant Care&category=${encodeURIComponent("Organic Fertilizers")}` },
      { label: "Vegetable Seeds", href: `/shop?type=Seeds %26 Bulbs&category=${encodeURIComponent("Vegetable Seeds")}` },
      { label: "Multi-Tier Shelves", href: `/shop?type=Plant Stands&category=${encodeURIComponent("Multi-Tier Shelves")}` },
    ],
  },
  {
    title: "Company & Programs",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Bulk Orders", href: "/bulk-orders" },
      { label: "Become a Seller", href: "/apply", badge: "Join" },
      { label: "Our Blog", href: "/blogs" },
      { label: "Careers", href: "/careers", badge: "Hiring" },
      { label: "FAQs", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
] as const;

/* Custom SVG Icons for Social Links */
const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/* Payment Method Badges */
const UpiBadge = () => (
  <span className="bg-white/10 hover:bg-white/20 text-emerald-400 font-extrabold text-[11px] tracking-wider px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center justify-center transition-all cursor-default">
    UPI
  </span>
);

const RuPayBadge = () => (
  <span className="bg-white/10 hover:bg-white/20 text-orange-400 font-bold italic text-[11px] px-2.5 py-1 rounded-md border border-orange-500/30 flex items-center justify-center transition-all cursor-default">
    RuPay
  </span>
);

const PhonePeBadge = () => (
  <span className="bg-white/10 hover:bg-white/20 text-purple-400 font-bold text-[11px] px-2.5 py-1 rounded-md border border-purple-500/30 flex items-center justify-center transition-all cursor-default">
    PhonePe
  </span>
);

const PaytmBadge = () => (
  <span className="bg-white/10 hover:bg-white/20 text-sky-400 font-bold text-[11px] px-2.5 py-1 rounded-md border border-sky-500/30 flex items-center justify-center transition-all cursor-default">
    Paytm
  </span>
);

const GPayBadge = () => (
  <span className="bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-[11px] px-2.5 py-1 rounded-md border border-amber-500/30 flex items-center justify-center transition-all cursor-default">
    G Pay
  </span>
);

const VisaBadge = () => (
  <span className="bg-white/10 hover:bg-white/20 text-blue-400 font-extrabold text-[11px] tracking-wider px-2.5 py-1 rounded-md border border-blue-500/30 flex items-center justify-center transition-all cursor-default">
    VISA
  </span>
);

const MastercardBadge = () => (
  <span className="bg-white/10 hover:bg-white/20 text-red-400 font-bold text-[11px] px-2.5 py-1 rounded-md border border-red-500/30 flex items-center justify-center transition-all cursor-default">
    MC
  </span>
);

const CodBadge = () => (
  <span className="bg-white/10 hover:bg-white/20 text-slate-300 font-medium text-[10px] px-2 py-1 rounded-md border border-white/20 flex items-center justify-center transition-all cursor-default">
    Net banking
  </span>
);

const SOCIAL_LINKS = [
  { icon: FacebookIcon, href: "https://facebook.com", label: "Facebook" },
  { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
  { icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" },
  { icon: YoutubeIcon, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      const res = await newsletterService.subscribe(cleanEmail);
      if (res.alreadySubscribed) {
        toast(res.message, { icon: "🌱" });
      } else {
        toast.success(res.message || "Thank you for subscribing!");
      }
      setSubscribed(true);
      setEmail("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-[#08170c] text-slate-300 pt-16 pb-10 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/30 overflow-hidden relative font-sans">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">

          {/* Brand Column */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <Link href="/" className="inline-block relative group">
              <Image
                src="/images/logo-new.png"
                alt="Urban Nursery Logo"
                width={200}
                height={70}
                loading="lazy"
                className="object-contain h-20 w-auto brightness-[2] contrast-125 saturate-125 -ml-[15px] transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm font-normal">
              India&apos;s premium certified plant marketplace. Connecting local nurseries to urban homes, one plant at a time.
            </p>

            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all duration-300 shadow-sm active:scale-95 group"
                  >
                    <IconComponent />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-slate-100 mb-5 tracking-widest uppercase font-mono">
                  {col.title}
                </h4>
                <ul className="space-y-2.5 p-0 m-0 list-none">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center text-xs text-slate-400 hover:text-emerald-400 transition-all duration-200 group font-medium"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.label}
                        </span>
                        {link.badge && (
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <h4 className="text-xs font-bold text-slate-100 mb-2 tracking-widest uppercase font-mono flex items-center gap-2">
              <span>Join Our Green Club</span>
            </h4>

            <p className="text-slate-400 text-xs leading-relaxed mb-5 font-normal">
              Subscribe to get expert plant care guides, new species drops, and exclusive offers.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-xs font-medium w-full">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you for subscribing! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium disabled:opacity-50"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-600 w-36 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-200 shadow-lg shadow-emerald-950/50 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Payment Methods Section */}
        <div className="border-t border-white/10 pt-6 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Safe & Secure Payments</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <UpiBadge />
            <RuPayBadge />
            <PhonePeBadge />
            <PaytmBadge />
            <GPayBadge />
            <VisaBadge />
            <MastercardBadge />
            <CodBadge />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium text-center md:text-left order-2 md:order-1">
            © {new Date().getFullYear()} Urban Nursery Technologies Pvt. Ltd. All rights reserved.
          </p>

          <div className="flex items-center gap-6 flex-wrap justify-center order-1 md:order-2">
            {[
              { label: "Privacy Policy", href: "/legal/privacy-policy" },
              { label: "Terms of Service", href: "/legal/terms-of-service" },
              { label: "Returns & Refunds", href: "/legal/return-policy" },
              { label: "Shipping Policy", href: "/legal/shipping-policy" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors duration-200 font-medium flex items-center gap-0.5 group"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}