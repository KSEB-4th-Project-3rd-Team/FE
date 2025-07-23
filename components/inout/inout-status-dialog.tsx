"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Package, TruckIcon } from "lucide-react"
import { InOutRecord } from "@/components/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface InOutStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: InOutRecord[];
}

export default function InOutStatusDialog({ isOpen, onClose, data }: InOutStatusDialogProps) {
  const [statusFilters, setStatusFilters] = useState({
    type: "",
    productName: "",
    location: "",
    status: "",
    company: "",
    date: "",
  })
  const [showStatusFilters, setShowStatusFilters] = useState(false)

  const statusData: InOutRecord[] = data;

  const handleStatusFilterChange = (field: string, value: string) => {
    setStatusFilters((prev) => {
      const newFilters = {
        ...prev,
        [field]: value,
      }

      if (field === "type" && value === "") {
        newFilters.status = ""
      }

      return newFilters
    })
  }

  const filteredStatus = statusData.filter((item) => {
    const typeMatch = statusFilters.type === "" || item.type === statusFilters.type
    const productNameMatch = item.productName.toLowerCase().includes(statusFilters.productName.toLowerCase())
    const locationMatch = item.location.toLowerCase().includes(statusFilters.location.toLowerCase())
    const statusMatch = statusFilters.status === "" || item.status === statusFilters.status
    const companyMatch = item.company.toLowerCase().includes(statusFilters.company.toLowerCase())

    let dateMatch = true
    if (statusFilters.date) {
      dateMatch = item.date === statusFilters.date
    }

    return typeMatch && productNameMatch && locationMatch && statusMatch && companyMatch && dateMatch
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
            <div className="flex items-center justify-between">
                <div>
                    <DialogTitle>입출고 현황</DialogTitle>
                    <DialogDescription>
                        현재 창고의 입출고 현황을 확인하고 필터링할 수 있습니다.
                    </DialogDescription>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowStatusFilters(!showStatusFilters)}
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    검색
                </Button>
            </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={statusFilters.type === "" && statusFilters.status === "" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        handleStatusFilterChange("type", "")
                        handleStatusFilterChange("status", "")
                      }}
                    >
                      전체
                    </Button>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <Button
                      variant={statusFilters.type === "inbound" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilterChange("type", "inbound")}
                    >
                      입고
                    </Button>
                    <Button
                      variant={statusFilters.type === "outbound" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilterChange("type", "outbound")}
                    >
                      출고
                    </Button>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <Button
                      variant={statusFilters.status === "예약" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilterChange("status", "예약")}
                    >
                      예약
                    </Button>
                    <Button
                      variant={statusFilters.status === "진행중" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilterChange("status", "진행중")}
                    >
                      진행중
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showStatusFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <Label htmlFor="product-filter" className="text-sm font-medium">
                        상품명
                      </Label>
                      <Input
                        id="product-filter"
                        placeholder="상품명 검색..."
                        value={statusFilters.productName}
                        onChange={(e) => handleStatusFilterChange("productName", e.target.value)}
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location-filter" className="text-sm font-medium">
                        위치
                      </Label>
                      <Input
                        id="location-filter"
                        placeholder="위치 검색..."
                        value={statusFilters.location}
                        onChange={(e) => handleStatusFilterChange("location", e.target.value)}
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-filter" className="text-sm font-medium">
                        거래처
                      </Label>
                      <Input
                        id="company-filter"
                        placeholder="거래처 검색..."
                        value={statusFilters.company}
                        onChange={(e) => handleStatusFilterChange("company", e.target.value)}
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-filter" className="text-sm font-medium">
                        날짜
                      </Label>
                      <Input
                        id="date-filter"
                        type="date"
                        value={statusFilters.date}
                        onChange={(e) => handleStatusFilterChange("date", e.target.value)}
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStatusFilters({
                            type: "",
                            productName: "",
                            location: "",
                            status: "",
                            company: "",
                            date: "",
                          })
                        }}
                        className="mt-6 text-gray-600"
                      >
                        필터 초기화
                      </Button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[800px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">유형</th>
                        <th className="text-left p-3 font-semibold">상품명</th>
                        <th className="text-center p-3 font-semibold">수량</th>
                        <th className="text-center p-3 font-semibold">위치</th>
                        <th className="text-center p-3 font-semibold">상태</th>
                        <th className="text-left p-3 font-semibold">거래처</th>
                        <th className="text-center p-3 font-semibold">예정일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStatus.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {item.type === "inbound" ? (
                                <Package className="w-4 h-4 text-blue-500" />
                              ) : (
                                <TruckIcon className="w-4 h-4 text-red-500" />
                              )}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.type === "inbound" ? "입고" : "출고"}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="font-medium">{item.productName}</p>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-semibold">{item.quantity.toLocaleString()}개</span>
                          </td>
                          <td className="p-3 text-center">{item.location}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === "예약" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3">{item.company}</td>
                          <td className="p-3 text-center">
                            <div>
                              <p className="text-sm">{item.date}</p>
                              <p className="text-xs text-gray-500">{item.time}</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredStatus.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>해당하는 현황이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
