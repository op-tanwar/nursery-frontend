"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ShopItemCard, { ShopItemType } from "@/components/customer/common/ShopItemCard";
import { determineProductTag } from "@/utils/productBadge";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import PlantLoader from "@/components/customer/common/PlantLoader";
// Services Imports
import { plantService } from "@/services/PlantsService";
import { potService } from "@/services/potService";
import { accessoryService } from "@/services/accessoryService";
import { gardeningToolService } from "@/services/gardeningToolsService";
import { plantCareService } from "@/services/plantCareService";
import { seedsBulbsService } from "@/services/seedsBulbsService";
import { plantStandsShelvesService } from "@/services/plantStandsShelvesService";
import { artificialDriedPlantService } from "@/services/artificialDriedPlantService";

// Redux Slices Actions Imports
import { setPlantLoading, setPlantError, setAllPlantsData } from "@/redux/slices/PlantsSlice";
import { setPotLoading, setPotError, setAllPotsData } from "@/redux/slices/potSlice";
import { setAccessoryLoading, setAccessoryError, setAllAccessoriesData } from "@/redux/slices/accessorySlice";
import {
  setGardeningToolLoading,
  setGardeningToolError,
  setAllGardeningToolsData,
} from "@/redux/slices/gardeningToolsSlice";
import {
  setPlantCareLoading,
  setPlantCareError,
  setAllPlantCareData,
} from "@/redux/slices/plantCareSlice";
import {
  setSeedsBulbsLoading,
  setSeedsBulbsError,
  setAllSeedsBulbsData,
} from "@/redux/slices/seedsBulbsSlice";
import {
  setPlantStandsShelvesLoading,
  setPlantStandsShelvesError,
  setAllPlantStandsShelvesData,
} from "@/redux/slices/plantStandsShelveSlice";
import {
  setArtificialLoading,
  setArtificialError,
  setAllArtificialsData,
} from "@/redux/slices/artificialDriedPlantSlice";

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
  "artificial-dried-plants": "Artificial & Dried Plants",
  "Artificial & Dried Plants": "Artificial & Dried Plants",
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

  // Extracting structures from Redux
  const plantsArray = useAppSelector((state) => state.plant.plants) || [];
  const totalPlants = useAppSelector((state) => state.plant.totalPlants) || 0;
  const plantsCount = useAppSelector((state) => state.plant.filteredCount) || 0;
  const isPlantLoading = useAppSelector((state) => state.plant.isLoading);
  const plantError = useAppSelector((state) => state.plant.error);

  const potsArray = useAppSelector((state) => state.pot.pots) || [];
  const totalPots = useAppSelector((state) => state.pot.totalPots) || 0;
  const potsCount = useAppSelector((state) => state.pot.filteredCount) || 0;
  const isPotLoading = useAppSelector((state) => state.pot.isLoading);
  const potError = useAppSelector((state) => state.pot.error);

  const accessoriesArray = useAppSelector((state) => state.accessory.accessories) || [];
  const totalAccessories = useAppSelector((state) => state.accessory.totalAccessories) || 0;
  const accessoriesCount = useAppSelector((state) => state.accessory.filteredCount) || 0;
  const isAccessoryLoading = useAppSelector((state) => state.accessory.isLoading);
  const accessoryError = useAppSelector((state) => state.accessory.error);

  const gardeningToolsArray = useAppSelector((state) => state.gardeningTool.gardeningTools) || [];
  const totalGardeningTools = useAppSelector((state) => state.gardeningTool.totalGardeningTools) || 0;
  const gardeningToolsCount = useAppSelector((state) => state.gardeningTool.filteredCount) || 0;
  const isGardeningToolLoading = useAppSelector((state) => state.gardeningTool.isLoading);
  const gardeningToolError = useAppSelector((state) => state.gardeningTool.error);

  const plantCareArray = useAppSelector((state) => state.plantCare.plantCareList) || [];
  const totalPlantCare = useAppSelector((state) => state.plantCare.totalPlantCare) || 0;
  const plantCareCount = useAppSelector((state) => state.plantCare.filteredCount) || 0;
  const isPlantCareLoading = useAppSelector((state) => state.plantCare.isLoading);
  const plantCareError = useAppSelector((state) => state.plantCare.error);

  const seedsBulbsArray = useAppSelector((state) => state.seedsBulbs.seedsBulbsList) || [];
  const totalSeedsBulbs = useAppSelector((state) => state.seedsBulbs.totalSeedsBulbs) || 0;
  const seedsBulbsCount = useAppSelector((state) => state.seedsBulbs.filteredCount) || 0;
  const isSeedsBulbsLoading = useAppSelector((state) => state.seedsBulbs.isLoading);
  const seedsBulbsError = useAppSelector((state) => state.seedsBulbs.error);

  const plantStandsArray = useAppSelector((state) => state.plantStandsShelves.plantStandsShelvesList) || [];
  const totalPlantStands = useAppSelector((state) => state.plantStandsShelves.totalPlantStandsShelves) || 0;
  const plantStandsCount = useAppSelector((state) => state.plantStandsShelves.filteredCount) || 0;
  const isPlantStandsLoading = useAppSelector((state) => state.plantStandsShelves.isLoading);
  const plantStandsError = useAppSelector((state) => state.plantStandsShelves.error);

  const artificialPlantsArray = useAppSelector((state) => state.artificialPlants?.artificials) || [];
  const totalArtificialPlants = useAppSelector((state) => state.artificialPlants?.totalArtificials) || 0;
  const artificialPlantsCount = useAppSelector((state) => state.artificialPlants?.filteredCount) || 0;
  const isArtificialPlantsLoading = useAppSelector((state) => state.artificialPlants?.isLoading);
  const artificialPlantsError = useAppSelector((state) => state.artificialPlants?.error);

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

  const { currentItems, isSyncing, totalServerCount, hasBackendError } = useMemo(() => {
    const hasError = !!(
      plantError ||
      potError ||
      accessoryError ||
      gardeningToolError ||
      plantCareError ||
      seedsBulbsError ||
      plantStandsError ||
      artificialPlantsError
    );

    switch (activeType) {
      case "Plants":
        return { currentItems: plantsArray, isSyncing: isPlantLoading, totalServerCount: plantsCount || totalPlants, hasBackendError: !!plantError };
      case "Pots":
        return { currentItems: potsArray, isSyncing: isPotLoading, totalServerCount: potsCount || totalPots, hasBackendError: !!potError };
      case "Accessories":
        return { currentItems: accessoriesArray, isSyncing: isAccessoryLoading, totalServerCount: accessoriesCount || totalAccessories, hasBackendError: !!accessoryError };
      case "Gardening Tools":
        return { currentItems: gardeningToolsArray, isSyncing: isGardeningToolLoading, totalServerCount: gardeningToolsCount || totalGardeningTools, hasBackendError: !!gardeningToolError };
      case "Plant Care":
        return { currentItems: plantCareArray, isSyncing: isPlantCareLoading, totalServerCount: plantCareCount || totalPlantCare, hasBackendError: !!plantCareError };
      case "Seeds & Bulbs":
        return { currentItems: seedsBulbsArray, isSyncing: isSeedsBulbsLoading, totalServerCount: seedsBulbsCount || totalSeedsBulbs, hasBackendError: !!seedsBulbsError };
      case "Plant Stands":
        return { currentItems: plantStandsArray, isSyncing: isPlantStandsLoading, totalServerCount: plantStandsCount || totalPlantStands, hasBackendError: !!plantStandsError };
      case "Artificial & Dried Plants":
        return { currentItems: artificialPlantsArray, isSyncing: isArtificialPlantsLoading, totalServerCount: artificialPlantsCount || totalArtificialPlants, hasBackendError: !!artificialPlantsError };
      case "All":
      default:
        return {
          currentItems: [
            ...plantsArray,
            ...potsArray,
            ...accessoriesArray,
            ...gardeningToolsArray,
            ...plantCareArray,
            ...seedsBulbsArray,
            ...plantStandsArray,
            ...artificialPlantsArray,
          ],
          isSyncing:
            isPlantLoading ||
            isPotLoading ||
            isAccessoryLoading ||
            isGardeningToolLoading ||
            isPlantCareLoading ||
            isSeedsBulbsLoading ||
            isPlantStandsLoading ||
            isArtificialPlantsLoading,
          totalServerCount:
            (plantsCount || plantsArray.length) +
            (potsCount || potsArray.length) +
            (accessoriesCount || accessoriesArray.length) +
            (gardeningToolsCount || gardeningToolsArray.length) +
            (plantCareCount || plantCareArray.length) +
            (seedsBulbsCount || seedsBulbsArray.length) +
            (plantStandsCount || plantStandsArray.length) +
            (artificialPlantsCount || artificialPlantsArray.length),
          hasBackendError: hasError,
        };
    }
  }, [
    activeType,
    plantsArray, potsArray, accessoriesArray, gardeningToolsArray, plantCareArray, seedsBulbsArray, plantStandsArray,
    artificialPlantsArray,
    isPlantLoading, isPotLoading, isAccessoryLoading, isGardeningToolLoading, isPlantCareLoading, isSeedsBulbsLoading, isPlantStandsLoading,
    isArtificialPlantsLoading,
    plantsCount, totalPlants, potsCount, totalPots, accessoriesCount, totalAccessories,
    gardeningToolsCount, totalGardeningTools, plantCareCount, totalPlantCare, seedsBulbsCount, totalSeedsBulbs, plantStandsCount, totalPlantStands,
    artificialPlantsCount, totalArtificialPlants,
    plantError, potError, accessoryError, gardeningToolError, plantCareError, seedsBulbsError, plantStandsError,
    artificialPlantsError,
  ]);

  useEffect(() => {
    let isMounted = true;
    const syncMarketplaceCatalog = async () => {
      const buildQueryString = (overrideCategory?: string) => {
        const queryParams = new URLSearchParams();

        if (debouncedSearch.trim()) queryParams.append("keyword", debouncedSearch.trim());
        if (userPincode) queryParams.append("pincode", userPincode);

        if (activeType !== "All" && currentPage > 1) {
          queryParams.append("page", currentPage.toString());
        }

        const finalCategory = overrideCategory || activeSubCategory;
        if (finalCategory && finalCategory !== "All") {
          queryParams.append("category", finalCategory);
        }
        return queryParams.toString();
      };

      try {
        const fetchPlants = async () => {
          const qStr = buildQueryString(activeType === "All" ? "All" : undefined);
          dispatch(setPlantLoading(true));
          const res = await plantService.getAllPlants(qStr);
          if (isMounted) {
            dispatch(setAllPlantsData({
              plants: res.plants || [],
              totalPlants: res.totalPlants ?? (res.plants?.length || 0),
              filteredCount: res.filteredCount ?? (res.plants?.length || 0),
            }));
          }
        };

        const fetchPots = async () => {
          const qStr = buildQueryString(activeType === "All" ? "All" : undefined);
          dispatch(setPotLoading(true));
          const res = await potService.getAllPots(qStr);
          if (isMounted) {
            dispatch(setAllPotsData({
              pots: res.pots || [],
              totalPots: res.totalPots ?? (res.pots?.length || 0),
              filteredCount: res.filteredCount ?? (res.pots?.length || 0),
            }));
          }
        };

        const fetchAccessories = async () => {
          const qStr = buildQueryString(activeType === "All" ? "All" : undefined);
          dispatch(setAccessoryLoading(true));
          const res = await accessoryService.getAllAccessories(qStr);
          const responseData = res as any;
          const backendAccessories = res.accessories || responseData.accessorys || [];
          const backendTotal = res.totalAccessories || responseData.totalAccessorys || backendAccessories.length;

          if (isMounted) {
            dispatch(setAllAccessoriesData({
              accessories: backendAccessories,
              totalAccessories: backendTotal,
              filteredCount: res.filteredCount ?? backendAccessories.length,
            }));
          }
        };

        const fetchGardeningTools = async () => {
          const qStr = buildQueryString(activeType === "All" ? "All" : undefined);
          dispatch(setGardeningToolLoading(true));
          const res = await gardeningToolService.getAllGardeningTools(qStr);
          if (isMounted) {
            dispatch(setAllGardeningToolsData({
              gardeningTools: res.gardeningTools || [],
              totalGardeningTools: res.totalGardeningTools ?? (res.gardeningTools?.length || 0),
              filteredCount: res.filteredCount ?? (res.gardeningTools?.length || 0),
            }));
          }
        };

        const fetchPlantCare = async () => {
          const qStr = buildQueryString(activeType === "All" ? "All" : undefined);
          dispatch(setPlantCareLoading(true));
          const res = await plantCareService.getAllPlantCare(qStr);
          if (isMounted) {
            dispatch(setAllPlantCareData({
              plantCare: res.plantCare || [],
              totalPlantCare: res.totalPlantCare ?? (res.plantCare?.length || 0),
              filteredCount: res.filteredCount ?? (res.plantCare?.length || 0),
            }));
          }
        };

        const fetchSeedsBulbs = async () => {
          const qStr = buildQueryString(activeType === "All" ? "All" : undefined);
          dispatch(setSeedsBulbsLoading(true));
          const res = await seedsBulbsService.getAllSeedsBulbs(qStr);
          if (isMounted) {
            dispatch(setAllSeedsBulbsData({
              seedsBulbs: res.seedsBulbs || [],
              totalSeedsBulbs: res.totalSeedsBulbs ?? (res.seedsBulbs?.length || 0),
              filteredCount: res.filteredCount ?? (res.seedsBulbs?.length || 0),
            }));
          }
        };

        const fetchPlantStands = async () => {
          const qStr = buildQueryString(activeType === "All" ? "All" : undefined);
          dispatch(setPlantStandsShelvesLoading(true));
          const res = await plantStandsShelvesService.getAllPlantStandsShelves(qStr);
          if (isMounted) {
            dispatch(setAllPlantStandsShelvesData({
              plantStandsShelves: res.plantStandsShelves || [],
              totalPlantStandsShelves: res.totalPlantStandsShelves ?? (res.plantStandsShelves?.length || 0),
              filteredCount: res.filteredCount ?? (res.plantStandsShelves?.length || 0),
            }));
          }
        };

        const fetchArtificialDriedPlants = async () => {
          const qStr = buildQueryString(activeType === "All" ? "All" : undefined);
          dispatch(setArtificialLoading(true));
          const res = await artificialDriedPlantService.getAllArtificials(qStr);
          if (isMounted) {
            const items = res.artificials || (res as any).artificialDriedPlants || [];
            dispatch(setAllArtificialsData({
              artificials: items,
              totalArtificials: res.totalArtificials ?? items.length,
              filteredCount: res.filteredCount ?? items.length,
            }));
          }
        };

        // ⚡ PERF: "All" tab used to fire 8 parallel catalog calls (TBT spike).
        // Wave 1 = plants + pots (primary LCP grid), Wave 2 = remaining catalogs.
        if (activeType === "All") {
          await Promise.all([fetchPlants(), fetchPots()]);
          if (!isMounted) return;
          await Promise.all([
            fetchAccessories(),
            fetchGardeningTools(),
            fetchPlantCare(),
            fetchSeedsBulbs(),
            fetchPlantStands(),
            fetchArtificialDriedPlants(),
          ]);
        } else {
          const promises = [];
          if (activeType === "Plants") promises.push(fetchPlants());
          if (activeType === "Pots") promises.push(fetchPots());
          if (activeType === "Accessories") promises.push(fetchAccessories());
          if (activeType === "Gardening Tools") promises.push(fetchGardeningTools());
          if (activeType === "Plant Care") promises.push(fetchPlantCare());
          if (activeType === "Seeds & Bulbs") promises.push(fetchSeedsBulbs());
          if (activeType === "Artificial & Dried Plants") promises.push(fetchArtificialDriedPlants());
          if (activeType === "Plant Stands") promises.push(fetchPlantStands());
          await Promise.all(promises);
        }
      } catch (err: any) {
        if (!isMounted) return;
        const errorMsg = err?.response?.data?.message || err?.message || "Failed to load shop metrics";
        if (activeType === "Plants" || activeType === "All") dispatch(setPlantError(errorMsg));
        if (activeType === "Pots" || activeType === "All") dispatch(setPotError(errorMsg));
        if (activeType === "Accessories" || activeType === "All") dispatch(setAccessoryError(errorMsg));
        if (activeType === "Gardening Tools" || activeType === "All") dispatch(setGardeningToolError(errorMsg));
        if (activeType === "Plant Care" || activeType === "All") dispatch(setPlantCareError(errorMsg));
        if (activeType === "Seeds & Bulbs" || activeType === "All") dispatch(setSeedsBulbsError(errorMsg));
        if (activeType === "Artificial & Dried Plants" || activeType === "All") dispatch(setArtificialError(errorMsg));
        if (activeType === "Plant Stands" || activeType === "All") dispatch(setPlantStandsShelvesError(errorMsg));
      }
    };

    syncMarketplaceCatalog();
    return () => { isMounted = false; };
  }, [activeType, activeSubCategory, debouncedSearch, currentPage, dispatch, userPincode]);

  const mappedMarketItems = useMemo<ShopItemType[]>(() => {
    if (!Array.isArray(currentItems)) return [];

    const idIn = (arr: any[], id: string) => arr.some((p: any) => p._id === id);

    return currentItems.map((product: any) => {
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

      const productId = product._id;

      // Determine type from which Redux array the product came from
      let determinedType: ShopUrlType = "plants";
      if (idIn(gardeningToolsArray, productId)) determinedType = "gardening-tools";
      else if (idIn(plantCareArray, productId)) determinedType = "plant-care";
      else if (idIn(seedsBulbsArray, productId)) determinedType = "seeds-bulbs";
      else if (idIn(plantStandsArray, productId)) determinedType = "plant-stands-shelves";
      else if (idIn(artificialPlantsArray, productId)) determinedType = "artificial-dried-plants";
      else if (idIn(potsArray, productId)) determinedType = "pots";
      else if (idIn(accessoriesArray, productId)) determinedType = "accessories";
      else if (idIn(plantsArray, productId)) determinedType = "plants";

      const calculatedStock = product.stock ?? 0;
      const generatedSlug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

      return {
        id: product._id,
        slug: generatedSlug,
        type: determinedType,
        category: product.category || "General",
        name: product.name,
        vendor: `${nurseryName}, ${nurseryLoc || "Indore"}`,
        vendorName: nurseryName,
        vendorId: vendorId ? String(vendorId) : undefined,
        vendorSlug: vendorSlug ? String(vendorSlug) : undefined,
        nurseryId: nurseryUserId ? String(nurseryUserId) : undefined,
        price: (product.discountPrice > 0 && product.discountPrice < product.price)
          ? product.discountPrice
          : (product.price || 0),
        originalPrice: (product.discountPrice > 0 && product.discountPrice < product.price)
          ? (product.price || 0)
          : null,
        rating: product.ratings || 4.5,
        reviews: product.numOfReviews || 0,
        badge: calculatedStock > 0 ? "Fresh Stock" : "Out of Stock",
        badgeColor: calculatedStock > 0 ? "#15803d" : "#dc2626",
        tag: determineProductTag({
          ...product,
          stock: calculatedStock,
          ratings: product.ratings,
          reviewsCount: product.numOfReviews,
        }),
        emoji: product.coverImage?.url || FALLBACK_EMOJI[determinedType],
        isBestSeller: product.isBestSeller ?? product.isBestseller,
        isBestseller: product.isBestseller ?? product.isBestSeller,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        totalSales: product.totalSales ?? product.salesCount,
        salesCount: product.salesCount ?? product.totalSales,
        tags: product.tags,
        stock: calculatedStock,
        ratings: product.ratings,
        reviewsCount: product.numOfReviews,
        discountPrice: product.discountPrice,
        createdAt: product.createdAt,
      };
    });
  }, [currentItems, plantsArray, potsArray, accessoriesArray, gardeningToolsArray, plantCareArray, seedsBulbsArray, plantStandsArray, artificialPlantsArray]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...mappedMarketItems];

    if (activeType === "All" && activeSubCategory !== "All") {
      result = result.filter((item) => item.category === activeSubCategory);
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
      return ["All", "Indoor Plants", "Outdoor Plants", "Succulents", "Medicinal Plants", "Flowering Plants", "Aromatic Plants", "Air Purifying Plants", "Foliage Plants", "Cacti", "Bonsai", "Terrarium Plants", "Pet-Friendly Plants"];
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
    const totalCount = activeType === "All" ? filteredAndSortedItems.length : totalServerCount;
    return Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
  }, [activeType, filteredAndSortedItems.length, totalServerCount]);

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
                    className={`rounded-lg py-1.5 px-3.5 text-xs font-medium cursor-pointer transition-all duration-150 active:scale-95 ${activeSubCategory === sub
                      ? "bg-white text-slate-950 font-bold shadow-md"
                      : "bg-white/5 text-emerald-100/70 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20"
                      }`}
                  >
                    {sub === "All" ? `All ${activeType}` : sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search & Sort Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search premium ${activeType !== "All" ? activeType.toLowerCase() : "items"}...`}
                className="w-full bg-black/30 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-200/60 text-xs">🔍</span>
            </div>

            {/* Price Sort Dropdown */}
            <div className="md:col-span-3 relative">
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                className="w-full bg-black/30 border border-white/15 rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-medium text-emerald-100/90 cursor-pointer focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 appearance-none [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="default">Sort: Recommended</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-200/60 text-[10px]">▼</span>
            </div>

            {/* Tag Filter Dropdown */}
            <div className="md:col-span-3 relative">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full bg-black/30 border border-white/15 rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-medium text-emerald-100/90 cursor-pointer focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 appearance-none [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="All Tags">All Product Tags</option>
                <option value="Bestseller">Bestseller Loop Only</option>
                <option value="Limited">Limited Quantities</option>
                <option value="New Arrival">Fresh Arrivals</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-200/60 text-[10px]">▼</span>
            </div>
          </div>
        </div>

        {/* GRID AREA */}
        {showLoader ? (
          <div className="w-full text-center py-24 text-slate-400 font-bold text-xs font-mono tracking-widest uppercase">
            <PlantLoader fullScreen={false} text="Loading plants..." />
          </div>
        ) : visibleItems.length > 0 ? (
          <div>
            {isSyncing && (
              <div className="text-[10px] text-brand-primary font-bold mb-2 animate-pulse text-right">
                🔄 Syncing fresh stock indices in background...
              </div>
            )}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 animate-fade-in">
              {visibleItems.map((item, idx) => (
                <ShopItemCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          </div>
        ) : hasBackendError && userPincode ? (
          <div className="text-center py-20 bg-panel border border-red-200/60 rounded-[24px] max-w-2xl mx-auto shadow-sm animate-scale-up">
            <span className="text-5xl block mb-4">📍</span>
            <h3 className="text-lg font-bold text-foreground m-0 px-4">
              Sorry, we are not able to deliver to pincode &quot;{userPincode}&quot;
            </h3>
            <p className="text-muted-text text-xs mt-2 max-w-md mx-auto px-6 leading-relaxed">
              Our partner certified nurseries currently do not serve this location. Please try using another pincode or check out general listings.
            </p>
            <div className="flex justify-center gap-3 mt-6 flex-wrap px-4">
              <button
                type="button"
                onClick={handleClearPincode}
                className="bg-brand-primary text-white border-none py-2.5 px-6 rounded-xl text-xs font-bold cursor-pointer hover:bg-brand-dark transition-all shadow-sm"
              >
                Use Another Pincode
              </button>
            </div>
          </div>
        ) : isAnyFilterActive ? (
          <div className="text-center py-20 bg-panel border border-line rounded-[24px] max-w-2xl mx-auto shadow-sm animate-scale-up">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-lg font-bold text-foreground m-0 px-4">
              No results found for applied filters
            </h3>
            <p className="text-muted-text text-xs mt-2 max-w-md mx-auto px-6 leading-relaxed">
              Aapke select kiye gaye combination (Category/Tag/Search) ke liye koi item available nahi hai. Kripya filters badlein ya reset karein.
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
            <p className="text-muted-text text-xs mt-1">System parameters ya Filter reset karke check kijiye.</p>
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
                  className={`w-9 h-9 text-xs font-bold rounded-xl border transition-all ${currentPage === pageNum
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
