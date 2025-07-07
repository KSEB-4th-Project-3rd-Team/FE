"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Zap, MapPin } from "lucide-react"
import type { AGV } from "@/lib/agv-simulation"

interface AGVStatusModalProps {
  isOpen: boolean
  onClose: () => void
  agvs: AGV[]
  selectedAGV: string | null
  onSelectAGV: (agvId: string | null) => void
}

export default function AGVStatusModal({ isOpen, onClose, agvs, selectedAGV, onSelectAGV }: AGVStatusModalProps) {
  if (!isOpen) return null

  const getStatusText = (status: string) => {
    const statusMap = {
      idle: "대기",
      moving: "이동중",
      loading: "적재중",
      unloading: "하역중",
      charging: "충전중",
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">전체 AGV 상태</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agvs.map((agv) => (
              <div
                key={agv.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedAGV === agv.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => onSelectAGV(selectedAGV === agv.id ? null : agv.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-lg">{agv.name}</span>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: agv.color }} />
                </div>

                <div className="space-y-3">
                  {/* 상태 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">상태:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agv.status === "idle"
                          ? "bg-green-100 text-green-800"
                          : agv.status === "moving"
                            ? "bg-blue-100 text-blue-800"
                            : agv.status === "charging"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {getStatusText(agv.status)}
                    </span>
                  </div>

                  {/* 배터리 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Zap className="w-3 h-3" />
                        <span>배터리</span>
                      </div>
                      <span className="text-sm font-medium">{agv.batteryLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          agv.batteryLevel > 50
                            ? "bg-green-500"
                            : agv.batteryLevel > 20
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${agv.batteryLevel}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 위치 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>위치</span>
                    </div>
                    <span className="font-mono text-xs">
                      ({Math.round(agv.x)}, {Math.round(agv.y)})
                    </span>
                  </div>

                  {/* 현재 작업 */}
                  {agv.currentTask && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                      <span className="font-medium">작업:</span> {agv.currentTask}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedAGV && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">
                {agvs.find((a) => a.id === selectedAGV)?.name} 선택됨
              </div>
              <div className="text-xs text-blue-600">지도에서 클릭하여 이동 명령을 내릴 수 있습니다.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
