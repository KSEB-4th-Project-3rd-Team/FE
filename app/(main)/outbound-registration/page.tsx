"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import OutboundForm from "@/components/forms/outbound-form"
import InOutHistoryTable from "@/components/inout/inout-history-table"
import { Plus } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { createOutboundOrder } from "@/lib/api"
import { toast } from "sonner"
import InOutHistoryTableSkeleton from "@/components/inout/inout-history-table-skeleton"
import ErrorMessage from "@/components/ui/error-message"

export default function OutboundRegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { inOutData, inventoryData, loading, error, reloadData } = useData()

  if (loading) return <InOutHistoryTableSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={reloadData} />

  const handleFormSubmit = async (formData: any) => {
    try {
      const selectedItem = inventoryData.find(item => item.name === formData.productName);
      if (!selectedItem) {
        throw new Error("Selected product not found in inventory.");
      }

      const orderData = {
        type: 'OUTBOUND' as const,
        itemId: selectedItem.id,
        quantity: Number(formData.quantity),
        companyName: formData.client, // In outbound, it's 'client'
        notes: formData.notes,
      };
      
      await createOutboundOrder(orderData);
      toast.success("신규 출고가 성공적으로 등록되었습니다.");
      reloadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit outbound order:", error);
      toast.error("출고 등록에 실패했습니다.");
    }
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
            </DialogHeader>
            <OutboundForm 
              onSubmit={handleFormSubmit} 
              onClose={() => setIsModalOpen(false)}
              items={inventoryData}
            />
          </DialogContent>
        </Dialog>
      </div>
      <InOutHistoryTable 
        historyType="outbound" 
        data={inOutData.filter(d => d.type === 'OUTBOUND')}
      />
    </div>
  )
}
