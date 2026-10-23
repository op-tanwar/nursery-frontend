import Link from "next/link";
import ShopItemCard, { ShopItemType } from "@/components/customer/common/ShopItemCard";
import { getFeaturedPotsServer } from "@/services/server/catalogServerService";

export default async function FeaturedPotsServer() {
  const mappedPots: ShopItemType[] = await getFeaturedPotsServer(4);

  return (
    <section className="py-20 px-6 bg-[#fcfdfc] border-t border-line">
      <div className="w-full max-w-[1200px] mx-auto">

        {/* Header Block with View All CTA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-9 gap-4">
          <div>
            <span className="text-[13px] font-semibold text-brand-primary tracking-[0.08em] uppercase">
              Curated Accessories
            </span>
            <h2 className="text-[clamp(26px,4vw,40px)] font-black m-0 mt-2 tracking-[-0.02em] text-foreground">
              Featured Pots
            </h2>
          </div>

          <Link
            href="/shop?type=Pots"
            className="bg-transparent border-2 border-brand-primary text-brand-primary py-2.5 px-6 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 hover:bg-brand-primary hover:text-white inline-flex items-center gap-2 no-underline"
          >
            View All Pots →
          </Link>
        </div>

        {/* Pots Grid Container */}
        {mappedPots.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
            {mappedPots.map((item, i) => (
              <ShopItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-text text-sm">
            No active featured stock available right now.
          </div>
        )}

      </div>
    </section>
  );
}
