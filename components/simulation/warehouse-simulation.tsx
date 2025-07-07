"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Eye } from "lucide-react"
import { agvSimulation, warehouseLayout, type AGV } from "@/lib/agv-simulation"
import AGVStatusModal from "./agv-status-modal"

export default function WarehouseSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [agvs, setAGVs] = useState<AGV[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAGV, setSelectedAGV] = useState<string | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // 토스트 표시 함수
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000) // 3초 후 자동 사라짐
  }

  useEffect(() => {
    const unsubscribe = agvSimulation.subscribe(setAGVs)
    setAGVs(agvSimulation.getAGVs())

    return unsubscribe
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 캔버스 크기 설정
    canvas.width = warehouseLayout.width
    canvas.height = warehouseLayout.height

    drawWarehouse(ctx)
    drawAGVs(ctx)
  }, [agvs])

  const drawWarehouse = (ctx: CanvasRenderingContext2D) => {
    // 배경 그리기 - 더 밝은 회색으로 변경
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, warehouseLayout.width, warehouseLayout.height)

    // 구역 그리기
    warehouseLayout.zones.forEach((zone) => {
      ctx.fillStyle = zone.color
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height)

      // 구역 테두리
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 2
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)

      // 구역 이름
      ctx.fillStyle = "#333"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(zone.name, zone.x + zone.width / 2, zone.y + 20)
    })

    // 장애물(선반) 그리기
    warehouseLayout.obstacles.forEach((obstacle) => {
      ctx.fillStyle = obstacle.type === "shelf" ? "#8d6e63" : "#666"
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

      ctx.strokeStyle = "#5d4037"
      ctx.lineWidth = 1
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    })

    // 통로 표시 (점선)
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1

    // 수직 통로
    for (let x = 250; x < warehouseLayout.width; x += 250) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, warehouseLayout.height)
      ctx.stroke()
    }

    // 수평 통로
    for (let y = 250; y < warehouseLayout.height - 100; y += 200) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(warehouseLayout.width, y)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }

  const drawAGVs = (ctx: CanvasRenderingContext2D) => {
    agvs.forEach((agv) => {
      // AGV 경로 그리기
      if (agv.path.length > 1) {
        ctx.strokeStyle = agv.color + "40" // 투명도 추가
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(agv.path[0].x, agv.path[0].y)
        for (let i = 1; i < agv.path.length; i++) {
          ctx.lineTo(agv.path[i].x, agv.path[i].y)
        }
        ctx.stroke()
      }

      // AGV 본체 그리기
      const size = 20
      ctx.fillStyle = agv.color
      ctx.fillRect(agv.x - size / 2, agv.y - size / 2, size, size)

      // AGV 테두리
      ctx.strokeStyle = selectedAGV === agv.id ? "#ff4444" : "#333"
      ctx.lineWidth = selectedAGV === agv.id ? 3 : 2
      ctx.strokeRect(agv.x - size / 2, agv.y - size / 2, size, size)

      // AGV 방향 표시 (작은 삼각형)
      if (agv.status === "moving") {
        const dx = agv.targetX - agv.x
        const dy = agv.targetY - agv.y
        const angle = Math.atan2(dy, dx)

        ctx.save()
        ctx.translate(agv.x, agv.y)
        ctx.rotate(angle)

        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.moveTo(8, 0)
        ctx.lineTo(-4, -4)
        ctx.lineTo(-4, 4)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
      }

      // AGV 이름 표시
      ctx.fillStyle = "#333"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(agv.name, agv.x, agv.y - 15)

      // 상태 표시
      const statusColor = {
        idle: "#4caf50",
        moving: "#2196f3",
        loading: "#ff9800",
        unloading: "#ff5722",
        charging: "#9c27b0",
      }[agv.status]

      ctx.fillStyle = statusColor
      ctx.beginPath()
      ctx.arc(agv.x + 8, agv.y - 8, 4, 0, 2 * Math.PI)
      ctx.fill()

      // 목표 지점 표시 (이동 중일 때)
      if (agv.status === "moving") {
        ctx.strokeStyle = agv.color
        ctx.setLineDash([3, 3])
        ctx.lineWidth = 2
        ctx.strokeRect(agv.targetX - 10, agv.targetY - 10, 20, 20)
        ctx.setLineDash([])
      }
    })
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !selectedAGV) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    agvSimulation.moveAGVTo(selectedAGV, x, y)
  }

  const handleStart = () => {
    agvSimulation.startSimulation()
    setIsRunning(true)
  }

  const handleStop = () => {
    agvSimulation.stopSimulation()
    setIsRunning(false)
  }

  const handleReset = () => {
    agvSimulation.stopSimulation()
    setIsRunning(false)
    // AGV 위치 초기화는 서비스에서 처리
    window.location.reload()
  }

  // AGV 상태별 통계
  const agvStats = {
    total: agvs.length,
    idle: agvs.filter((agv) => agv.status === "idle").length,
    moving: agvs.filter((agv) => agv.status === "moving").length,
    working: agvs.filter((agv) => ["loading", "unloading"].includes(agv.status)).length,
    charging: agvs.filter((agv) => agv.status === "charging").length,
  }

  return (
    <div className="h-full bg-white">
      <Card className="h-full border-0 shadow-none">
        <CardHeader className="bg-white border-b">
          <div className="flex items-center justify-between">
            <CardTitle>AGV 현황</CardTitle>
            <div className="flex items-center gap-6">
              {/* AGV 통계 - 색상 구분 */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="font-semibold text-blue-700">{agvStats.total}</span>
                  <span className="text-blue-600">총 AGV</span>
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="font-semibold text-green-700">{agvStats.idle}</span>
                  <span className="text-green-600">대기중</span>
                </div>
                <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="font-semibold text-orange-700">{agvStats.moving}</span>
                  <span className="text-orange-600">이동중</span>
                </div>
                <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="font-semibold text-purple-700">{agvStats.working}</span>
                  <span className="text-purple-600">작업중</span>
                </div>
              </div>

              {/* 전체 AGV 상태 보기 버튼 */}
              <Button
                onClick={() => setIsStatusModalOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <Eye className="w-4 h-4" />
                전체 AGV 상태
              </Button>

              {/* 제어 버튼 */}
              <div className="flex gap-1">
                {!isRunning ? (
                  <Button onClick={handleStart} size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
                    <Play className="w-3 h-3" />
                    시작
                  </Button>
                ) : (
                  <Button
                    onClick={handleStop}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-transparent text-xs px-2 py-1"
                  >
                    <Pause className="w-3 h-3" />
                    정지
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-transparent text-xs px-2 py-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  리셋
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-full pb-6 bg-white">
          <div className="border rounded-lg overflow-hidden bg-white mb-4">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="cursor-crosshair w-full h-auto bg-white"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>

          <div className="flex justify-between items-start">
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 점선: 이동 통로</p>
              <p>• 갈색 사각형: 선반</p>
              <p>• 컬러 영역: 창고 구역</p>
              {selectedAGV && (
                <p className="text-blue-600 font-medium">
                  • {agvs.find((a) => a.id === selectedAGV)?.name} 선택됨 - 지도 클릭으로 이동 명령
                </p>
              )}
            </div>

            {/* 상태 범례 */}
            <div className="text-sm">
              <div className="font-medium text-gray-700 mb-2">상태 범례</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>대기</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>이동중</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>적재중</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>하역중</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>충전중</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AGV 상태 모달 */}
      <AGVStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        agvs={agvs}
        selectedAGV={selectedAGV}
        onSelectAGV={setSelectedAGV}
      />

      {/* 토스트 알림 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
