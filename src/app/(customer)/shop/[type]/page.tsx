import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck, Sparkles, BookOpen, HelpCircle } from "lucide-react";
import ShopCatalogClient from "@/components/customer/shop/ShopCatalogClient";
import { BreadcrumbJsonLd, FaqPageJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/config/site";

interface PageParams {
  type: string;
}

interface CategoryContent {
  name: string;
  mappedType: string;
  mappedCategory?: string;
  title: string;
  description: string;
  intro: string;
  buyingGuideTitle: string;
  buyingGuideText: string;
  careTips: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
}

const CATEGORY_DATABASE: Record<string, CategoryContent> = {
  plants: {
    name: "Live Plants",
    mappedType: "Plants",
    title: "Live Plants - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "Buy healthy live plants online in India. Handpicked from certified local nurseries, delivered in transit-safe eco-packaging with a 24-hour botanical guarantee.",
    intro:
      "Welcome to India's premier certified botanical marketplace. Every plant in our nursery collection is cultivated with organic soil blends, inspected by botanists for stem vigor and root health, and conditioned for apartment and home environments. With custom moisture-locked packaging and shock-absorbing cartons, your living greens arrive fresh, hydrated, and ready to thrive.",
    buyingGuideTitle: "Botanical Buying Guide: Choosing the Right Plants for Indian Climates",
    buyingGuideText:
      "Selecting plants for your living space requires understanding sunlight exposure, humidity, and room airflow. For low-light apartments in Mumbai or Bangalore, resilient species like Sansevieria and ZZ plants require minimal watering. In arid zones like Delhi NCR and Rajasthan, drought-hardy succulents and ficus varieties excel. All our specimens arrive potted in nutrient-rich compost with balanced drainage.",
    careTips: [
      {
        title: "Acclimatization Period",
        text: "Allow newly delivered plants to rest in bright indirect sunlight for 48 hours before watering or repotting.",
      },
      {
        title: "Soil Moisture Testing",
        text: "Always check the top 2 inches of soil before adding water to prevent root suffocation.",
      },
      {
        title: "Seasonal Nutrition",
        text: "Apply organic seaweed fertilizer or vermicompost every 4-6 weeks during spring and monsoon growth spurts.",
      },
    ],
    faqs: [
      {
        question: "How are live plants safely packaged for Pan-India courier transit?",
        answer:
          "Plants are wrapped in moisture-locking root barriers, secured with corrugated neck braces to prevent soil displacement, and housed in heavy-duty ventilated cartons that protect foliage from transit shock.",
      },
      {
        question: "What is the Urban Nursery 24-Hour Botanical Guarantee?",
        answer:
          "If your plant arrives damaged or stressed from courier transit, share photos within 24 hours of delivery for an immediate free replacement or full refund.",
      },
    ],
  },
  pots: {
    name: "Pots & Planters",
    mappedType: "Pots",
    title: "Pots & Planters - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "Shop handcrafted ceramic pots, terracotta planters, and lightweight fiber containers with drainage holes for indoor and outdoor gardening in India.",
    intro:
      "Explore handcrafted ceramic, terracotta, and fiber planters designed to elevate plant health and modern interiors. Our pots feature precision-engineered drainage holes to prevent root rot, breathable wall compositions for root aeration, and durable lead-free glazes. Sourced directly from artisan potteries and verified greenhouse suppliers across India.",
    buyingGuideTitle: "Selecting Planters: Material, Sizing & Aeration Dynamics",
    buyingGuideText:
      "The choice of pot material directly influences watering frequency and root temperature. Terracotta and unglazed clay provide porous breathability ideal for succulents, while glazed ceramic maintains consistent root moisture for tropical foliage. When upgrading pot sizes, follow the 2-inch rule: select a diameter 2 inches larger than the current nursery container to promote healthy root spread without waterlogging.",
    careTips: [
      {
        title: "Drainage Management",
        text: "Always use matching saucers or cachepots to protect flooring while allowing excess drainage water to drain away freely.",
      },
      {
        title: "Salt Buildup Cleaning",
        text: "Wipe mineral salt deposits from terracotta pots twice annually using a gentle solution of diluted white vinegar.",
      },
    ],
    faqs: [
      {
        question: "Do all pots come with drainage holes?",
        answer:
          "Yes, all functional pots listed on Urban Nursery feature pre-drilled drainage holes to ensure proper soil aeration and prevent root rot.",
      },
      {
        question: "How do you prevent ceramic pots from cracking during transit?",
        answer:
          "Every pot is encased in 3-ply air bubble cushioning, reinforced corner guards, and rigid honeycomb packing boxes to ensure zero transit breakage.",
      },
    ],
  },
  accessories: {
    name: "Plant Accessories",
    mappedType: "Accessories",
    title: "Plant Accessories - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "Premium plant accessories: moss poles, moisture meters, drainage trays, decorative stones, and watering cans for home gardeners in India.",
    intro:
      "Upgrade your indoor garden with specialized plant care accessories. From organic coconut coir climbing poles that support aerial roots of Monstera and Philodendron, to digital soil pH and moisture meters that eliminate guessing, our accessories are verified by botanists for functionality, durability, and plant wellness across all seasons.",
    buyingGuideTitle: "Essential Accessories for Thriving Indoor Jungle Environments",
    buyingGuideText:
      "Supporting climbing vines with extendable moss poles mimics the humid bark of rainforest trees, encouraging larger fenestrations in tropical plants. Pair this with precision narrow-spout watering cans to direct hydration straight to the root ball without splashing sensitive leaves.",
    careTips: [
      {
        title: "Moisture Pole Hydration",
        text: "Keep coir and sphagnum moss poles lightly misted so aerial roots can absorb ambient humidity.",
      },
    ],
    faqs: [
      {
        question: "Are your moss poles extendable?",
        answer:
          "Yes, our stackable coir poles feature hollow PVC cores that allow adding extension rods as your vines mature.",
      },
    ],
  },
  "gardening-tools": {
    name: "Gardening Tools",
    mappedType: "Gardening Tools",
    title: "Gardening Tools - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "Heavy-duty gardening tools: stainless steel pruning shears, ergonomic trowels, transplanters, and garden gloves engineered for longevity.",
    intro:
      "Equip your botanical journey with professional-grade pruning shears, precision snips, and rust-resistant hand trowels. Built with high-carbon steel blades and ergonomic hardwood handles, our gardening tools deliver clean surgical cuts that heal quickly, preventing infection and promoting vigorous branching.",
    buyingGuideTitle: "Tool Maintenance and Clean Pruning Guidelines",
    buyingGuideText:
      "Dull blades crush plant vascular tissues rather than slicing them cleanly, creating entry wounds for bacterial pathogens. Investing in hardened bypass pruners ensures micro-clean cuts. Sterilize cutting blades with 70% isopropyl alcohol between plants to prevent transmitting fungal spores.",
    careTips: [
      {
        title: "Blade Sharpening",
        text: "Hone cutting edges twice per season with a whetstone and apply mineral oil to prevent oxidation.",
      },
    ],
    faqs: [
      {
        question: "What is the difference between bypass and anvil pruners?",
        answer:
          "Bypass pruners act like scissors for live green stems with clean cuts, whereas anvil pruners crush dead wood and woody stems.",
      },
    ],
  },
  "plant-care": {
    name: "Plant Care Products",
    mappedType: "Plant Care",
    title: "Plant Care Products - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "Organic fertilizers, cold-pressed neem oil sprays, potting mixes, and botanical soil amendments for vibrant houseplant health.",
    intro:
      "Nourish your plants with laboratory-tested organic plant food, microbe-inoculated vermicompost, and non-toxic bio-pest defense formulas. Our plant care essentials restore natural soil microbiomes, strengthen cellular leaf walls, and defend against spider mites, mealybugs, and fungal gnats without toxic synthetic chemicals.",
    buyingGuideTitle: "Organic Soil Biology & Nutrient Feeding Cycles",
    buyingGuideText:
      "Indoor plants rely entirely on the nutrients present in their potting container. Over time, frequent watering leaches nitrogen and trace minerals from potting soil. Gentle, slow-release bio-fertilizers replenish micronutrients without chemical burn risks, sustaining steady root vigor.",
    careTips: [
      {
        title: "Foliar Spraying Schedule",
        text: "Apply neem oil sprays in the early morning or evening to prevent leaf scorch from intense sunlight.",
      },
    ],
    faqs: [
      {
        question: "Are your fertilizers pet-safe and non-toxic?",
        answer:
          "Yes, our certified plant care solutions use plant-derived organic compounds safe for homes with dogs and cats.",
      },
    ],
  },
  "seeds-bulbs": {
    name: "Seeds & Bulbs",
    mappedType: "Seeds & Bulbs",
    title: "Seeds & Bulbs - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "High-germination vegetable seeds, herb seeds, and seasonal flower bulbs tested for Indian climate zones and urban balcony gardens.",
    intro:
      "Grow fresh organic vegetables, fragrant culinary herbs, and seasonal blooms from certified high-germination seed stocks. Sourced from sustainable seed-saving cooperatives and agricultural universities, each packet is vacuum-sealed to preserve embryo vitality and disease resistance.",
    buyingGuideTitle: "Seed Starting Success: Germination Substrates and Seasons",
    buyingGuideText:
      "Successful seed germination requires light, airy substrate like sterile cocopeat mixed with perlite. Maintain consistent moisture with a fine misting sprayer until seedlings develop their first true leaves.",
    careTips: [
      {
        title: "Germination Depth",
        text: "Sow seeds at a depth equal to roughly twice their diameter; tiny seeds should be lightly pressed onto the soil surface.",
      },
    ],
    faqs: [
      {
        question: "What is the average germination rate of your seeds?",
        answer:
          "Our seed lots undergo rigorous batch testing to ensure a minimum 80-90% germination rate under recommended conditions.",
      },
    ],
  },
  "plant-stands-shelves": {
    name: "Plant Stands & Shelves",
    mappedType: "Plant Stands",
    title: "Plant Stands & Shelves - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "Rustproof metal plant stands, multi-tier bamboo shelving, and space-saving balcony displays engineered for heavy pots.",
    intro:
      "Maximize natural window light and balcony space with engineered powder-coated metal and sustainably harvested bamboo plant stands. Designed to support heavy ceramic and terracotta pots safely while elevating foliage to optimize air circulation and sunlight exposure.",
    buyingGuideTitle: "Spatial Geometry & Weight Capacity Considerations",
    buyingGuideText:
      "When arranging multiple plants on a multi-tier stand, place heavier, water-retentive ceramic pots on the lowest shelves for structural stability. Position light-hungry flowering varieties on upper tiers where ambient lumens are highest.",
    careTips: [
      {
        title: "Balcony Weatherproofing",
        text: "Wipe down outdoor stands seasonally to maintain the electrostatic rust-inhibiting coating.",
      },
    ],
    faqs: [
      {
        question: "What is the weight capacity per shelf?",
        answer:
          "Our heavy-duty steel stands support between 20kg to 50kg per tier, accommodating large mature pots with ease.",
      },
    ],
  },
  "artificial-dried-plants": {
    name: "Artificial & Dried Plants",
    mappedType: "Artificial & Dried Plants",
    title: "Artificial & Dried Plants - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "Ultra-realistic faux botanical trees, UV-resistant artificial succulents, and preserved dried floral arrangements for zero-maintenance decor.",
    intro:
      "Enjoy timeless greenery in zero-light basements, corporate conference rooms, and high-heat corridors with botanically accurate faux trees and preserved floral arrangements. Crafted with silk blends and real wood trunks for hyper-realistic textures.",
    buyingGuideTitle: "Styling and Maintaining Botanical Replicas",
    buyingGuideText:
      "Pair high-grade artificial plants with authentic ceramic planters topped with real river pebbles to blend seamlessly into residential interiors.",
    careTips: [
      {
        title: "Dusting Maintenance",
        text: "Dust leaves monthly using a gentle microfiber cloth or cool hairdryer setting to preserve vibrant colors.",
      },
    ],
    faqs: [
      {
        question: "Are your artificial plants UV-resistant?",
        answer:
          "Yes, our outdoor-rated faux plants feature built-in UV stabilizers that prevent fading and leaf brittleness under direct sun.",
      },
    ],
  },
  "indoor-plants": {
    name: "Indoor Plants",
    mappedType: "Plants",
    mappedCategory: "Indoor Plants",
    title: "Indoor Plants - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "Best indoor plants for home and office: Snake Plants, ZZ Plants, Money Plants, and Monsteras delivered alive across India with 24h guarantee.",
    intro:
      "Bring nature inside with low-maintenance, air-purifying indoor plants tailored for apartment living. Proven to filter household toxins like formaldehyde and benzene, our indoor botanicals thrive in indirect light, requiring minimal watering while transforming bedrooms, work desks, and living rooms into lush green sanctuaries.",
    buyingGuideTitle: "Choosing Indoor Plants by Room Lighting Conditions",
    buyingGuideText:
      "Rooms with north-facing windows or fluorescent office lighting are ideal for shade-tolerant cultivars like Aglaonema and ZZ plants. East or west-facing windows offer bright indirect sunlight perfect for Fiddle Leaf Figs and Monsteras.",
    careTips: [
      {
        title: "Preventing Overwatering",
        text: "Indoor plants consume water slower than outdoor plants; ensure soil dries partially before hydrating.",
      },
    ],
    faqs: [
      {
        question: "Which indoor plants require the least light?",
        answer:
          "Snake plants, ZZ plants, Cast Iron plants, and Peace Lilies tolerate low-light rooms with ease.",
      },
    ],
  },
  "air-purifying": {
    name: "Air Purifying Plants",
    mappedType: "Plants",
    mappedCategory: "Air Purifying",
    title: "Air Purifying Plants - Buy Fresh Live Plants Online | Urban Nursery India",
    description:
      "NASA-recommended air-purifying plants: Peace Lilies, Areca Palms, and Spider Plants to clean indoor air naturally across India.",
    intro:
      "Breathe cleaner, oxygen-rich air naturally with botanist-curated air-purifying plants. Tested according to NASA clean air studies, these varieties actively absorb airborne volatile organic compounds (VOCs), household dust, and chemical odors while elevating indoor humidity for easier breathing.",
    buyingGuideTitle: "Optimizing Plant Density for Maximum Air Purification",
    buyingGuideText:
      "NASA clean air research suggests keeping at least 1-2 medium-sized air-purifying plants per 100 square feet of living space to achieve measurable reduction in indoor pollutants.",
    careTips: [
      {
        title: "Dusting Foliage",
        text: "Clean leaf surfaces with a damp cloth every fortnight so plant pores (stomata) can absorb airborne pollutants efficiently.",
      },
    ],
    faqs: [
      {
        question: "Do air purifying plants produce oxygen at night?",
        answer:
          "Yes, cultivars like Snake Plants and Aloe Vera practice Crassulacean Acid Metabolism (CAM), releasing oxygen continuously throughout the night.",
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { type } = await params;
  const cleanType = type?.toLowerCase()?.trim();
  const category = CATEGORY_DATABASE[cleanType];

  if (!category) {
    return {
      title: "Category Not Found | Urban Nursery India",
      robots: { index: false, follow: true },
    };
  }

  const url = `${SITE_URL}/shop/${cleanType}`;

  return {
    title: category.title,
    description: category.description,
    openGraph: {
      title: category.title,
      description: category.description,
      url,
      siteName: "Urban Nursery",
      type: "website",
      images: [
        {
          url: "/images/logo-new.png",
          width: 1200,
          height: 630,
          alt: `${category.name} - Urban Nursery India`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: category.title,
      description: category.description,
      images: ["/images/logo-new.png"],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { type } = await params;
  const cleanType = type?.toLowerCase()?.trim();
  const category = CATEGORY_DATABASE[cleanType];

  if (!category) {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Shop", url: `${SITE_URL}/shop` },
    { name: category.name, url: `${SITE_URL}/shop/${cleanType}` },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FaqPageJsonLd items={category.faqs} />

      <div className="w-full max-w-[1240px] mx-auto">
        {/* ── Semantic Breadcrumb Trail ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-emerald-700 transition font-medium no-underline">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/shop" className="hover:text-emerald-700 transition font-medium no-underline">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-emerald-800 font-bold" aria-current="page">
            {category.name}
          </span>
        </nav>

        {/* ── Category Header & Top Botanical Content (80-120 words) ── */}
        <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border border-emerald-100 rounded-3xl p-6 sm:p-10 mb-10 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-full">
              Botanist Certified Collection
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              24-Hour Botanical Guarantee
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            {category.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
            {category.intro}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700 border-t border-emerald-100/80 pt-4">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              Pan-India Express Delivery across 150+ Cities
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Eco-Packaging to Prevent Transit Shock
            </span>
          </div>
        </div>

        {/* ── Product Catalog Section ── */}
        <Suspense fallback={<div className="h-96 bg-slate-100 rounded-2xl animate-pulse mb-12" />}>
          <ShopCatalogClient
            initialType={category.mappedType}
            initialCategory={category.mappedCategory}
          />
        </Suspense>

        {/* ── Category Bottom: Botanical Buying & Care Guide ── */}
        <div className="mt-16 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              Topical Botanical Authority
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {category.buyingGuideTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-4xl">
              {category.buyingGuideText}
            </p>
          </div>

          {/* Care Tips Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            {category.careTips.map((tip, idx) => (
              <div key={idx} className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-1.5">
                <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  {tip.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>

          {/* Frequently Asked Questions */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              Frequently Asked Questions About {category.name}
            </h3>
            <div className="space-y-3">
              {category.faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{faq.question}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
