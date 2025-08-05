"use client"

import dynamic from "next/dynamic";
import { useDashboardAll } from "@/lib/queries"; // 새로 만든 통합 훅 import
import { useEffect } from "react";

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
  // 새로운 통합 훅을 사용하여 모든 데이터를 한 번에 로딩
  const { data: dashboardData, isLoading, isError, error } = useDashboardAll();

  // 성능 측정 결과 콘솔에 출력
  useEffect(() => {
    if (dashboardData?.totalLoadTime) {
      console.log(`Dashboard data loaded in: ${dashboardData.totalLoadTime}ms`);
    }
  }, [dashboardData]);

  // 로딩 중이면 스켈레톤 표시
  if (isLoading) {
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

  // 에러 발생 시 메시지 표시
  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        <h2>데이터를 불러오는 중 오류가 발생했습니다.</h2>
        <p>{error?.message || '알 수 없는 오류'}</p>
      </div>
    );
  }

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
