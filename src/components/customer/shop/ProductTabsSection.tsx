import ReviewForm from "@/components/customer/shop/ReviewForm";
import ProductSpecifications from "@/components/customer/shop/ProductSpecifications";

type TabId = "description" | "care" | "benefits" | "gallery" | "reviews";

interface ReviewType {
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface ProductTabsSectionProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  itemId: string;
  itemType: string;
  descriptionOption?: {
    short: string;
    points: string[];
  };
  item: any;
  handleAddNewReview: (newReview: ReviewType) => void;
}

export default function ProductTabsSection({
  activeTab,
  setActiveTab,
  itemId,
  itemType,
  item,
  descriptionOption,
  handleAddNewReview,
}: ProductTabsSectionProps) {
  const normalizedType = itemType?.toLowerCase() || "";
  const isPlantType = normalizedType === "plants";
  
  const careTabLabel =
    isPlantType
      ? "Plant Care Guidelines"
      : normalizedType === "plant-care"
      ? "Usage & Dosage"
      : normalizedType === "seeds-bulbs"
      ? "Sowing Guidelines"
      : normalizedType === "plant-stands-shelves"
      ? "Assembly Guidelines"
      : "Usage & Care Guidelines";

  const benefitsTabLabel =
    isPlantType
      ? "Botanical Benefits"
      : normalizedType === "plant-care"
      ? "Biochemical Benefits"
      : "Product Highlights";

  const careHeading =
    isPlantType
      ? "Botanical Care & Maintenance Routines"
      : normalizedType === "plant-care"
      ? "Prescribed Application & Dosage Protocol"
      : normalizedType === "seeds-bulbs"
      ? "Recommended Sowing & Sprouting Instructions"
      : normalizedType === "plant-stands-shelves"
      ? "Assembly & Weight Distribution Guide"
      : "Recommended Usage & Maintenance Guidelines";

  const benefitsHeading =
    isPlantType
      ? "Atmospheric & Botanical Benefits Matrix"
      : "Verified Product Advantages & Capabilities";

  return (
    <div className="border border-line bg-panel/40 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] mt-12">
      <div className="flex border-b border-line overflow-x-auto scrollbar-none bg-panel">
        {(["description", "care", "benefits", "gallery", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-xs font-bold tracking-wider uppercase border-none bg-transparent cursor-pointer transition-all relative whitespace-nowrap outline-none ${
              activeTab === tab ? "text-brand-primary" : "text-muted-text hover:text-foreground"
            }`}
          >
            {tab === "description" && "Specification"}
            {tab === "care" && careTabLabel}
            {tab === "benefits" && benefitsTabLabel}
            {tab === "gallery" && "Asset Gallery Canvas"}
            {tab === "reviews" && `Verified Reviews (${item.reviews || 0})`}

            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8 bg-panel/10 min-h-[220px]">
        {activeTab === "description" && (
          <div className="animate-fadeIn space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-3">
                Product Description & Architectural Overview
              </h3>
              <p className="text-xs text-muted-text leading-relaxed font-medium m-0 max-w-[850px]">
                {item.description}
              </p>

              {descriptionOption?.points && descriptionOption.points.length > 0 && (
                <ul className="mt-3 space-y-1.5 m-0 pl-4">
                  {descriptionOption.points.map((point: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-600 font-medium leading-relaxed list-disc">
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dynamic Product Specifications Component */}
            <div className="pt-2">
              <ProductSpecifications product={item} shopType={itemType} />
            </div>
          </div>
        )}

        {activeTab === "care" && (
          <div className="animate-fadeIn">
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4">
              {careHeading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(item.careInstructions || []).map((instruction: string, idx: number) => (
                <div key={idx} className="flex gap-3 items-start bg-panel border border-line/50 p-3 rounded-xl shadow-2xs">
                  <span className="text-brand-primary font-bold text-xs bg-brand-light px-2 py-0.5 rounded-md">
                    0{idx + 1}
                  </span>
                  <p className="text-xs text-muted-text font-medium m-0 leading-relaxed">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "benefits" && (
          <div className="animate-fadeIn">
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4">
              {benefitsHeading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(item.benefits || []).map((benefit: string, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-line bg-panel flex items-center gap-3">
                  <span className="text-xl">🌟</span>
                  <span className="text-xs font-semibold text-foreground leading-relaxed">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="animate-fadeIn">
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4">
              Dynamic Asset Render Matrices
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(item.galleryImages || []).map((imgUrl: string, idx: number) => (
                <div
                  key={idx}
                  className="aspect-square rounded-xl bg-brand-light/20 border border-line/80 flex items-center justify-center select-none hover:bg-brand-light/40 transition-colors shadow-2xs group cursor-zoom-in overflow-hidden"
                >
                  {imgUrl.startsWith("http") || imgUrl.startsWith("/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
                      alt="Gallery item"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                      width={200}
                      height={200}
                    />
                  ) : (
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                      {imgUrl}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-5 mb-6">
              <div>
                <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider m-0">
                  Inbound Customer Diagnostic Logs
                </h3>
                <p className="text-[11px] text-muted-text m-0 mt-1">
                  Real-time unedited user experiences compiled from local node clusters.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-brand-light/30 border border-brand-primary/20 px-4 py-2 rounded-xl w-fit">
                <span className="text-lg font-black text-brand-primary">
                  {item.rating} / 5.0
                </span>
                <span className="text-line text-sm">|</span>
                <span className="text-[11px] font-bold text-brand-dark">
                  {item.reviews} Global Signals
                </span>
              </div>
            </div>

            {/* ✨ NOW RECEIVING VALID PROPS SEAMLESSLY */}
            <ReviewForm
              itemId={itemId}
              itemType={itemType}
              onAddReview={handleAddNewReview}
            />

            <div className="flex flex-col gap-4 mt-6">
              {(item.verifiedReviews || []).map((review: ReviewType, idx: number) => (
                <div key={idx} className="bg-panel border border-line rounded-xl p-4 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-light font-bold text-brand-primary text-[11px] flex items-center justify-center border border-brand-primary/10 select-none">
                        {review.author[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          {review.author}
                        </span>
                        <span className="text-[10px] text-muted-text block">
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ Verified Node Buyer
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <span
                        key={sIdx}
                        className={`text-xs ${sIdx < review.rating ? "text-[#f59e0b]" : "text-line/40"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-text leading-relaxed font-medium m-0 pl-1">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}