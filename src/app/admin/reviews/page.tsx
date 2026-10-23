"use client";

import React, { useState, useEffect } from "react";
import DataTable, { ColumnConfig } from "@/components/dashboard-common/DataTable";
import { plantService } from "@/services/PlantsService";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setPlantLoading,
  setPlantError,
  setTargetPlantReviews,
  deleteReviewFromState,
} from "@/redux/slices/PlantsSlice";
import { MessageSquare, ShieldAlert, Trash2, Search, RefreshCw, Star } from "lucide-react";

// Strict type definition schema matching our plant.types.ts review entity
interface ReviewRecord {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminPlantReviews() {
  const dispatch = useAppDispatch();
  const { currentReviews, isLoading, error } = useAppSelector((state) => state.plant);

  // Local state to keep track of searched Plant ID reference node
  const [plantIdInput, setPlantIdInput] = useState<string>("");
  const [searchedPlantId, setSearchedPlantId] = useState<string>("");
  const [productModel, setProductModel] = useState<string>("Plant");
  const [searchedProductModel, setSearchedProductModel] = useState<string>("Plant");

  // 1. Core Review API Fetcher Execution Pipeline
  const fetchReviewsData = async (targetId: string, model: string) => {
    if (!targetId.trim()) return;

    dispatch(setPlantLoading(true));
    dispatch(setPlantError(null)); // Clear previous exception traces

    try {
      let response;
      if (model === "Pot") {
        const { potService } = await import("@/services/potService");
        response = await potService.getPotReviews(targetId.trim());
      } else if (model === "Accessory") {
        const { accessoryService } = await import("@/services/accessoryService");
        response = await accessoryService.getAccessoryReviews(targetId.trim());
      } else if (model === "GardeningTool") {
        const { gardeningToolService } = await import("@/services/gardeningToolsService");
        response = await gardeningToolService.getGardeningToolReviews(targetId.trim());
      } else if (model === "PlantCare") {
        const { plantCareService } = await import("@/services/plantCareService");
        response = await plantCareService.getPlantCareReviews(targetId.trim());
      } else if (model === "SeedsBulbs") {
        const { seedsBulbsService } = await import("@/services/seedsBulbsService");
        response = await seedsBulbsService.getSeedsBulbsReviews(targetId.trim());
      } else if (model === "PlantStandsShelves") {
        const { plantStandsShelvesService } = await import("@/services/plantStandsShelvesService");
        response = await plantStandsShelvesService.getPlantStandsShelvesReviews(targetId.trim());
      } else if (model === "ArtificialDriedPlant") {
        const { artificialDriedPlantService } = await import("@/services/artificialDriedPlantService");
        response = await artificialDriedPlantService.getArtificialReviews(targetId.trim());
      } else {
        response = await plantService.getPlantReviews(targetId.trim());
      }

      // Dynamic fallback type parsing safely wrapped
      const dataWrapper = response as unknown as any;
      const extractedReviews = Array.isArray(response)
        ? response
        : (dataWrapper?.reviews || dataWrapper?.data?.reviews || []);

      dispatch(setTargetPlantReviews(extractedReviews));
      setSearchedPlantId(targetId.trim());
      setSearchedProductModel(model);
    } catch (err: any) {
      dispatch(setPlantError(err?.response?.data?.message || err?.message || "No product found or failed to fetch reviews matrix."));
    }
  };

  // Submission handler routine for ID matching query form context
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviewsData(plantIdInput, productModel);
  };

  // Quick reload function for the currently active searched plant cluster
  const handleReload = () => {
    if (searchedPlantId) {
      fetchReviewsData(searchedPlantId, searchedProductModel);
    }
  };

  // 2. Cascade Delete Target Review Handler Routine
  const handleDeleteReview = async (reviewId: string, authorName: string) => {
    if (!searchedPlantId) return;

    if (window.confirm(`Are you absolutely sure you want to completely purge the review submitted by "${authorName}"?`)) {
      try {
        if (searchedProductModel === "Pot") {
          const { potService } = await import("@/services/potService");
          await potService.deleteReview(searchedPlantId, reviewId);
        } else if (searchedProductModel === "Accessory") {
          const { accessoryService } = await import("@/services/accessoryService");
          await accessoryService.deleteReview(searchedPlantId, reviewId);
        } else if (searchedProductModel === "GardeningTool") {
          const { gardeningToolService } = await import("@/services/gardeningToolsService");
          await gardeningToolService.deleteReview(searchedPlantId, reviewId);
        } else if (searchedProductModel === "PlantCare") {
          const { plantCareService } = await import("@/services/plantCareService");
          await plantCareService.deleteReview(searchedPlantId, reviewId);
        } else if (searchedProductModel === "SeedsBulbs") {
          const { seedsBulbsService } = await import("@/services/seedsBulbsService");
          await seedsBulbsService.deleteReview(searchedPlantId, reviewId);
        } else if (searchedProductModel === "PlantStandsShelves") {
          const { plantStandsShelvesService } = await import("@/services/plantStandsShelvesService");
          await plantStandsShelvesService.deleteReview(searchedPlantId, reviewId);
        } else if (searchedProductModel === "ArtificialDriedPlant") {
          const { artificialDriedPlantService } = await import("@/services/artificialDriedPlantService");
          await artificialDriedPlantService.deleteReview(searchedPlantId, reviewId);
        } else {
          await plantService.deleteReview(searchedPlantId, reviewId);
        }

        dispatch(deleteReviewFromState(reviewId));
        alert("Review record context stripped and deleted successfully.");
      } catch (err: any) {
        alert(err?.response?.data?.message || err?.message || "Operation failed tracking downstream database state alignment.");
      }
    }
  };

  // 3. Structural DataTable Columns Configurations Blueprint
  const columns: ColumnConfig<ReviewRecord>[] = [
    {
      header: "Review ID Node",
      accessorKey: "_id",
      className: "font-mono text-[11px] text-slate-400 font-semibold tracking-tight",
    },
    {
      header: "User Identity Context",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 text-xs">{row.name}</span>
          <span className="text-slate-400 text-[10px] font-mono select-all">UID: {row.user}</span>
        </div>
      ),
    },
    {
      header: "Rating Metric Score",
      accessorKey: "rating",
      cell: (row) => {
        const ratingColors = row.rating >= 4 ? "text-amber-600 bg-amber-50 border-amber-100" : "text-slate-600 bg-slate-50 border-slate-150";
        return (
          <span className={`inline-flex items-center font-black text-[10px] px-2 py-0.5 rounded-md border gap-1 ${ratingColors}`}>
            <Star className="w-2.5 h-2.5 fill-current" />
            {row.rating.toFixed(1)}
          </span>
        );
      },
    },
    {
      header: "Feedbacks & System Comments",
      accessorKey: "comment",
      className: "max-w-xs md:max-w-md break-words",
      cell: (row) => (
        <span className="text-slate-600 font-medium text-xs tracking-tight line-clamp-2 hover:line-clamp-none transition-all duration-150 block">
          {row.comment || <em className="text-slate-300 font-normal">"No textual response content provided"</em>}
        </span>
      ),
    },
    {
      header: "Creation Date Timestamp",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="text-slate-400 font-medium text-[11px] font-mono">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
        </span>
      ),
    },
    {
      header: "Administrative Controls",
      accessorKey: "_id",
      className: "text-center",
      cell: (row) => (
        <button
          type="button"
          title="Purge Feedback Node from Plant Object Matrix"
          onClick={() => handleDeleteReview(row._id, row.name)}
          className="p-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50/60 rounded-lg bg-white text-slate-400 hover:text-red-600 cursor-pointer transition-all inline-flex"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const safeGridData = Array.isArray(currentReviews) ? currentReviews : [];

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">

      {/* 🔮 Component Layout Header Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 m-0 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-slate-800 shrink-0" />
            <span>Product Feedbacks & Reviews Control</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm m-0 mt-1">
            Audit customer responses, purge abusive review notes, trace account tracking signatures, and evaluate overall customer satisfaction metrics.
          </p>
        </div>

        {searchedPlantId && (
          <button
            type="button"
            onClick={handleReload}
            disabled={isLoading}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer self-start sm:self-center transition-all disabled:opacity-50 inline-flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {/* 🔍 Unique Plant Identity Search Console Form */}
      <form onSubmit={handleSearchSubmit} className="w-full flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
        <select
          value={productModel}
          onChange={(e) => setProductModel(e.target.value)}
          className="px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-green-600 transition-all cursor-pointer"
        >
          <option value="Plant">Plants</option>
          <option value="Pot">Pots</option>
          <option value="Accessory">Accessories</option>
          <option value="GardeningTool">Gardening Tools</option>
          <option value="PlantCare">Plant Care</option>
          <option value="SeedsBulbs">Seeds & Bulbs</option>
          <option value="PlantStandsShelves">Plant Stands</option>
          <option value="ArtificialDriedPlant">Artificial Plants</option>
        </select>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            required
            placeholder="Enter MongoDB Object ID reference to inspect node (e.g. 64b8f0...)"
            value={plantIdInput}
            onChange={(e) => setPlantIdInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none focus:border-green-600 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !plantIdInput.trim()}
          className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>Fetch Review Registry</span>
        </button>
      </form>

      {/* 🚨 Global Application Exception Handling View Node */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 🚀 Reusable Generic DataTable Injection Engine */}
      {searchedPlantId ? (
        <div className={`transition-opacity duration-200 ${isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2 pl-1">
            Displaying Feedbacks for Node: <span className="font-mono text-slate-700 select-all font-black">{searchedPlantId}</span>
          </div>
          <DataTable<ReviewRecord>
            data={safeGridData}
            columns={columns}
            searchPlaceholder="Filter reviews locally by user name..."
            searchKey="name"
            filterKey="rating"
            filterOptions={["1", "2", "3", "4", " 5"]} // Map exact analytical rating scopes cleanly
          />
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white flex flex-col items-center justify-center">
          <MessageSquare className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
          <h3 className="text-slate-700 text-sm font-bold m-0">No context active</h3>
          <p className="text-slate-400 text-xs m-0 mt-1 max-w-xs">
            Please map a valid hexadecimal plant schema node ID string into the field above to look up historical database records.
          </p>
        </div>
      )}

    </div>
  );
}