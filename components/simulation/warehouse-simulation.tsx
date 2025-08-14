"use client"

import { useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UnityPlayer from "@/components/unity/UnityPlayer"
import { useUnityContext } from "react-unity-webgl"
import { useUpdateOrderStatus } from "@/lib/queries"
import type { InOutRecord } from "@/components/utils"

// ===== 유효성/정규화 헬퍼 =====
const isValidType = (t: string): t is "inbound" | "outbound" => {
  const v = t?.toLowerCase()
  return v === "inbound" || v === "outbound"
}

const normalizeRackId = (raw: string): string | null => {
  if (!raw) return null
  const upper = raw.toUpperCase().trim()
  const m = upper.match(/^([A-Z])(\d{1,3})$/)
  if (!m) return null
  const letter = m[1]
  const digits = m[2].padStart(3, "0")
  return `${letter}${digits}`
}

const asNumericTaskIdOrUndefined = (s?: string | number) => {
  if (s === undefined || s === null) return undefined
  const str = String(s)
  return /^\d+$/.test(str) ? str : undefined
}

export default function WarehouseSimulation() {
  const { unityProvider, sendMessage, addEventListener, removeEventListener, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/unity/Build/R9_WMS_Simul.loader.js",
    dataUrl: "/unity/Build/R9_WMS_Simul.data",
    frameworkUrl: "/unity/Build/R9_WMS_Simul.framework.js",
    codeUrl: "/unity/Build/R9_WMS_Simul.wasm",
  });

  // Unity로 작업 전송 (TaskBridge 규격)
  const assignTaskToAmr = useCallback(
    (taskType: "inbound" | "outbound", rackIdRaw: string, orderId?: string | number) => {
      if (!isValidType(taskType)) {
        console.error(`[Unity] Invalid type: ${taskType}`)
        return false
      }
      const rackId = normalizeRackId(rackIdRaw)
      if (!rackId) {
        console.error(`[Unity] Invalid rackId: ${rackIdRaw}`)
        return false
      }

      const payload: Record<string, any> = {
        type: taskType,
        rackId,
        ts: Date.now(),
      }
      const numericTaskId = asNumericTaskIdOrUndefined(orderId)
      if (numericTaskId) payload.taskId = numericTaskId

      const sender =
        (window as any).unitySendMessage ??
        (sendMessage
          ? (go: string, method: string, msg: string) => sendMessage(go, method, msg)
          : null)

      if (!sender) {
        console.error("[Unity] sendMessage not available")
        return false
      }

      try {
        sender("TaskManager", "AssignTaskFromJson", JSON.stringify(payload))
        console.log("[Unity] Task sent:", payload)
        return true
      } catch (e) {
        console.error("[Unity] Failed to send task:", e, payload)
        return false
      }
    },
    [sendMessage]
  )

  const { mutate: updateStatus } = useUpdateOrderStatus()

  // 주문 예약 시 Unity로 작업 전송
  const handleReserveOrder = useCallback(
    (order: InOutRecord) => {
      console.log("[Unity] Reserving order:", order)
      const ok = assignTaskToAmr(order.type as "inbound" | "outbound", order.location ?? "", order.id)
      if (!ok) {
        console.error(`[Unity] Failed to send order ${order.id} to Unity`)
      }
    },
    [assignTaskToAmr]
  )

  // 사이드 패널 등에서 호출할 수 있게 전역 등록
  useEffect(() => {
    ;(window as any).unityReserveOrder = handleReserveOrder
    return () => {
      delete (window as any).unityReserveOrder
    }
  }, [handleReserveOrder])

  // Unity → Web 이벤트 (예: 작업 완료)
  const handleTaskCompleted = useCallback(
    (taskId: string) => {
      console.log(`[Unity] Task completed: ${taskId}`)
      try {
        updateStatus({ orderId: taskId, status: "COMPLETED" })
      } catch (error) {
        console.error("[Unity] Failed to update order status:", error)
      }
    },
    [updateStatus]
  )

  useEffect(() => {
    addEventListener("TaskCompleted", handleTaskCompleted)
    return () => removeEventListener("TaskCompleted", handleTaskCompleted)
  }, [addEventListener, removeEventListener, handleTaskCompleted])

  return (
    <div className="h-full bg-white">
      <Card className="h-full border-0 shadow-none">
        <CardHeader className="bg-white border-b">
          <div className="flex items-center justify-between">
            <CardTitle>AMR 작동 현황</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-full pb-6 bg-white">
          <div className="border rounded-lg overflow-hidden bg-white mb-4 h-full">
            <UnityPlayer 
              unityProvider={unityProvider}
              isLoaded={isLoaded}
              loadingProgression={loadingProgression}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
