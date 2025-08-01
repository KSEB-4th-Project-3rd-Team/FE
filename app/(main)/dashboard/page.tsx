import dynamicImport from "next/dynamic";

// Disable static generation and caching for dynamic content
export const dynamic = 'force-dynamic'
export const revalidate = 0

const UnifiedDashboard = dynamicImport(() => import("@/components/dashboard/unified-dashboard"), {
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
import { fetchInventoryData, fetchInOutData, fetchItems } from "@/lib/api";

export default async function DashboardPage() {
  // 서버 컴포넌트에서 직접 데이터 페칭
  const inventoryData = await fetchInventoryData();
  const inOutData = await fetchInOutData();
  const items = await fetchItems();

  return <UnifiedDashboard 
    initialInventoryData={inventoryData}
    initialInOutData={inOutData}
    initialItems={items}
  />
}
