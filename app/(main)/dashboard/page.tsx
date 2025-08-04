"use client"

import dynamic from "next/dynamic";
import { useQueryInventory, useQueryInOut, useQueryItems } from "@/contexts/query-data-context";

const UnifiedDashboard = dynamic(() => import("@/components/dashboard/unified-dashboard").then(mod => ({ default: mod.UnifiedDashboard })), {
  loading: () => (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-96"></div>
          ))}
        </div>
      </div>
    </div>
  )
});

export default function DashboardPage() {
  // React Query를 통한 데이터 로딩
  const { data: inventoryData, isLoading: inventoryLoading } = useQueryInventory();
  const { data: inOutData, isLoading: inOutLoading } = useQueryInOut();
  const { data: items, isLoading: itemsLoading } = useQueryItems();

  // 로딩 중이면 스켈레톤 표시
  if (inventoryLoading || inOutLoading || itemsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <UnifiedDashboard 
    initialInventoryData={inventoryData || []}
    initialInOutData={inOutData || []}
    initialItems={items || []}
  />
}
