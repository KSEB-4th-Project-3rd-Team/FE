"use client"

import InOutHistoryTable from "@/components/inout/inout-history-table"

export default function InOutHistoryPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">전체 입출고 내역</h2>
        <p className="text-sm text-gray-600 mt-1">시스템에 기록된 모든 입고 및 출고 내역입니다.</p>
      </div>
      <InOutHistoryTable historyType="all" />
    </div>
  )
}