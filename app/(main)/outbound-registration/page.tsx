"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import OutboundForm from "@/components/forms/outbound-form"
import InOutHistoryTable from "@/components/inout/inout-history-table"
import { Plus } from "lucide-react"

export default function OutboundRegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFormSubmit = (formData: any) => {
    console.log("Outbound data submitted:", formData)
    // 여기에 실제 데이터 전송 로직 추가
    setIsModalOpen(false)
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">출고 등록</h2>
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
            <OutboundForm onSubmit={handleFormSubmit} onClose={() => setIsModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <InOutHistoryTable historyType="outbound" />
    </div>
  )
}
