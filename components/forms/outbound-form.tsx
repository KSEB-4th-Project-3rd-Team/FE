"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface OutboundFormProps {
  onSubmit: (data: any) => void
  onClose: () => void
}

export default function OutboundForm({ onSubmit, onClose }: OutboundFormProps) {
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    location: "창고1",
    destination: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)

    // 폼 초기화
    setFormData({
      productName: "",
      quantity: "",
      location: "창고1",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="productName">상품명 *</Label>
        <Input
          id="productName"
          name="productName"
          value={formData.productName}
          onChange={handleInputChange}
          placeholder="출고할 상품명을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="quantity">출고 수량 *</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="출고 수량을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="location">출고 위치 *</Label>
        <select
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="창고1">창고1</option>
          <option value="창고2">창고2</option>
          <option value="창고3">창고3</option>
          <option value="창고4">창고4</option>
          <option value="창고5">창고5</option>
          <option value="창고6">창고6</option>
          <option value="창고7">창고7</option>
          <option value="창고8">창고8</option>
        </select>
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
