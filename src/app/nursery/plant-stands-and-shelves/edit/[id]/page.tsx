import { redirect } from "next/navigation";

/**
 * 🔄 Backward-compatibility redirect:
 * Permanently reroutes legacy URL "/nursery/plant-stands-and-shelves/edit/[id]"
 * to canonical SSOT route "/nursery/plant-stands-shelves/edit/[id]".
 */
export default async function LegacyEditPlantStandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/nursery/plant-stands-shelves/edit/${resolvedParams.id}`);
}
