"use client"

import InventoryManagement from "@/components/inventory/inventory-management"
import { useData } from "@/contexts/data-context"
import InventoryManagementSkeleton from "@/components/inventory/inventory-management-skeleton"
import ErrorMessage from "@/components/ui/error-message"

export default function InventoryPage() {
  const { inventoryData, loading, error, reloadData } = useData()

  if (loading) return <InventoryManagementSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={() => reloadData("inventoryData")} />

  return <InventoryManagement data={inventoryData} />
}
