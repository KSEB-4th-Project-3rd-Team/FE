"use client"

import InOutStatusPanel from "@/components/inout/inout-status-panel"

export default function AmrStatusPage() {
  return (
    <div className="h-full p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          AMR 실시간 현황
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          현재 승인대기이거나 예약된 입출고 작업 현황을 실시간으로 확인합니다.
        </p>
      </div>
      <div className="h-[calc(100vh-10rem)]">
        <InOutStatusPanel showSearch={true} data={[]} />
      </div>
    </div>
  )
}
