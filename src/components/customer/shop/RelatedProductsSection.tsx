"use client";

import ShopItemCard, { ShopItemType } from "@/components/customer/common/ShopItemCard";
import { determineProductTag } from "@/utils/productBadge";

interface RelatedProductNode {
  _id?: string;
  id?: string;
  slug?: string;
  name: string;
  price: number;
  ratings?: number;
  rating?: number;
  category?: string;
  vendor?: string | { name?: string; location?: string; _id?: string; id?: string; slug?: string; businessName?: string };
  nursery?: { name?: string; location?: string; _id?: string; id?: string; slug?: string; businessName?: string; nurseryId?: string };
  vendorId?: string;
  vendorSlug?: string;
  vendorName?: string;
  nurseryId?: string;
  coverImage?: { url: string };
  stock?: number;
}

interface RelatedProductsSectionProps {
  relatedItems: RelatedProductNode[];
  targetType: string; // "plants" | "pots" | "accessories"
  itemTypeLabel: string; // e.g., "Plants", "Pots"
}

export default function RelatedProductsSection({
  relatedItems,
  targetType,
  itemTypeLabel,
}: RelatedProductsSectionProps) {

  if (!relatedItems || relatedItems.length === 0) return null;

  return (
    <div className="mt-20 pt-10 border-t border-line/50">
      <h3 className="text-sm font-black uppercase tracking-wider text-brand-dark mb-1">
        🌿 Similar Collections You May Like
      </h3>
      <p className="text-[11px] text-muted-text m-0 mb-6">
        Explore more curated assets from our primary {itemTypeLabel} logs.
      </p>

      {/* Responsive layout matches standard marketplace grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {relatedItems.map((prod, index) => {
          const prodId = prod._id || prod.id || "";
          const prodSlug = prod.slug || prodId;

          // 🌟 Dynamic Vendor / Nursery node fallback extraction
          const nurseryObj = typeof prod.nursery === "object" ? prod.nursery : null;
          const vendorObj = typeof prod.vendor === "object" ? prod.vendor : null;

          const vendorName =
            (prod as any).vendorName ||
            nurseryObj?.name ||
            vendorObj?.name ||
            (typeof prod.vendor === "string" ? prod.vendor : null) ||
            "Certified Nursery";

          const vendorId =
            (prod as any).vendorId ||
            nurseryObj?._id ||
            vendorObj?._id ||
            (typeof prod.nursery === "string" ? prod.nursery : undefined);

          const vendorSlug =
            (prod as any).vendorSlug ||
            nurseryObj?.slug ||
            vendorObj?.slug ||
            vendorName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

          // 🌟 Adapt standard item interface layout mappings securely
          const adaptedItem: ShopItemType = {
            id: prodId,
            slug: prodSlug,
            type: targetType as ShopItemType["type"],
            category: prod.category || "Standard Tier",
            name: prod.name || "Ecosystem Unit",
            vendor: vendorName,
            vendorName: vendorName,
            vendorId: vendorId ? String(vendorId) : undefined,
            vendorSlug: vendorSlug ? String(vendorSlug) : undefined,
            nurseryId: (prod as any).nurseryId || (nurseryObj as any)?.nurseryId,
            price: ((prod as any).discountPrice > 0 && (prod as any).discountPrice < prod.price)
              ? (prod as any).discountPrice
              : (prod.price || 0),
            originalPrice: ((prod as any).discountPrice > 0 && (prod as any).discountPrice < prod.price)
              ? (prod.price || 0)
              : null,
            rating: prod.ratings || prod.rating || 4.5,
            reviews: 5, // Static or fallback count tracking
            badge: (prod.stock ?? 1) > 0 ? "In Stock" : "Unavailable",
            badgeColor: (prod.stock ?? 1) > 0 ? "#15803d" : "#dc2626",
            tag: determineProductTag({
              ...prod,
              stock: prod.stock ?? 1,
              ratings: prod.ratings || prod.rating,
              reviewsCount: (prod as any).numOfReviews || (prod as any).reviews?.length,
              discountPrice: (prod as any).discountPrice,
            }),
            isBestSeller: (prod as any).isBestSeller ?? (prod as any).isBestseller,
            isBestseller: (prod as any).isBestseller ?? (prod as any).isBestSeller,
            isFeatured: (prod as any).isFeatured,
            isNewArrival: (prod as any).isNewArrival,
            totalSales: (prod as any).totalSales ?? (prod as any).salesCount,
            salesCount: (prod as any).salesCount ?? (prod as any).totalSales,
            tags: (prod as any).tags,
            stock: prod.stock ?? 1,
            discountPrice: (prod as any).discountPrice,
            createdAt: (prod as any).createdAt,
            emoji:
              prod.coverImage?.url ||
              (targetType === "pots"
                ? "🏺"
                : targetType === "accessories"
                  ? "🛠️"
                  : targetType === "gardening-tools"
                    ? "🔧"
                    : targetType === "plant-care"
                      ? "🧪"
                      : targetType === "seeds-bulbs"
                        ? "🌱"
                        : targetType === "plant-stands-shelves"
                          ? "🪜"
                          : "🌿"),
          };

          return (
            <ShopItemCard
              key={prodId}
              item={adaptedItem}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}