"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Eye, ExternalLink } from "lucide-react"
import AGVStatusModal from "./agv-status-modal"
import type { AGV } from "./agv-status-modal"
import UnityPlayer from "@/components/unity/UnityPlayer"

// TODO: Fetch warehouse layout data from API
const warehouseLayout = {
  width: 1000,
  height: 600,
  zones: [],
  obstacles: [],
}

// TODO: Implement AGV simulation service
const agvSimulation = {
  getAGVs: (): AGV[] => [],
  subscribe: (callback: (agvs: AGV[]) => void) => {
    // Implement subscription logic
    return () => {};
  },
  startSimulation: () => console.log("Start simulation"),
  stopSimulation: () => console.log("Stop simulation"),
  moveAGVTo: (id: string, x: number, y: number) => console.log(`Move AGV ${id} to (${x}, ${y})`),
}

export default function WarehouseSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [agvs, setAGVs] = useState<AGV[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAGV, setSelectedAGV] = useState<string | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [showWebView, setShowWebView] = useState(true)

  useEffect(() => {
    const unsubscribe = agvSimulation.subscribe(setAGVs)
    setAGVs(agvSimulation.getAGVs())
    return unsubscribe
  }, [])

  const drawAGVs = useCallback((ctx: CanvasRenderingContext2D) => {
    agvs.forEach((agv) => {
      if (agv.path && agv.path.length > 1) {
        ctx.strokeStyle = agv.color + "40"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(agv.path[0].x, agv.path[0].y)
        for (let i = 1; i < agv.path.length; i++) {
          ctx.lineTo(agv.path[i].x, agv.path[i].y)
        }
        ctx.stroke()
      }
      const size = 20
      ctx.fillStyle = agv.color
      ctx.fillRect(agv.x - size / 2, agv.y - size / 2, size, size)
      ctx.strokeStyle = selectedAGV === agv.id ? "#ff4444" : "#333"
      ctx.lineWidth = selectedAGV === agv.id ? 3 : 2
      ctx.strokeRect(agv.x - size / 2, agv.y - size / 2, size, size)
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
      ctx.fillStyle = "#333"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(agv.name, agv.x, agv.y - 15)
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
      if (agv.status === "moving") {
        ctx.strokeStyle = agv.color
        ctx.setLineDash([3, 3])
        ctx.lineWidth = 2
        ctx.strokeRect(agv.targetX - 10, agv.targetY - 10, 20, 20)
        ctx.setLineDash([])
      }
    })
  }, [agvs, selectedAGV]);

  const drawWarehouse = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, warehouseLayout.width, warehouseLayout.height)
    warehouseLayout.zones.forEach((zone) => {
      ctx.fillStyle = zone.color
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height)
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 2
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)
      ctx.fillStyle = "#333"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(zone.name, zone.x + zone.width / 2, zone.y + 20)
    })
    warehouseLayout.obstacles.forEach((obstacle) => {
      ctx.fillStyle = obstacle.type === "shelf" ? "#8d6e63" : "#666"
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
      ctx.strokeStyle = "#5d4037"
      ctx.lineWidth = 1
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    })
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1
    for (let x = 250; x < warehouseLayout.width; x += 250) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, warehouseLayout.height)
      ctx.stroke()
    }
    for (let y = 250; y < warehouseLayout.height - 100; y += 200) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(warehouseLayout.width, y)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }, []);

  useEffect(() => {
    if (showWebView) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = warehouseLayout.width
    canvas.height = warehouseLayout.height
    drawWarehouse(ctx)
    drawAGVs(ctx)
  }, [agvs, showWebView, drawAGVs, drawWarehouse])

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
    window.location.reload()
  }

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
            <CardTitle>AMR 작동 현황</CardTitle>
            <div className="flex items-center gap-6">
              
              {!showWebView && (
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
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-full pb-6 bg-white">
          {showWebView ? (
            <div className="border rounded-lg overflow-hidden bg-white mb-4 h-full">
              <UnityPlayer />
            </div>
          ) : (
            <>
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
            </>
          )}
        </CardContent>
      </Card>
      <AGVStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        agvs={agvs}
        selectedAGV={selectedAGV}
        onSelectAGV={setSelectedAGV}
      />
    </div>
  )
}
