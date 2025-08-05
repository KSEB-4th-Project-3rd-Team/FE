"use client";

import dynamic from "next/dynamic";
import { DashboardData } from "@/lib/api";

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
  // API 호출을 제거했으므로, 빈 mock 데이터를 생성합니다.
  const dashboardData: DashboardData = {
    items: [],
    users: [],
    orders: [],
    inventory: [],
    schedules: [],
    summary: {
      totalItems: 0,
      totalInventory: 0,
      inboundPending: 0,
      outboundPending: 0,
    },
    totalLoadTime: 0,
  };

  // 데이터가 없을 경우 (정상적으로 로드되었지만 비어있는 경우)
  if (!dashboardData) {
    return (
      <div className="p-6 text-center text-gray-500">
        <h2>대시보드 데이터를 찾을 수 없습니다.</h2>
      </div>
    );
  }

  // UnifiedDashboard에 통합된 데이터 전달
  return <UnifiedDashboard dashboardData={dashboardData} />
}
