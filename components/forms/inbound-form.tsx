"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ItemAutocomplete } from "./item-autocomplete"
import { CompanyAutocomplete } from "./company-autocomplete"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/components/utils"
import { useData } from "@/contexts/data-context"

interface InboundFormData {
  itemId: number | null;
  quantity: number;
  companyId: number | null;
  expectedDate: string;
  notes: string;
}

interface InboundFormProps {
  onSubmit: (data: InboundFormData) => void;
  onClose: () => void;
  items: any[]; // Will be replaced with proper Item type
}

export default function InboundForm({ onSubmit, onClose, items: propsItems }: InboundFormProps) {
  const { companies } = useData();
  const [formData, setFormData] = useState<InboundFormData>({
    itemId: null,
    quantity: 0,
    companyId: null,
    expectedDate: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  })
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      itemId: null,
      quantity: 0,
      companyId: null,
      expectedDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    })
    setDate(new Date());
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleValueChange = (field: keyof InboundFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="itemId">상품명 *</Label>
        <ItemAutocomplete
          items={propsItems}
          value={formData.itemId || ""}
          onValueChange={(value) => handleValueChange("itemId", value as number)}
        />
      </div>

      <div>
        <Label htmlFor="quantity">입고 수량 *</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="입고 수량을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="companyId">거래처</Label>
        <CompanyAutocomplete
          companies={companies}
          value={formData.companyId || ""}
          onValueChange={(value) => handleValueChange("companyId", value as number)}
        />
      </div>

      <div>
        <Label htmlFor="expectedDate">예정일 *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "yyyy-MM-dd") : <span>날짜 선택</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                if (selectedDate) {
                  handleValueChange("expectedDate", format(selectedDate, "yyyy-MM-dd"));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="notes">비고</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="추가 정보를 입력하세요"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          입고 등록
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          취소
        </Button>
      </div>
    </form>
  )
}