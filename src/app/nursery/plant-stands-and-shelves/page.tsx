import { redirect } from "next/navigation";

/**
 * 🔄 Backward-compatibility redirect:
 * Permanently reroutes legacy URL "/nursery/plant-stands-and-shelves"
 * to canonical SSOT route "/nursery/plant-stands-shelves".
 */
export default function LegacyPlantStandsPage() {
  redirect("/nursery/plant-stands-shelves");
}
