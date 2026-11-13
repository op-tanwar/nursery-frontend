import { getFeaturedPotsServer } from "@/services/server/catalogServerService";
import FeaturedSectionClient from "./FeaturedSectionClient";

export default async function FeaturedPotsServer() {
  const initialPots = await getFeaturedPotsServer(8);

  return (
    <FeaturedSectionClient
      category="pots"
      title="Featured Pots"
      subtitle="Curated Accessories"
      viewAllHref="/shop?type=Pots"
      viewAllText="View All Pots →"
      bgColor="bg-[#fcfdfc] border-t border-line"
      initialItems={initialPots}
    />
  );
}
