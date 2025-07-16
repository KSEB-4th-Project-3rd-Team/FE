"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Package, TruckIcon, X } from "lucide-react"
import { InOutRecord, mockInOutData } from "@/components/utils"

interface InOutStatusPanelProps {
  onClose: () => void;
}

export default function InOutStatusPanel({ onClose }: InOutStatusPanelProps) {
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    productName: "",
    location: "",
    company: "",
    date: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const statusData: InOutRecord[] = mockInOutData.filter(
    (item) => item.status === "진행 중" || item.status === "예약"
  )

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

    const resetFilters = () => {
    setFilters({
        type: "",
        status: "",
        productName: "",
        location: "",
        company: "",
        date: "",
    })
  }


  const filteredData = statusData.filter((item) => {
    return (
      (filters.type === "" || item.type === filters.type) &&
      (filters.status === "" || item.status === filters.status) &&
      item.productName.toLowerCase().includes(filters.productName.toLowerCase()) &&
      item.location.toLowerCase().includes(filters.location.toLowerCase()) &&
      item.company.toLowerCase().includes(filters.company.toLowerCase()) &&
      (filters.date === "" || item.date === filters.date)
    )
  })

    const getStatusChipClass = (status: "완료" | "진행 중" | "예약") => {
    switch (status) {
      case "완료":
        return "bg-green-100 text-green-800"
      case "진행 중":
        return "bg-blue-100 text-blue-800"
      case "예약":
        return "bg-yellow-100 text-yellow-800"
    }
  }


  return (
    <div className="p-4 bg-gray-50 border-l border-gray-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">입출고 현황</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
            </Button>
        </div>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button
                  variant={filters.type === "" && filters.status === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({...prev, type: "", status: ""}))}
                >
                  전체
                </Button>
                <Button
                  variant={filters.type === "inbound" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("type", "inbound")}
                >
                  입고
                </Button>
                <Button
                  variant={filters.type === "outbound" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("type", "outbound")}
                >
                  출고
                </Button>
                <Button
                  variant={filters.status === "진행 중" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("status", "진행 중")}
                >
                  진행 중
                </Button>
                <Button
                  variant={filters.status === "예약" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("status", "예약")}
                >
                  예약
                </Button>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Search className="w-3 h-3" />
                검색
              </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
            {showFilters && (
              <div className="grid grid-cols-1 gap-3 mb-4 p-3 bg-gray-100 rounded-lg border">
                <div>
                  <Label htmlFor="product-filter-panel" className="text-xs font-medium">상품명</Label>
                  <Input
                    id="product-filter-panel"
                    placeholder="상품명 검색..."
                    value={filters.productName}
                    onChange={(e) => handleFilterChange("productName", e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="location-filter-panel" className="text-xs font-medium">위치</Label>
                  <Input
                    id="location-filter-panel"
                    placeholder="위치 검색..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="company-filter-panel" className="text-xs font-medium">거래처</Label>
                  <Input
                    id="company-filter-panel"
                    placeholder="거래처 검색..."
                    value={filters.company}
                    onChange={(e) => handleFilterChange("company", e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="date-filter-panel" className="text-xs font-medium">날짜</Label>
                  <Input
                    id="date-filter-panel"
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={resetFilters}
                    className="w-full mt-2 text-gray-600"
                  >
                    필터 초기화
                  </Button>
                </div>
              </div>
            )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">유형</th>
                  <th className="text-left p-2 font-semibold">상품명</th>
                  <th className="text-center p-2 font-semibold">상태</th>
                  <th className="text-center p-2 font-semibold">예정일시</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100">
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          item.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.type === "inbound" ? "입고" : "출고"}
                      </span>
                    </td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium text-xs break-words">{item.productName}</p>
                        <p className="text-xs text-gray-500 break-all">{item.sku}</p>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusChipClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <div>
                        <p className="text-xs whitespace-nowrap">{item.date}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">해당하는 현황이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
