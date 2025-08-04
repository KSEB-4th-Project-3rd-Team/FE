"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import OutboundForm from "@/components/forms/outbound-form"
import InOutHistoryTable from "@/components/inout/inout-history-table"
import { Plus } from "lucide-react"
import { useQueryData } from "@/contexts/query-data-context"
import { useCreateOutboundOrder } from "@/lib/queries"
import { toast } from "sonner"
import InOutHistoryTableSkeleton from "@/components/inout/inout-history-table-skeleton"
import ErrorMessage from "@/components/ui/error-message"

export default function OutboundRegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { inOutData, items, companies, isLoading: loading, hasError: error } = useQueryData()
  const { mutate: createOutbound, isPending: isCreating } = useCreateOutboundOrder()

  if (loading) return <InOutHistoryTableSkeleton />
  if (error) return <ErrorMessage message="데이터 로딩 오류" onRetry={() => window.location.reload()} />

  const handleFormSubmit = (formData: any) => {
    // Validate that required fields are provided
    if (!formData.itemId) {
      toast.error("품목을 선택해주세요.");
      return;
    }
    
    if (!formData.companyId) {
      toast.error("거래처를 선택해주세요.");
      return;
    }
    
    const selectedItem = items.data?.find(item => item.itemId === formData.itemId);
    if (!selectedItem) {
      toast.error(`선택한 품목을 찾을 수 없습니다. (ID: ${formData.itemId})`);
      return;
    }

    const orderData = {
      itemId: formData.itemId,
      quantity: Number(formData.quantity),
      companyId: formData.companyId,
      expectedDate: formData.expectedDate,
      notes: formData.notes,
    };
    
    // React Query Mutation 사용 (자동 캐시 무효화 + 에러 처리)
    createOutbound(orderData, {
      onSuccess: () => {
        toast.success("신규 출고가 성공적으로 등록되었습니다.");
        setIsModalOpen(false);
      },
      onError: (error: any) => {
        console.error("Failed to submit outbound order:", error);
        toast.error("출고 등록에 실패했습니다.");
      }
    });
  }

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
              onSubmit={handleFormSubmit} 
              onClose={() => setIsModalOpen(false)}
              items={items.data || []}
            />
          </DialogContent>
        </Dialog>
      </div>
      <InOutHistoryTable 
        historyType="outbound"
        initialData={inOutData.data || []}
      />
    </div>
  )
}
