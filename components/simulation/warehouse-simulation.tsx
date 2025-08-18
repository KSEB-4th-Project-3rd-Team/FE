"use client"

import { useEffect, useCallback, useRef } from "react"
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
    loaderUrl: "/unity/Build/R21_WMS_Simul.loader.js",
    dataUrl: "/unity/Build/R21_WMS_Simul.data",
    frameworkUrl: "/unity/Build/R21_WMS_Simul.framework.js",
    codeUrl: "/unity/Build/R21_WMS_Simul.wasm",
    webglContextAttributes: {
      powerPreference: "high-performance",
      antialias: false,
      alpha: false,
      depth: true,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    }
  });

  // Unity 에러 억제
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      // Unity WebGL 관련 에러는 무시
      if (message.includes('still waiting on run dependencies') ||
          message.includes('dependency: wasm-instantiate') ||
          message.includes('(end of list)') ||
          message.includes('printErr')) {
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      // Unity WebGL 관련 경고는 무시
      if (message.includes('wasm-instantiate') ||
          message.includes('run dependencies')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

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
      console.log(`[Unity] Original orderId: ${orderId}, extracted taskId: ${numericTaskId}`)
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

  const { mutate: updateStatus } = useUpdateOrderStatus({
    onSuccess: (data, variables) => {
      console.log(`[Web] Task status updated successfully:`, variables)
    },
    onError: (error, variables) => {
      console.error(`[Web] Failed to update task status:`, error, variables)
    }
  })

  const updateStatusRef = useRef(updateStatus);
  useEffect(() => {
    updateStatusRef.current = updateStatus;
  }, [updateStatus]);

  // 주문 예약 시 Unity로 작업 전송
  const handleReserveOrder = useCallback(
    (order: InOutRecord) => {
      console.log("[Unity] Reserving order:", order)
      
      // order.id에서 숫자 부분만 추출 ("1-0" → "1")
      const numericOrderId = order.id.split('-')[0]
      console.log(`[Unity] Original order.id: ${order.id}, extracted orderId: ${numericOrderId}`)
      
      const ok = assignTaskToAmr(order.type as "inbound" | "outbound", order.location ?? "", numericOrderId)
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

  useEffect(() => {
    console.log("[Web] Registering 'window.onUnityTaskCompleted' function.");
    // 전역 window 객체에 핸들러 함수를 직접 할당
    (window as any).onUnityTaskCompleted = (detail: any) => {
      try {
        const taskId = detail?.taskId;
        if (taskId) {
          updateStatusRef.current({ orderId: String(taskId), status: "COMPLETED" });
        }
      } catch (e) {
        console.error("[Web] An error occurred inside onUnityTaskCompleted:", e);
      }
    };

    // 컴포넌트가 언마운트될 때 전역 핸들러를 정리
    return () => {
      console.log("[Web] Removing 'window.onUnityTaskCompleted' function.");
      delete (window as any).onUnityTaskCompleted;
    };
  }, []); // 의존성 배열을 비워서 마운트/언마운트 시 한 번만 실행

  return (
    <div className="h-full bg-white flex flex-col">
      <Card className="h-full border-0 shadow-none flex flex-col">
        <CardHeader className="bg-white border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>AMR 작동 현황</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2 bg-white flex-1 flex flex-col justify-center pt-10">
          <div className="border rounded-lg overflow-hidden bg-white w-full flex-1">
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
