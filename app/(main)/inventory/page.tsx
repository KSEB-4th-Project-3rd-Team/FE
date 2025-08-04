"use client"

import InventoryManagement from "@/components/inventory/inventory-management"
import { useQueryInventory } from "@/contexts/query-data-context"

export default function InventoryPage() {
  const { data: inventoryData, isLoading, error } = useQueryInventory();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          재고 데이터 로딩 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  return <InventoryManagement initialData={inventoryData || []} />
}
