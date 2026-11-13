import { getFeaturedPlantsServer } from "@/services/server/catalogServerService";
import FeaturedSectionClient from "./FeaturedSectionClient";

export default async function FeaturedPlantsServer() {
  const initialPlants = await getFeaturedPlantsServer(8);

  return (
    <FeaturedSectionClient
      category="plants"
      title="Featured Plants"
      subtitle="Handpicked for You"
      viewAllHref="/shop?type=Plants"
      viewAllText="View All Plants →"
      bgColor="bg-[#f8fdf9]"
      initialItems={initialPlants}
    />
  );
}
