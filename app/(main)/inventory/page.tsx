import InventoryManagement from "@/components/inventory/inventory-management"
import { fetchInventoryData } from "@/lib/api"

// Disable static generation and caching for dynamic content
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function InventoryPage() {
  const inventoryData = await fetchInventoryData();

  return <InventoryManagement initialData={inventoryData} />
}
