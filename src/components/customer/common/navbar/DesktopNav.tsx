"use client";

import Link from "next/link";
import {
  ChevronDown,
  ArrowRight,
  LucideIcon,
  Leaf,
  Container,
  Wrench,
  Sprout,
  ShieldAlert,
  Flower2,
  Layers,
  Sparkles,
} from "lucide-react";

interface SubItem {
  readonly name: string;
  readonly href: string;
}

interface MegaMenuColumn {
  readonly title: string;
  readonly icon: LucideIcon;
  readonly href: string;
  readonly colorClass: string;
  readonly items: readonly SubItem[];
}

interface NavLink {
  readonly label: string;
  readonly href: string;
  readonly hasDropdown?: boolean;
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Shop", href: "/shop", hasDropdown: true },
  { label: "About Us", href: "/about" },
  { label: "Bulk Orders", href: "/bulk-orders" },
  { label: "Become a Seller", href: "/apply" },
] as const;

export const MEGA_MENU_DATA: readonly MegaMenuColumn[] = [
  {
    title: "Premium Plants",
    icon: Leaf,
    href: "/shop?type=Plants",
    colorClass: "text-emerald-600 bg-emerald-50",
    items: [
      { name: "Indoor Plants", href: `/shop?type=Plants&category=${encodeURIComponent("Indoor Plants")}` },
      { name: "Outdoor Plants", href: `/shop?type=Plants&category=${encodeURIComponent("Outdoor Plants")}` },
      { name: "Succulents", href: `/shop?type=Plants&category=${encodeURIComponent("Succulents")}` },
      { name: "Medicinal Plants", href: `/shop?type=Plants&category=${encodeURIComponent("Medicinal Plants")}` },
      { name: "Flowering Plants", href: `/shop?type=Plants&category=${encodeURIComponent("Flowering Plants")}` },
      { name: "Aromatic Plants", href: `/shop?type=Plants&category=${encodeURIComponent("Aromatic Plants")}` },
    ],
  },
  {
    title: "Designer Pots",
    icon: Container,
    href: "/shop?type=Pots",
    colorClass: "text-amber-700 bg-amber-50",
    items: [
      { name: "Indoor Pots", href: `/shop?type=Pots&category=${encodeURIComponent("Indoor Pots")}` },
      { name: "Outdoor Pots", href: `/shop?type=Pots&category=${encodeURIComponent("Outdoor Pots")}` },
      { name: "Hanging Planters", href: `/shop?type=Pots&category=${encodeURIComponent("Hanging Planters")}` },
      { name: "Ceramic Pots", href: `/shop?type=Pots&category=${encodeURIComponent("Ceramic Pots")}` },
      { name: "Terracotta Planters", href: `/shop?type=Pots&category=${encodeURIComponent("Terracotta Planters")}` },
      { name: "Plastic/Resin Pots", href: `/shop?type=Pots&category=${encodeURIComponent("Plastic/Resin Pots")}` },
    ],
  },
  {
    title: "Care & Accessories",
    icon: Wrench,
    href: "/shop?type=Accessories",
    colorClass: "text-blue-600 bg-blue-50",
    items: [
      { name: "Gardening Tools", href: `/shop?type=Accessories&category=${encodeURIComponent("Gardening Tools")}` },
      { name: "Fertilizers & Soil", href: `/shop?type=Accessories&category=${encodeURIComponent("Fertilizers & Soil")}` },
      { name: "Pest Control", href: `/shop?type=Accessories&category=${encodeURIComponent("Pest Control")}` },
      { name: "Watering Equipment", href: `/shop?type=Accessories&category=${encodeURIComponent("Watering Equipment")}` },
      { name: "Plant Stands & Decor", href: `/shop?type=Accessories&category=${encodeURIComponent("Plant Stands & Decor")}` },
      { name: "Hardware & Spares", href: `/shop?type=Accessories&category=${encodeURIComponent("Hardware & Spares")}` },
    ],
  },
  {
    title: "Gardening Tools",
    icon: Sprout,
    href: "/shop?type=Gardening Tools",
    colorClass: "text-teal-600 bg-teal-50",
    items: [
      { name: "Hand Tools", href: `/shop?type=Gardening%20Tools&category=${encodeURIComponent("Hand Tools")}` },
      { name: "Watering Equipment", href: `/shop?type=Gardening%20Tools&category=${encodeURIComponent("Watering Equipment")}` },
      { name: "Pruning Tools", href: `/shop?type=Gardening%20Tools&category=${encodeURIComponent("Pruning Tools")}` },
      { name: "Digging Tools", href: `/shop?type=Gardening%20Tools&category=${encodeURIComponent("Digging Tools")}` },
      { name: "Protective Gear", href: `/shop?type=Gardening%20Tools&category=${encodeURIComponent("Protective Gear")}` },
      { name: "Power Tools", href: `/shop?type=Gardening%20Tools&category=${encodeURIComponent("Power Tools")}` },
    ],
  },
  {
    title: "Plant Care",
    icon: ShieldAlert,
    href: "/shop?type=Plant Care",
    colorClass: "text-green-700 bg-green-50",
    items: [
      { name: "Organic Fertilizers", href: `/shop?type=Plant%20Care&category=${encodeURIComponent("Organic Fertilizers")}` },
      { name: "Pest Control", href: `/shop?type=Plant%20Care&category=${encodeURIComponent("Pest Control")}` },
      { name: "Soil Mixes & Substrates", href: `/shop?type=Plant%20Care&category=${encodeURIComponent("Soil Mixes & Substrates")}` },
      { name: "Plant Food & Nutrients", href: `/shop?type=Plant%20Care&category=${encodeURIComponent("Plant Food & Nutrients")}` },
      { name: "Fungicides", href: `/shop?type=Plant%20Care&category=${encodeURIComponent("Fungicides")}` },
      { name: "Growth Boosters", href: `/shop?type=Plant%20Care&category=${encodeURIComponent("Growth Boosters")}` },
    ],
  },
  {
    title: "Seeds & Bulbs",
    icon: Flower2,
    href: "/shop?type=Seeds & Bulbs",
    colorClass: "text-rose-600 bg-rose-50",
    items: [
      { name: "Vegetable Seeds", href: `/shop?type=Seeds%20%26%20Bulbs&category=${encodeURIComponent("Vegetable Seeds")}` },
      { name: "Flower Seeds", href: `/shop?type=Seeds%20%26%20Bulbs&category=${encodeURIComponent("Flower Seeds")}` },
      { name: "Fruit Seeds", href: `/shop?type=Seeds%20%26%20Bulbs&category=${encodeURIComponent("Fruit Seeds")}` },
      { name: "Herb Seeds", href: `/shop?type=Seeds%20%26%20Bulbs&category=${encodeURIComponent("Herb Seeds")}` },
      { name: "Bulbs & Rhizomes", href: `/shop?type=Seeds%20%26%20Bulbs&category=${encodeURIComponent("Bulbs & Rhizomes")}` },
      { name: "Microgreen Seeds", href: `/shop?type=Seeds%20%26%20Bulbs&category=${encodeURIComponent("Microgreen Seeds")}` },
    ],
  },
  {
    title: "Plant Stands",
    icon: Layers,
    href: "/shop?type=Plant Stands",
    colorClass: "text-indigo-600 bg-indigo-50",
    items: [
      { name: "Multi-Tier Shelves", href: `/shop?type=Plant%20Stands&category=${encodeURIComponent("Multi-Tier Shelves")}` },
      { name: "Single Pot Stands", href: `/shop?type=Plant%20Stands&category=${encodeURIComponent("Single Pot Stands")}` },
      { name: "Hanging Wall Racks", href: `/shop?type=Plant%20Stands&category=${encodeURIComponent("Hanging Wall Racks")}` },
      { name: "Corner Stands", href: `/shop?type=Plant%20Stands&category=${encodeURIComponent("Corner Stands")}` },
      { name: "Window Shelves", href: `/shop?type=Plant%20Stands&category=${encodeURIComponent("Window Shelves")}` },
    ],
  },
  {
    title: "Artificial & Dried",
    icon: Sparkles,
    href: "/shop?type=Artificial & Dried",
    colorClass: "text-purple-600 bg-purple-50",
    items: [
      { name: "Artificial Plants", href: `/shop?type=Artificial%20%26%20Dried&category=${encodeURIComponent("Artificial Plants")}` },
      { name: "Artificial Flowers", href: `/shop?type=Artificial%20%26%20Dried&category=${encodeURIComponent("Artificial Flowers")}` },
      { name: "Dried Botanical Decor", href: `/shop?type=Artificial%20%26%20Dried&category=${encodeURIComponent("Dried Botanical Decor")}` },
      { name: "Fake Succulents", href: `/shop?type=Artificial%20%26%20Dried&category=${encodeURIComponent("Fake Succulents")}` },
    ],
  },
] as const;

export default function DesktopNav({ textClass }: { readonly textClass: string }) {
  return (
    <div className="hidden md:flex items-center gap-4 lg:gap-8 h-full">
      {NAV_LINKS.map((link) => (
        <div key={link.label} className="group flex items-center h-full">
          {link.hasDropdown ? (
            <>
              <Link
                href={link.href}
                className={`text-[14px] lg:text-[15px] font-semibold no-underline flex items-center gap-1.5 py-2 cursor-pointer ${textClass}`}
              >
                <span>{link.label}</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </Link>

              {/* Centered Mega Menu Overlay Wrapper */}
              <div className="fixed left-1/2 -translate-x-1/2 top-[64px] w-[92vw] max-w-7xl hidden group-hover:block pointer-events-auto z-50 animate-fade-in pt-2">
                <div className="bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 lg:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 max-h-[80vh] overflow-y-auto">
                  {MEGA_MENU_DATA.map((col) => {
                    const Icon = col.icon;
                    return (
                      <div key={col.title} className="flex flex-col gap-3">
                        <Link
                          href={col.href}
                          className="flex items-center gap-2.5 pb-2 border-b border-slate-100 no-underline group/title text-slate-900 hover:text-green-600 transition-colors"
                        >
                          <div className={`p-1.5 lg:p-2 rounded-lg shrink-0 ${col.colorClass}`}>
                            <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          </div>
                          <span className="text-[13px] lg:text-[14px] font-bold tracking-tight truncate">
                            {col.title}
                          </span>
                        </Link>

                        <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                          {col.items.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                prefetch={false}
                                className="text-[12.5px] lg:text-[13px] font-medium text-slate-500 hover:text-green-600 no-underline flex items-center justify-between group/item transition-colors py-0.5"
                              >
                                <span className="truncate pr-1">{item.name}</span>
                                <ArrowRight className="w-3 h-3 text-green-600 opacity-0 -translate-x-1 transition-all group-hover/item:opacity-100 group-hover/item:translate-x-0 shrink-0" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <Link
              href={link.href}
              className={`text-[14px] lg:text-[15px] font-semibold no-underline ${textClass}`}
            >
              {link.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}