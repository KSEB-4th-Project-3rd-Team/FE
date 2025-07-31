"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import InboundForm from "@/components/forms/inbound-form"
import InOutHistoryTable from "@/components/inout/inout-history-table"
import { Plus } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { createInboundOrder } from "@/lib/api"
import { toast } from "sonner"
import InOutHistoryTableSkeleton from "@/components/inout/inout-history-table-skeleton"
import ErrorMessage from "@/components/ui/error-message"

export default function InboundRegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { inOutData, items, companies, loading, error, reloadData } = useData()

  if (loading) return <InOutHistoryTableSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={reloadData} />

  const handleFormSubmit = async (formData: any) => {
    try {
      console.log("Submitting inbound order:", formData);
      console.log("Available items:", items.map(item => ({ itemId: item.itemId, itemName: item.itemName })));
      console.log("Looking for itemId:", formData.itemId, "Type:", typeof formData.itemId);
      
      // Validate that required fields are provided
      if (!formData.itemId) {
        throw new Error("품목을 선택해주세요.");
      }
      
      if (!formData.companyId) {
        throw new Error("거래처를 선택해주세요.");
      }
      
      const selectedItem = items.find(item => item.itemId === formData.itemId);
      const selectedCompany = companies.find(company => company.companyId === formData.companyId);
      
      console.log("Found item:", selectedItem);
      console.log("Found company:", selectedCompany);
      
      if (!selectedItem) {
        throw new Error(`선택한 품목을 찾을 수 없습니다. (ID: ${formData.itemId})`);
      }

      const orderData = {
        itemId: formData.itemId,
        quantity: Number(formData.quantity),
        companyId: formData.companyId,
        expectedDate: formData.expectedDate,
        notes: formData.notes,
      };
      
      await createInboundOrder(orderData);
      toast.success("신규 입고가 성공적으로 등록되었습니다.");
      await reloadData(); // Reload all data to reflect changes
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit inbound order:", error);
      toast.error("입고 등록에 실패했습니다.");
    }
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
              items={items}
            />
          </DialogContent>
        </Dialog>
      </div>
      <InOutHistoryTable 
        historyType="inbound"
        initialData={[]}
      />
    </div>
  )
}
