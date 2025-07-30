import UnifiedDashboard from "@/components/dashboard/unified-dashboard";
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
