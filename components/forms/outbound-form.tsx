"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ItemAutocomplete } from "./item-autocomplete"
import { CompanyAutocomplete } from "./company-autocomplete"
import { InventoryItem } from "@/components/utils"

interface OutboundFormData {
  productName: string;
  quantity: string;
  customer: string;
  destination: string;
  notes: string;
}

interface OutboundFormProps {
  onSubmit: (data: OutboundFormData) => void;
  onClose: () => void;
  items: InventoryItem[];
}

export default function OutboundForm({ onSubmit, onClose, items }: OutboundFormProps) {
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    customer: "",
    destination: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      productName: "",
      quantity: "",
      customer: "",
      destination: "",
      notes: "",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleValueChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="productName">상품명 *</Label>
        <ItemAutocomplete
          items={items}
          value={formData.productName}
          onValueChange={(value) => handleValueChange("productName", value)}
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
        <Label htmlFor="customer">거래처 *</Label>
        <CompanyAutocomplete
          value={formData.customer}
          onValueChange={(value) => handleValueChange("customer", value)}
        />
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