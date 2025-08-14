"use client"

import InOutStatusPanel from "@/components/inout/inout-status-panel"
import WarehouseSimulation from "@/components/simulation/warehouse-simulation"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useInOutData } from "@/lib/queries"
import { useMemo } from "react"

export default function AmrStatusPage() {
  const { data: inOutData = [], isLoading } = useInOutData()

  const pendingOrScheduledData = useMemo(
    () =>
      inOutData.filter(
        (item) => item.status === "pending" || item.status === "scheduled",
      ),
    [inOutData],
  )

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full max-h-full">
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="h-full p-1 md:p-2">
            <WarehouseSimulation />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="h-full flex flex-col p-1 md:p-2 lg:p-4">
            <div className="mb-4">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
                작업 예약
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                승인대기 작업을 예약하여 AMR에 할당합니다.
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <InOutStatusPanel
                showSearch={false}
                data={pendingOrScheduledData}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
