"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ItemAutocomplete } from "./item-autocomplete"
import { CompanyAutocomplete } from "./company-autocomplete"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { useQueryData } from "@/contexts/query-data-context"

interface InboundFormData {
  itemId: number | null;
  quantity: number;
  companyId: number | null;
  expectedDate: string;
  location: string; // 구역 정보 추가
  notes: string;
  status: 'pending'; // 새로 등록되는 입고는 항상 '승인대기' 상태
}

interface InboundFormProps {
  onSubmit: (data: InboundFormData) => void;
  onClose: () => void;
  items: any[]; // Will be replaced with proper Item type
}

// 구역 생성 함수 (A~T)
const generateAreas = () => {
  const areas = [];
  for (let letter = 'A'.charCodeAt(0); letter <= 'T'.charCodeAt(0); letter++) {
    const area = String.fromCharCode(letter);
    areas.push({ value: area, label: `${area}구역` });
  }
  return areas;
};

// 번호 생성 함수 (1~12번)
const generateNumbers = () => {
  const numbers = [];
  for (let number = 1; number <= 12; number++) {
    numbers.push({ value: number.toString(), label: `${number}번` });
  }
  return numbers;
};

export default function InboundForm({ onSubmit, onClose, items: propsItems }: InboundFormProps) {
  const { companies } = useQueryData();
  const [formData, setFormData] = useState<InboundFormData>({
    itemId: null,
    quantity: 0,
    companyId: null,
    expectedDate: format(new Date(), "yyyy-MM-dd"),
    location: "", // 조합된 구역 정보 (예: G010)
    notes: "",
    status: 'pending', // 기본값은 항상 '승인대기'
  })
  const [selectedArea, setSelectedArea] = useState<string>(""); // UI용 구역 선택
  const [selectedNumber, setSelectedNumber] = useState<string>(""); // UI용 번호 선택
  
  const areas = generateAreas();
  const numbers = generateNumbers();

  // 구역과 번호를 조합하여 location 업데이트
  const updateLocation = (area: string, number: string) => {
    if (area && number) {
      const paddedNumber = number.padStart(3, '0');
      const combinedLocation = `${area}${paddedNumber}`;
      setFormData(prev => ({
        ...prev,
        location: combinedLocation
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        location: ""
      }));
    }
  };

  // 구역 선택 핸들러
  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    updateLocation(area, selectedNumber);
  };

  // 번호 선택 핸들러  
  const handleNumberChange = (number: string) => {
    setSelectedNumber(number);
    updateLocation(selectedArea, number);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!formData.itemId) {
      alert("품목을 선택해주세요.");
      return;
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      alert("입고 수량을 올바르게 입력해주세요.");
      return;
    }
    
    if (!formData.location) {
      alert("구역을 선택해주세요.");
      return;
    }
    
    onSubmit(formData)
    setFormData({
      itemId: null,
      quantity: 0,
      companyId: null,
      expectedDate: format(new Date(), "yyyy-MM-dd"),
      location: "", // 폼 리셋 시 구역도 초기화
      notes: "",
      status: 'pending', // 폼 리셋 시에도 '승인대기' 상태
    })
    setSelectedArea(""); // 구역 선택 초기화
    setSelectedNumber(""); // 번호 선택 초기화
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" ? (value === "" ? 0 : Number(value)) : value,
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
        <Label htmlFor="item-select">상품명 *</Label>
        <ItemAutocomplete
          id="item-select"
          items={propsItems}
          value={formData.itemId}
          onValueChange={(value) => {
            console.log("InboundForm received itemId:", value, "(type:", typeof value, ")");
            handleValueChange("itemId", value);
          }}
        />
      </div>

      <div>
        <Label htmlFor="quantity">입고 수량 *</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity.toString()}
          onChange={handleInputChange}
          placeholder="입고 수량을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="company-select">거래처</Label>
        <CompanyAutocomplete
          id="company-select"
          companies={companies.data || []}
          value={formData.companyId}
          onValueChange={(value) => {
            console.log("InboundForm received companyId:", value, "(type:", typeof value, ")");
            handleValueChange("companyId", value);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="area-select">구역 *</Label>
          <Select value={selectedArea} onValueChange={handleAreaChange}>
            <SelectTrigger>
              <SelectValue placeholder="구역 선택" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area) => (
                <SelectItem key={area.value} value={area.value}>
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="number-select">번호 *</Label>
          <Select value={selectedNumber} onValueChange={handleNumberChange}>
            <SelectTrigger>
              <SelectValue placeholder="번호 선택" />
            </SelectTrigger>
            <SelectContent>
              {numbers.map((number) => (
                <SelectItem key={number.value} value={number.value}>
                  {number.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {formData.location && (
        <div className="text-sm text-gray-600">
          선택된 구역: <span className="font-semibold">{formData.location}</span>
        </div>
      )}

      <div>
        <Label htmlFor="expected-date">예정일 *</Label>
        <Input
          id="expected-date"
          name="expectedDate"
          type="date"
          value={formData.expectedDate}
          onChange={handleInputChange}
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
          입고 등록
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          취소
        </Button>
      </div>
    </form>
  )
}