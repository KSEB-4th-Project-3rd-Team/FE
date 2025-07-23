"use client"

import { useState } from "react"
import { BatteryFull, BatteryLow, Bot, MapPin, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

type AmrStatus = "moving" | "charging" | "idle" | "error"

interface Amr {
  id: string
  name: string
  status: AmrStatus
  battery: number
  location: string
  currentTask: string | null
}



export default function AmrStatusPanel({ amrList }: { amrList: Amr[] }) {
  const [filter, setFilter] = useState<"all" | AmrStatus>("all")

  const handleFilterToggle = (newFilter: AmrStatus) => {
    setFilter(prevFilter => prevFilter === newFilter ? 'all' : newFilter);
  };

  const getStatusChipClass = (status: AmrStatus) => {
    switch (status) {
      case "moving": return "bg-blue-100 text-blue-800"
      case "charging": return "bg-yellow-100 text-yellow-800"
      case "idle": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
    }
  }

  const getBatteryIcon = (level: number) => {
    if (level < 20) return <BatteryLow className="w-5 h-5 text-red-500" />
    return <BatteryFull className="w-5 h-5 text-green-500" />
  }

  const filteredData = (amrList || []).filter(
    (amr) => filter === "all" || amr.status === filter
  )

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center gap-1">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>전체</Button>
        <Button variant={filter === "moving" ? "default" : "outline"} size="sm" onClick={() => handleFilterToggle("moving")}>이동 중</Button>
        <Button variant={filter === "charging" ? "default" : "outline"} size="sm" onClick={() => handleFilterToggle("charging")}>충전 중</Button>
        <Button variant={filter === "idle" ? "default" : "outline"} size="sm" onClick={() => handleFilterToggle("idle")}>대기 중</Button>
        <Button variant={filter === "error" ? "default" : "outline"} size="sm" onClick={() => handleFilterToggle("error")}>오류</Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {filteredData.length > 0 ? (
          filteredData.map((amr) => (
            <div key={amr.id} className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1"><Bot className="w-5 h-5 text-gray-600" /></div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{amr.name} ({amr.id})</p>
                    <span className={`px-2 py-0.5 mt-1 inline-block rounded-full text-xs font-medium ${getStatusChipClass(amr.status)}`}>
                      {amr.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {getBatteryIcon(amr.battery)}
                  <span>{amr.battery}%</span>
                </div>
              </div>
              <div className="mt-2 pl-8 space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>위치: {amr.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-3 h-3" />
                  <span>작업: {amr.currentTask || "없음"}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">해당 상태의 AMR이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
