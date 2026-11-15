"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ShopItemCard, { ShopItemType } from "@/components/customer/common/ShopItemCard";
import { determineProductTag } from "@/utils/productBadge";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { productService } from "@/services/productService";
import {
  setProductLoading,
  setProductError,
  setAllProductsData,
} from "@/redux/slices/productSlice";

// Redesigned UI Architecture Sub-components
import ShopHeroHeader from "./ShopHeroHeader";
import ShopCategoryChips, { ShopTabType } from "./ShopCategoryChips";
import ShopFilterSidebar, { ShopFilterValues } from "./ShopFilterSidebar";
import ShopMobileFilterDrawer from "./ShopMobileFilterDrawer";
import ShopToolbar, { SortOption, ActiveFilterChip } from "./ShopToolbar";
import { ProductGridSkeleton } from "./ProductCardSkeleton";
import { RotateCcw, Sparkles } from "lucide-react";

const ITEMS_PER_PAGE = 12;

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
  hideHero?: boolean;
}

export default function ShopCatalogClient({
  initialType,
  initialCategory,
  hideHero = false,
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

  // ─── Filter & Navigation States ──────────────────────────────────────────
  const [activeType, setActiveType] = useState<ShopTabType>(() => {
    if (initialType && URL_TYPE_TO_TAB[initialType]) return URL_TYPE_TO_TAB[initialType];
    return "All";
  });
  const [activeSubCategory, setActiveSubCategory] = useState<string>(() => initialCategory || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceSort, setPriceSort] = useState<SortOption>("default");
  const [selectedTag, setSelectedTag] = useState<string>("All Tags");
  const [currentPage, setCurrentPage] = useState(1);
  const [userPincode, setUserPincode] = useState<string | null>(null);

  // Enhanced D2C Filter Attributes
  const [pricePreset, setPricePreset] = useState<ShopFilterValues["pricePreset"]>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [careLevel, setCareLevel] = useState("All");

  // Layout presentation states
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [desktopGridCols, setDesktopGridCols] = useState(3);
  const [mobileGridCols, setMobileGridCols] = useState(2);

  // Synchronize dynamic URL parameter modifications
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

  // Hydration-safe localStorage read
  useEffect(() => {
    const savedPincode = localStorage.getItem("hyperlocal_pincode");
    if (savedPincode) setUserPincode(savedPincode);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTypeChange = useCallback((type: ShopTabType) => {
    setActiveType(type);
    setActiveSubCategory("All");
    setCurrentPage(1);
  }, []);

  const handleClearPincode = useCallback(() => {
    localStorage.removeItem("hyperlocal_pincode");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pincode-changed", { detail: null }));
    }
    setUserPincode(null);
    window.location.reload();
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setActiveSubCategory("All");
    setSelectedTag("All Tags");
    setPriceSort("default");
    setPricePreset("all");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setMinRating(0);
    setCareLevel("All");
    setCurrentPage(1);
  }, []);

  const handleCustomPriceApply = useCallback((min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPricePreset("custom");
    setCurrentPage(1);
  }, []);

  // Catalog sync routine against /api/v1/products
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

  // Product normalization mapping
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

  // Comprehensive client-side filtering & sorting
  const filteredAndSortedItems = useMemo(() => {
    let result = [...mappedMarketItems];

    // Subcategory filter when activeType === "All"
    if (activeType === "All" && activeSubCategory !== "All") {
      result = result.filter(
        (item) =>
          item.category === activeSubCategory ||
          (Array.isArray(item.tags) && item.tags.some((t: string) => t.toLowerCase() === activeSubCategory.toLowerCase())) ||
          (typeof item.tags === "string" && item.tags.toLowerCase().includes(activeSubCategory.toLowerCase())) ||
          ((item as any).subCategory && String((item as any).subCategory).toLowerCase() === activeSubCategory.toLowerCase())
      );
    }

    // Badge / Highlights filter
    if (selectedTag !== "All Tags") {
      result = result.filter((item) => item.tag === selectedTag);
    }

    // Availability / In Stock filter
    if (inStockOnly) {
      result = result.filter((item) => (item.stock ?? 0) > 0);
    }

    // Minimum Rating filter
    if (minRating > 0) {
      result = result.filter((item) => item.rating >= minRating);
    }

    // Price preset & custom range filtering
    if (pricePreset === "under-499") {
      result = result.filter((item) => item.price < 500);
    } else if (pricePreset === "500-999") {
      result = result.filter((item) => item.price >= 500 && item.price <= 999);
    } else if (pricePreset === "1000-1999") {
      result = result.filter((item) => item.price >= 1000 && item.price <= 1999);
    } else if (pricePreset === "2000-plus") {
      result = result.filter((item) => item.price >= 2000);
    } else if (pricePreset === "custom" || minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      result = result.filter((item) => item.price >= min && item.price <= max);
    }

    // Care level filter for live plants
    if (careLevel !== "All") {
      const lowerCare = careLevel.toLowerCase();
      result = result.filter((item) => {
        const itemStr = `${item.name} ${(item as any).subCategory || ""} ${Array.isArray(item.tags) ? item.tags.join(" ") : item.tags || ""}`.toLowerCase();
        if (lowerCare === "easy") return itemStr.includes("easy") || itemStr.includes("snake") || itemStr.includes("zz") || itemStr.includes("succulent") || itemStr.includes("money");
        if (lowerCare === "low light") return itemStr.includes("low") || itemStr.includes("shade") || itemStr.includes("indoor") || itemStr.includes("zz");
        if (lowerCare === "indirect light") return itemStr.includes("indirect") || itemStr.includes("bright") || itemStr.includes("monstera") || itemStr.includes("palm");
        if (lowerCare === "direct sun") return itemStr.includes("sun") || itemStr.includes("outdoor") || itemStr.includes("flowering") || itemStr.includes("hibiscus");
        return true;
      });
    }

    // Multi-criteria sorting
    if (priceSort === "lowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (priceSort === "highToLow") {
      result.sort((a, b) => b.price - a.price);
    } else if (priceSort === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (priceSort === "newest") {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [
    mappedMarketItems,
    selectedTag,
    inStockOnly,
    minRating,
    pricePreset,
    minPrice,
    maxPrice,
    careLevel,
    priceSort,
    activeType,
    activeSubCategory,
  ]);

  // Paginated visible items
  const visibleItems = useMemo(() => {
    if (activeType === "All") {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredAndSortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }
    return filteredAndSortedItems;
  }, [filteredAndSortedItems, activeType, currentPage]);

  // Dynamic subcategories per category
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

  // Aggregate active filter counts & labels for chips
  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    if (searchQuery.trim()) {
      chips.push({
        id: "search",
        label: `"${searchQuery}"`,
        onRemove: () => {
          setSearchQuery("");
          setDebouncedSearch("");
        },
      });
    }

    if (activeType !== "All") {
      chips.push({
        id: "type",
        label: activeType,
        onRemove: () => handleTypeChange("All"),
      });
    }

    if (activeSubCategory !== "All") {
      chips.push({
        id: "subCategory",
        label: activeSubCategory,
        onRemove: () => setActiveSubCategory("All"),
      });
    }

    if (pricePreset !== "all") {
      const labels: Record<string, string> = {
        "under-499": "Under ₹499",
        "500-999": "₹500 – ₹999",
        "1000-1999": "₹1,000 – ₹1,999",
        "2000-plus": "₹2,000+",
        custom: `₹${minPrice || 0} – ₹${maxPrice || "any"}`,
      };
      chips.push({
        id: "price",
        label: labels[pricePreset] || "Price Filter",
        onRemove: () => {
          setPricePreset("all");
          setMinPrice("");
          setMaxPrice("");
        },
      });
    }

    if (inStockOnly) {
      chips.push({
        id: "stock",
        label: "In Stock Only",
        onRemove: () => setInStockOnly(false),
      });
    }

    if (selectedTag !== "All Tags") {
      chips.push({
        id: "tag",
        label: selectedTag,
        onRemove: () => setSelectedTag("All Tags"),
      });
    }

    if (minRating > 0) {
      chips.push({
        id: "rating",
        label: `${minRating}★ & Above`,
        onRemove: () => setMinRating(0),
      });
    }

    if (careLevel !== "All") {
      chips.push({
        id: "care",
        label: careLevel,
        onRemove: () => setCareLevel("All"),
      });
    }

    return chips;
  }, [
    searchQuery,
    activeType,
    activeSubCategory,
    pricePreset,
    minPrice,
    maxPrice,
    inStockOnly,
    selectedTag,
    minRating,
    careLevel,
    handleTypeChange,
  ]);

  const totalActiveFilterCount = activeChips.length;
  const isAnyFilterActive = totalActiveFilterCount > 0;
  const showLoader = isSyncing && visibleItems.length === 0;

  // Filter values bundle for Sidebar & Mobile Drawer
  const filterValues: ShopFilterValues = {
    activeType,
    activeSubCategory,
    pricePreset,
    minPrice,
    maxPrice,
    inStockOnly,
    selectedTag,
    minRating,
    careLevel,
  };

  // Determine dynamic grid columns
  const gridColumnClass = useMemo(() => {
    // Desktop: respects desktopGridCols (3 or 4)
    const desktopClass = desktopGridCols === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3";
    // Mobile: respects mobileGridCols (1 or 2)
    const mobileClass = mobileGridCols === 1 ? "grid-cols-1" : "grid-cols-2";

    return `grid ${mobileClass} sm:grid-cols-2 md:grid-cols-3 ${desktopClass} gap-3.5 sm:gap-4 md:gap-6`;
  }, [desktopGridCols, mobileGridCols]);

  return (
    <div className="w-full font-sans antialiased">
      {/* ── 1. Clean Storefront Header / Collection Hero (Only when not hidden) ── */}
      {!hideHero && (
        <ShopHeroHeader
          activeType={activeType}
          activeSubCategory={activeSubCategory}
          totalCount={activeType === "All" ? filteredAndSortedItems.length : filteredCount || totalProducts}
          visibleCount={visibleItems.length}
          userPincode={userPincode}
          onClearPincode={handleClearPincode}
        />
      )}

      {/* ── 2. Quick-Access Horizontal Category Chips/Pills ── */}
      <ShopCategoryChips
        activeType={activeType}
        onTypeChange={handleTypeChange}
        availableSubCategories={availableSubCategories}
        activeSubCategory={activeSubCategory}
        onSubCategoryChange={(sub) => {
          setActiveSubCategory(sub);
          setCurrentPage(1);
        }}
      />

      {/* ── 3. Main Catalog Layout: Sticky Sidebar (Desktop) + Product Section ── */}
      <div className="flex items-start gap-6 lg:gap-8">
        {/* Desktop Sticky Left Sidebar */}
        <ShopFilterSidebar
          filters={filterValues}
          availableSubCategories={availableSubCategories}
          totalActiveCount={totalActiveFilterCount}
          onTypeChange={handleTypeChange}
          onSubCategoryChange={(sub) => {
            setActiveSubCategory(sub);
            setCurrentPage(1);
          }}
          onPricePresetChange={(p) => {
            setPricePreset(p);
            setCurrentPage(1);
          }}
          onCustomPriceApply={handleCustomPriceApply}
          onInStockChange={(stock) => {
            setInStockOnly(stock);
            setCurrentPage(1);
          }}
          onTagChange={(tag) => {
            setSelectedTag(tag);
            setCurrentPage(1);
          }}
          onRatingChange={(r) => {
            setMinRating(r);
            setCurrentPage(1);
          }}
          onCareLevelChange={(c) => {
            setCareLevel(c);
            setCurrentPage(1);
          }}
          onResetAll={handleResetFilters}
        />

        {/* Right Section: Toolbar, Active Filter Chips, Product Grid, Loading/Empty & Pagination */}
        <div className="flex-1 min-w-0">
          {/* Top Utility Toolbar */}
          <ShopToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            priceSort={priceSort}
            onSortChange={setPriceSort}
            filters={filterValues}
            totalActiveCount={totalActiveFilterCount}
            onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
            activeChips={activeChips}
            onResetAll={handleResetFilters}
            gridCols={desktopGridCols}
            onToggleGridCols={(cols) => {
              setDesktopGridCols(cols);
              setMobileGridCols(cols === 1 ? 1 : 2);
            }}
          />

          {/* Feedback error alert if any */}
          {productError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-4 rounded-2xl text-xs font-semibold mb-6 flex items-center justify-between">
              <span>⚠️ {productError}</span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="underline text-red-800 hover:text-red-950 font-bold ml-2 cursor-pointer"
              >
                Reset catalog
              </button>
            </div>
          )}

          {/* ── 4. Product Grid & States ── */}
          {showLoader ? (
            <ProductGridSkeleton count={desktopGridCols === 4 ? 12 : 9} className={gridColumnClass} />
          ) : visibleItems.length > 0 ? (
            <div className={gridColumnClass}>
              {visibleItems.map((item, idx) => (
                <ShopItemCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          ) : isAnyFilterActive ? (
            /* Friendly Empty State with Filter Clear */
            <div className="text-center py-16 sm:py-20 px-6 bg-white border border-slate-200/80 rounded-3xl max-w-xl mx-auto shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-3xl shadow-inner">
                🔍
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  No matching plants or products found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  We couldn't find any products matching your active filters. Try modifying your
                  price range, removing tags, or clearing filters.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all shadow-sm active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            /* Blank state when marketplace is empty */
            <div className="text-center py-16 sm:py-20 px-6 bg-white border border-slate-200/80 rounded-3xl max-w-xl mx-auto shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-3xl">
                🌵
              </div>
              <h3 className="text-base font-bold text-slate-900">No Marketplace Products Found</h3>
              <p className="text-xs text-slate-500">
                Products for this category are currently being conditioned in nursery greenhouses.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-2 bg-emerald-800 text-white py-2.5 px-5 rounded-xl text-xs font-semibold hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                Return to All Plants
              </button>
            </div>
          )}

          {/* ── 5. Polished Pagination Controls ── */}
          {!isSyncing && totalPages > 1 && visibleItems.length > 0 && (
            <nav
              aria-label="Shop catalog pagination"
              className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-6 border-t border-slate-200/80"
            >
              <div className="text-xs text-slate-500 font-medium">
                Page <strong className="text-slate-800 font-bold">{currentPage}</strong> of{" "}
                <strong className="text-slate-800 font-bold">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(p - 1, 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-10 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                >
                  ← Prev
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  // Show first, last, current, and neighbours
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        type="button"
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-10 h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }

                  // Render ellipsis for jumps
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="w-8 text-center text-slate-400 text-xs font-bold">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(p + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-10 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                >
                  Next →
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* ── 6. Mobile & Tablet Filter Drawer / Bottom Sheet ── */}
      <ShopMobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filterValues}
        availableSubCategories={availableSubCategories}
        totalActiveCount={totalActiveFilterCount}
        matchingCount={filteredAndSortedItems.length}
        onTypeChange={handleTypeChange}
        onSubCategoryChange={(sub) => {
          setActiveSubCategory(sub);
          setCurrentPage(1);
        }}
        onPricePresetChange={(p) => {
          setPricePreset(p);
          setCurrentPage(1);
        }}
        onCustomPriceApply={handleCustomPriceApply}
        onInStockChange={(stock) => {
          setInStockOnly(stock);
          setCurrentPage(1);
        }}
        onTagChange={(tag) => {
          setSelectedTag(tag);
          setCurrentPage(1);
        }}
        onRatingChange={(r) => {
          setMinRating(r);
          setCurrentPage(1);
        }}
        onCareLevelChange={(c) => {
          setCareLevel(c);
          setCurrentPage(1);
        }}
        onResetAll={handleResetFilters}
      />
    </div>
  );
}
