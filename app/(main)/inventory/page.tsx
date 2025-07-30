import InventoryManagement from "@/components/inventory/inventory-management"
import { fetchInventoryData } from "@/lib/api"

export default async function InventoryPage() {
  const inventoryData = await fetchInventoryData();

  return <InventoryManagement initialData={inventoryData} />
}
