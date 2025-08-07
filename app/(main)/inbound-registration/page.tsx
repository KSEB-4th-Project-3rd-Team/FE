"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import InboundForm from "@/components/forms/inbound-form"
import InOutHistoryTable from "@/components/inout/inout-history-table"
import { Plus } from "lucide-react"
import { useQueryData } from "@/contexts/query-data-context"
import { useCreateInboundOrder } from "@/lib/queries"
import { toast } from "sonner"
import InOutHistoryTableSkeleton from "@/components/inout/inout-history-table-skeleton"
import ErrorMessage from "@/components/ui/error-message"

export default function InboundRegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { inOutData, items, companies, isLoading: loading, hasError: error } = useQueryData()
  const { mutate: createInbound, isPending: isCreating } = useCreateInboundOrder()

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
    
    // React Query Mutation 사용 (lib/queries.ts의 중앙 로직 사용)
    createInbound(orderData, {
      onSuccess: () => {
        toast.success("신규 입고가 성공적으로 등록되었습니다.");
      },
      onSettled: () => {
        setIsModalOpen(false);
      },
      onError: (error: any) => {
        console.error("Failed to submit inbound order:", error);
        toast.error("입고 등록에 실패했습니다.");
      }
    });
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">입고 관리</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              신규 입고 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>신규 입고 등록</DialogTitle>
              <DialogDescription>
                새로운 입고 주문을 등록합니다. 필수 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <InboundForm 
              onSubmit={handleFormSubmit} 
              onClose={() => setIsModalOpen(false)}
              items={items.data || []}
            />
          </DialogContent>
        </Dialog>
      </div>
      <InOutHistoryTable 
        historyType="inbound"
        data={inOutData.data || []}
      />
    </div>
  )
}
