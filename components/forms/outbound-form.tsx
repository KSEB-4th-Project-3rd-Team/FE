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

interface OutboundFormData {
  itemId: number | null;
  quantity: number;
  companyId: number | null;
  expectedDate: string;
  destination: string;
  notes: string;
}

interface OutboundFormProps {
  onSubmit: (data: OutboundFormData) => void;
  onClose: () => void;
  items: any[];
}

export default function OutboundForm({ onSubmit, onClose, items: propsItems }: OutboundFormProps) {
  const { companies } = useData();
  const [formData, setFormData] = useState<OutboundFormData>({
    itemId: null,
    quantity: 0,
    companyId: null,
    expectedDate: format(new Date(), "yyyy-MM-dd"),
    destination: "",
    notes: "",
  })
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!formData.itemId) {
      alert("품목을 선택해주세요.");
      return;
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      alert("출고 수량을 올바르게 입력해주세요.");
      return;
    }
    
    if (!formData.destination) {
      alert("목적지를 입력해주세요.");
      return;
    }
    
    onSubmit(formData)
    setFormData({
      itemId: null,
      quantity: 0,
      companyId: null,
      expectedDate: format(new Date(), "yyyy-MM-dd"),
      destination: "",
      notes: "",
    })
    setDate(new Date());
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleValueChange = (field: keyof OutboundFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="item-select">상품명 *</Label>
        <ItemAutocomplete
          id="item-select"
          items={propsItems}
          value={formData.itemId}
          onValueChange={(value) => {
            console.log("OutboundForm received itemId:", value);
            handleValueChange("itemId", value);
          }}
        />
      </div>

      <div>
        <Label htmlFor="quantity">출고 수량 *</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="출고 수량을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="company-select">거래처 *</Label>
        <CompanyAutocomplete
          id="company-select"
          companies={companies}
          value={formData.companyId}
          onValueChange={(value) => {
            console.log("OutboundForm received companyId:", value);
            handleValueChange("companyId", value);
          }}
        />
      </div>

      <div>
        <Label htmlFor="expected-date">예정일 *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="expected-date"
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
          <PopoverContent className="w-auto p-0 z-[9999]" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                console.log("Calendar onSelect triggered! selectedDate:", selectedDate);
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
        <Label htmlFor="destination">목적지 *</Label>
        <Input
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={handleInputChange}
          placeholder="목적지를 입력하세요"
          required
        />
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
          출고 등록
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          취소
        </Button>
      </div>
    </form>
  )
}
