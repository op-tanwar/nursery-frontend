import { redirect } from "next/navigation";

/**
 * 🔄 Backward-compatibility redirect:
 * Permanently reroutes legacy URL "/nursery/plant-stands-and-shelves/new"
 * to canonical SSOT route "/nursery/plant-stands-shelves/new".
 */
export default function LegacyNewPlantStandPage() {
  redirect("/nursery/plant-stands-shelves/new");
}
