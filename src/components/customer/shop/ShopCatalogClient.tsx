"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ShopItemCard, { ShopItemType } from "@/components/customer/common/ShopItemCard";
import { determineProductTag } from "@/utils/productBadge";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import PlantLoader from "@/components/customer/common/PlantLoader";
import { productService } from "@/services/productService";
import {
  setProductLoading,
  setProductError,
  setAllProductsData,
} from "@/redux/slices/productSlice";

const ITEMS_PER_PAGE = 12;

type ShopTabType =
  | "All"
  | "Plants"
  | "Pots"
  | "Accessories"
  | "Gardening Tools"
  | "Plant Care"
  | "Seeds & Bulbs"
  | "Plant Stands"
  | "Artificial & Dried Plants";

type ShopUrlType = ShopItemType["type"];

const TAB_OPTIONS: ShopTabType[] = [
  "All",
  "Plants",
  "Pots",
  "Accessories",
  "Gardening Tools",
  "Plant Care",
  "Seeds & Bulbs",
  "Plant Stands",
  "Artificial & Dried Plants",
];

const URL_TYPE_TO_TAB: Record<string, ShopTabType> = {
  Plants: "Plants",
  Pots: "Pots",
  Accessories: "Accessories",
  plants: "Plants",
  pots: "Pots",
  accessories: "Accessories",
  "gardening-tools": "Gardening Tools",
  "Gardening Tools": "Gardening Tools",
  "plant-care": "Plant Care",
  "Plant Care": "Plant Care",
  "seeds-bulbs": "Seeds & Bulbs",
  "Seeds & Bulbs": "Seeds & Bulbs",
  "plant-stands-shelves": "Plant Stands",
  "Plant Stands": "Plant Stands",
  "stands-shelves": "Plant Stands",
  "artificial-dried-plants": "Artificial & Dried Plants",
  "Artificial & Dried Plants": "Artificial & Dried Plants",
  "artificial-dried": "Artificial & Dried Plants",
};

const TAB_TO_CATEGORY: Record<ShopTabType, string | undefined> = {
  All: undefined,
  Plants: "plants",
  Pots: "pots",
  Accessories: "accessories",
  "Gardening Tools": "gardening-tools",
  "Plant Care": "plant-care",
  "Seeds & Bulbs": "seeds-bulbs",
  "Plant Stands": "plant-stands-shelves",
  "Artificial & Dried Plants": "artificial-dried",
};

const CATEGORY_TO_URL_TYPE: Record<string, ShopUrlType> = {
  plants: "plants",
  pots: "pots",
  accessories: "accessories",
  "gardening-tools": "gardening-tools",
  "plant-care": "plant-care",
  "seeds-bulbs": "seeds-bulbs",
  "plant-stands-shelves": "plant-stands-shelves",
  "stands-shelves": "plant-stands-shelves",
  "artificial-dried": "artificial-dried-plants",
};

const FALLBACK_EMOJI: Record<ShopUrlType, string> = {
  plants: "🌿",
  pots: "🏺",
  accessories: "🛠️",
  "gardening-tools": "🔧",
  "plant-care": "🧪",
  "seeds-bulbs": "🌱",
  "plant-stands-shelves": "🪜",
  "artificial-dried-plants": "🌵",
};

export interface ShopCatalogClientProps {
  initialType?: string;
  initialCategory?: string;
}

export default function ShopCatalogClient({
  initialType,
  initialCategory,
}: ShopCatalogClientProps = {}) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  // Extract catalog state from unified Redux slice
  const {
    products: catalogProducts,
    totalProducts,
    filteredCount,
    isLoading: isSyncing,
    error: productError,
  } = useAppSelector((state) => state.product);

  // Navigation & UI Operational States
  const [activeType, setActiveType] = useState<ShopTabType>(() => {
    if (initialType && URL_TYPE_TO_TAB[initialType]) return URL_TYPE_TO_TAB[initialType];
    return "All";
  });
  const [activeSubCategory, setActiveSubCategory] = useState<string>(() => initialCategory || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceSort, setPriceSort] = useState<"default" | "lowToHigh" | "highToLow">("default");
  const [selectedTag, setSelectedTag] = useState<string>("All Tags");
  const [currentPage, setCurrentPage] = useState(1);
  const [userPincode, setUserPincode] = useState<string | null>(null);

  // Synchronize dynamic URL parameter modifications from Mega Menu & Hero clicks
  useEffect(() => {
    const urlType = searchParams.get("type") || initialType;
    const urlCategory = searchParams.get("category") || initialCategory;
    const urlSearch = searchParams.get("search");

    if (urlType && URL_TYPE_TO_TAB[urlType]) {
      setActiveType(URL_TYPE_TO_TAB[urlType]);
    } else {
      setActiveType("All");
    }

    if (urlCategory) {
      setActiveSubCategory(urlCategory);
    } else {
      setActiveSubCategory("All");
    }

    if (urlSearch) {
      setSearchQuery(urlSearch);
      setDebouncedSearch(urlSearch);
    } else {
      setSearchQuery("");
      setDebouncedSearch("");
    }

    setCurrentPage(1);
  }, [searchParams, initialType, initialCategory]);

  // Hydration-safe localStorage read (runs only on client after mount)
  useEffect(() => {
    const savedPincode = localStorage.getItem("hyperlocal_pincode");
    if (savedPincode) setUserPincode(savedPincode);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTypeChange = (type: ShopTabType) => {
    setActiveType(type);
    setActiveSubCategory("All");
    setCurrentPage(1);
  };

  const handleClearPincode = () => {
    localStorage.removeItem("hyperlocal_pincode");
    setUserPincode(null);
    window.location.reload();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setActiveSubCategory("All");
    setSelectedTag("All Tags");
    setPriceSort("default");
    setCurrentPage(1);
  };

  // Unified single catalog sync routine against /api/v1/products
  useEffect(() => {
    let isMounted = true;

    const syncMarketplaceCatalog = async () => {
      try {
        dispatch(setProductLoading(true));

        const targetCategory = TAB_TO_CATEGORY[activeType];
        const filters: Record<string, any> = {
          limit: activeType === "All" ? 48 : ITEMS_PER_PAGE,
          page: activeType === "All" ? 1 : currentPage,
        };

        if (targetCategory) {
          filters.category = targetCategory;
        }

        if (debouncedSearch.trim()) {
          filters.keyword = debouncedSearch.trim();
        }

        if (activeSubCategory && activeSubCategory !== "All") {
          filters.subCategory = activeSubCategory;
        }

        const res = await productService.getProducts(filters);

        if (isMounted) {
          dispatch(
            setAllProductsData({
              products: res.products || [],
              totalCount: res.totalCount ?? (res.products?.length || 0),
              filteredCount: res.filteredCount ?? (res.products?.length || 0),
            })
          );
        }
      } catch (err: any) {
        if (isMounted) {
          dispatch(
            setProductError(
              err?.response?.data?.message || err?.message || "Failed to load catalog products."
            )
          );
        }
      }
    };

    syncMarketplaceCatalog();
    return () => {
      isMounted = false;
    };
  }, [activeType, activeSubCategory, debouncedSearch, currentPage, dispatch, userPincode]);

  const mappedMarketItems = useMemo<ShopItemType[]>(() => {
    if (!Array.isArray(catalogProducts)) return [];

    return catalogProducts.map((product: any) => {
      const nurseryName =
        product.vendorName ||
        (typeof product.vendor === "string" ? product.vendor : product.vendor?.name || product.vendor?.businessName) ||
        product.businessName ||
        (typeof product.nursery === "string" ? product.nursery : product.nursery?.name || product.nursery?.businessName) ||
        "Urban Nursery";

      const nurseryLoc =
        (typeof product.vendor === "object" ? product.vendor?.location || product.vendor?.city : null) ||
        (typeof product.nursery === "object" ? product.nursery?.location || product.nursery?.city : null) ||
        product.city ||
        "Indore";

      const vendorId =
        product.vendorId ||
        (typeof product.vendor === "object" ? product.vendor?._id || product.vendor?.id : null) ||
        (typeof product.nursery === "object" ? product.nursery?._id || product.nursery?.id : null) ||
        (typeof product.nursery === "string" ? product.nursery : null);

      const vendorSlug =
        product.vendorSlug ||
        (typeof product.vendor === "object" ? product.vendor?.slug : null) ||
        (typeof product.nursery === "object" ? product.nursery?.slug : null) ||
        nurseryName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

      const nurseryUserId =
        product.nurseryId ||
        (typeof product.vendor === "object" ? product.vendor?.nurseryId : null) ||
        (typeof product.nursery === "object" ? product.nursery?.nurseryId : null) ||
        (typeof product.nursery === "string" ? product.nursery : undefined);

      const determinedType: ShopUrlType =
        CATEGORY_TO_URL_TYPE[product.category] || "plants";

      const calculatedStock = product.stock ?? 0;
      const generatedSlug =
        product.slug ||
        product.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

      return {
        id: product._id,
        slug: generatedSlug,
        type: determinedType,
        category: product.category || "General",
        subCategory: product.attributes?.subCategory,
        name: product.name,
        vendor: `${nurseryName}, ${nurseryLoc || "Indore"}`,
        vendorName: nurseryName,
        vendorId: vendorId ? String(vendorId) : undefined,
        vendorSlug: vendorSlug ? String(vendorSlug) : undefined,
        nurseryId: nurseryUserId ? String(nurseryUserId) : undefined,
        price:
          product.discountPrice > 0 && product.discountPrice < product.price
            ? product.discountPrice
            : product.price || 0,
        originalPrice:
          product.discountPrice > 0 && product.discountPrice < product.price
            ? product.price || 0
            : null,
        rating: product.ratingsAverage || product.ratings || 4.5,
        reviews: product.ratingsQuantity || product.numOfReviews || 0,
        badge: calculatedStock > 0 ? "Fresh Stock" : "Out of Stock",
        badgeColor: calculatedStock > 0 ? "#15803d" : "#dc2626",
        tag: determineProductTag({
          ...product,
          stock: calculatedStock,
          ratings: product.ratingsAverage || product.ratings,
          reviewsCount: product.ratingsQuantity || product.numOfReviews,
        }),
        emoji:
          product.coverImage?.url ||
          product.images?.[0]?.url ||
          FALLBACK_EMOJI[determinedType],
        isBestSeller: product.isBestSeller ?? product.isBestseller,
        isBestseller: product.isBestseller ?? product.isBestSeller,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        totalSales: product.totalSales ?? product.salesCount,
        salesCount: product.salesCount ?? product.totalSales,
        tags: product.tags,
        stock: calculatedStock,
        ratings: product.ratingsAverage || product.ratings,
        reviewsCount: product.ratingsQuantity || product.numOfReviews,
        discountPrice: product.discountPrice,
        createdAt: product.createdAt,
      };
    });
  }, [catalogProducts]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...mappedMarketItems];

    if (activeType === "All" && activeSubCategory !== "All") {
      result = result.filter(
        (item) =>
          item.category === activeSubCategory ||
          (Array.isArray(item.tags) && item.tags.some((t: string) => t.toLowerCase() === activeSubCategory.toLowerCase())) ||
          (typeof item.tags === "string" && item.tags.toLowerCase().includes(activeSubCategory.toLowerCase())) ||
          ((item as any).subCategory && String((item as any).subCategory).toLowerCase() === activeSubCategory.toLowerCase())
      );
    }

    if (selectedTag !== "All Tags") {
      result = result.filter((item) => item.tag === selectedTag);
    }

    if (priceSort === "lowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (priceSort === "highToLow") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [mappedMarketItems, selectedTag, priceSort, activeType, activeSubCategory]);

  const visibleItems = useMemo(() => {
    if (activeType === "All") {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredAndSortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }
    return filteredAndSortedItems;
  }, [filteredAndSortedItems, activeType, currentPage]);

  const availableSubCategories = useMemo(() => {
    if (activeType === "Plants") {
      return ["All", "Indoor Plants", "Outdoor Plants", "Succulents", "Medicinal Plants", "Flowering Plants", "Aromatic Plants", "Air Purifying Plants", "Foliage Plants", "Bonsai", "Terrarium Plants", "Pet-Friendly Plants"];
    }
    if (activeType === "Pots") {
      return ["All", "Indoor Pots", "Outdoor Pots", "Hanging Planters", "Ceramic Pots", "Terracotta Planters", "Plastic/Resin Pots", "Metal Pots", "Fabric Grow Bags", "Self-Watering Pots"];
    }
    if (activeType === "Accessories") {
      return ["All", "Gardening Tools", "Fertilizers & Soil", "Pest Control", "Watering Equipment", "Plant Stands & Decor", "Hardware & Spares", "Decorative Stones & Pebbles", "Drip Irrigation Kits"];
    }
    if (activeType === "Gardening Tools") {
      return ["All", "Hand Tools", "Watering Equipment", "Pruning Tools", "Digging Tools", "Protective Gear", "Power Tools", "Moss Poles & Supports", "Leaf Polish & Care"];
    }
    if (activeType === "Plant Care") {
      return ["All", "Organic Fertilizers", "Pest Control", "Soil Mixes & Substrates", "Plant Food & Nutrients", "Fungicides", "Growth Boosters"];
    }
    if (activeType === "Seeds & Bulbs") {
      return ["All", "Vegetable Seeds", "Flower Seeds", "Fruit Seeds", "Herb Seeds", "Bulbs & Rhizomes", "Microgreen Seeds"];
    }
    if (activeType === "Plant Stands") {
      return ["All", "Multi-Tier Shelves", "Single Pot Stands", "Hanging Wall Racks", "Corner Stands", "Window Shelves"];
    }
    if (activeType === "Artificial & Dried Plants") {
      return ["All", "Artificial Plants", "Artificial Flowers", "Dried Botanical Decor", "Fake Succulents", "Decorative Branches", "Preserved Moss & Ferns"];
    }
    return ["All"];
  }, [activeType]);

  const totalPages = useMemo(() => {
    const totalCount = activeType === "All" ? filteredAndSortedItems.length : filteredCount || totalProducts;
    return Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
  }, [activeType, filteredAndSortedItems.length, filteredCount, totalProducts]);

  const isAnyFilterActive = useMemo(() => {
    return searchQuery.trim() !== "" || activeSubCategory !== "All" || selectedTag !== "All Tags" || priceSort !== "default";
  }, [searchQuery, activeSubCategory, selectedTag, priceSort]);

  const showLoader = isSyncing && visibleItems.length === 0;

  return (
    <main className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-[1200px] mx-auto">

        {/* FILTER ENGINE PANEL */}
        <div className="bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary border border-white/10 rounded-2xl p-6 mb-10 shadow-2xl flex flex-col gap-6 backdrop-blur-md">
          {/* Main Category Tabs */}
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/10 pb-5">
            <div className="flex gap-2.5 flex-wrap">
              {TAB_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`border rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-all duration-200 active:scale-95 ${activeType === type
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "bg-white/5 text-emerald-100/80 border-white/10 hover:border-emerald-500/50 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {type === "All" ? "Everything" : type}
                </button>
              ))}
            </div>

            {userPincode && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-300 font-semibold bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 shadow-inner flex items-center gap-1.5">
                  <span className="animate-pulse">📍</span> Delivering near {userPincode}
                </span>
                <button
                  type="button"
                  onClick={handleClearPincode}
                  className="text-xs text-emerald-300/60 hover:text-emerald-200 underline cursor-pointer ml-1"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Sub-categories Pills */}
          {availableSubCategories.length > 1 && (
            <div className="flex flex-col gap-3 bg-black/25 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Explore Categories
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {availableSubCategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      setActiveSubCategory(sub);
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${activeSubCategory === sub
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                      : "bg-white/5 text-white/70 border-white/5 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search, Sorting, and Secondary Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products across catalog..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="default">Sort by: Featured</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="All Tags">All Badges</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Trending">Trending</option>
                <option value="Featured">Featured</option>
                <option value="New Arrival">New Arrival</option>
              </select>
            </div>

            {isAnyFilterActive && (
              <div className="flex items-center sm:col-span-2 lg:col-span-1 justify-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-emerald-300 hover:text-white font-semibold underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FEEDBACK STATUS AND CATALOG GRID */}
        {productError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
            ⚠️ {productError}
          </div>
        )}

        {showLoader ? (
          <div className="py-24 flex justify-center items-center">
            <PlantLoader />
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {visibleItems.map((item, idx) => (
              <ShopItemCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        ) : isAnyFilterActive ? (
          <div className="text-center py-20 bg-panel border border-line rounded-[24px] max-w-2xl mx-auto shadow-sm animate-scale-up">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-lg font-bold text-foreground m-0 px-4">
              No results found for applied filters
            </h3>
            <p className="text-muted-text text-xs mt-2 max-w-md mx-auto px-6 leading-relaxed">
              No items match your selected filter combination. Please modify or clear your filters.
            </p>
            <div className="flex justify-center gap-3 mt-6 flex-wrap px-4">
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-brand-primary text-white border-none py-2.5 px-6 rounded-xl text-xs font-bold cursor-pointer hover:bg-brand-dark transition-all shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-panel border border-line rounded-[24px]">
            <span className="text-5xl block mb-4">🌵</span>
            <h3 className="text-sm font-bold text-foreground m-0">No Marketplace Asset Found</h3>
            <p className="text-muted-text text-xs mt-1">Please check back soon or reset filters.</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 bg-brand-primary text-white border-none py-2 px-5 rounded-xl text-xs font-semibold cursor-pointer hover:bg-brand-dark"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* PAGINATION */}
        {!isSyncing && totalPages > 1 && visibleItems.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-14 border-t border-line pt-8">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-2 px-4 text-xs font-bold rounded-xl border border-line bg-panel text-muted-text hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 text-xs font-bold rounded-xl border transition-all ${
                    currentPage === pageNum
                      ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                      : "bg-panel text-muted-text border-line hover:text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-2 px-4 text-xs font-bold rounded-xl border border-line bg-panel text-muted-text hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
