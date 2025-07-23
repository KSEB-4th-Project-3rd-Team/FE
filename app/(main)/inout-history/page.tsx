"use client"

import { useState, useEffect } from "react"
import InOutHistoryTable from "@/components/inout/inout-history-table"
import { InOutRecord } from "@/components/utils"
import { fetchInOutData } from "@/lib/api"

export default function InOutHistoryPage() {
  const [inOutData, setInOutData] = useState<InOutRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInOutData = async () => {
      try {
        setLoading(true)
        const fetchedInOutData = await fetchInOutData();
        setInOutData(fetchedInOutData);
      } catch (err) {
        setError("Failed to load in-out history.");
        console.error(err);
      } finally {
        setLoading(false)
      }
    }
    loadInOutData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">전체 입출고 내역</h2>
        <p className="text-sm text-gray-600 mt-1">시스템에 기록된 모든 입고 및 출고 내역입니다.</p>
      </div>
      <InOutHistoryTable 
        historyType="all" 
        data={inOutData}
        setData={setInOutData}
      />
    </div>
  )
}