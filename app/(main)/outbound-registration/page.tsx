"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import OutboundForm from "@/components/forms/outbound-form"
import InOutHistoryTable from "@/components/inout/inout-history-table"
import { Plus } from "lucide-react"
import { useQueryData } from "@/contexts/query-data-context"
import { useRacks } from "@/lib/queries"
import InOutHistoryTableSkeleton from "@/components/inout/inout-history-table-skeleton"
import ErrorMessage from "@/components/ui/error-message"

export default function OutboundRegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { inOutData, isLoading: loading, hasError: error } = useQueryData()
  // 페이지 로드 시 랙 데이터 미리 캐싱하여 모달 열기 성능 향상
  const { data: racksData, isLoading: racksLoading } = useRacks()

  if (loading) return <InOutHistoryTableSkeleton />
  if (error) return <ErrorMessage message="데이터 로딩 오류" onRetry={() => window.location.reload()} />

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">출고 관리</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              신규 출고 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>신규 출고 등록</DialogTitle>
              <DialogDescription>
                새로운 출고 주문을 등록합니다. 필수 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <OutboundForm 
              onClose={() => setIsModalOpen(false)}
              racksData={racksData}
              racksLoading={racksLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
      <InOutHistoryTable 
        historyType="outbound"
        data={inOutData.data || []}
      />
    </div>
  )
}