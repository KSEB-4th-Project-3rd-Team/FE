"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Package } from "lucide-react"
import { InOutRecord, mockInOutData } from "@/components/utils"
import { Separator } from "@/components/ui/separator"

type DisplayUnit = "개수" | "set"
type InOutHistoryProps = {
  historyType: "inbound" | "outbound" | "all"
}

export default function InOutHistory({ historyType }: InOutHistoryProps) {
  const [filters, setFilters] = useState({
    type: historyType === 'all' ? 'all' : historyType,
    productName: "",
    specification: "",
    location: "",
    company: "",
    status: "all",
    destination: "",
    date: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('set')

  const itemsPerPage = 10
  const SET_QUANTITY = 14

  const historyData: InOutRecord[] = mockInOutData.filter(item => {
    if (historyType === 'all') return true
    return item.type === historyType
  })

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
    setCurrentPage(1)
  }

  const handleToggleFilter = (field: 'type' | 'status', value: string) => {
    setFilters(prev => ({
        ...prev,
        [field]: prev[field] === value ? 'all' : value
    }));
    setCurrentPage(1);
  };

  const filteredHistory = historyData.filter((item) => {
    return (
      (filters.type === "all" || item.type === filters.type) &&
      item.productName.toLowerCase().includes(filters.productName.toLowerCase()) &&
      item.specification.toLowerCase().includes(filters.specification.toLowerCase()) &&
      item.location.toLowerCase().includes(filters.location.toLowerCase()) &&
      item.company.toLowerCase().includes(filters.company.toLowerCase()) &&
      (filters.status === "all" || item.status === filters.status) &&
      item.destination.toLowerCase().includes(filters.destination.toLowerCase()) &&
      (filters.date === "" || item.date === filters.date)
    )
  })

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredHistory.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={filters.type === "all" && filters.status === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilters(prev => ({...prev, type: 'all', status: 'all'}));
                setCurrentPage(1);
              }}
            >
              전체
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            {historyType === 'all' && (
              <>
                <Button
                  variant={filters.type === "inbound" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFilter("type", "inbound")}
                >
                  입고
                </Button>
                <Button
                  variant={filters.type === "outbound" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFilter("type", "outbound")}
                >
                  출고
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
              </>
            )}
            <Button
              variant={filters.status === "진행 중" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggleFilter("status", "진행 중")}
            >
              진행 중
            </Button>
            <Button
              variant={filters.status === "예약" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggleFilter("status", "예약")}
            >
              예약
            </Button>
            <Button
              variant={filters.status === "완료" ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggleFilter("status", "완료")}
            >
              완료
            </Button>
        </div>
        <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            검색
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
            <Input placeholder="상품명" value={filters.productName} onChange={(e) => handleFilterChange("productName", e.target.value)} />
            <Input placeholder="규격" value={filters.specification} onChange={(e) => handleFilterChange("specification", e.target.value)} />
            <Input placeholder="구역" value={filters.location} onChange={(e) => handleFilterChange("location", e.target.value)} />
            <Input placeholder="거래처" value={filters.company} onChange={(e) => handleFilterChange("company", e.target.value)} />
            <Input placeholder="목적지" value={filters.destination} onChange={(e) => handleFilterChange("destination", e.target.value)} />
            <Input type="date" value={filters.date} onChange={(e) => handleFilterChange("date", e.target.value)} />
            
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    type: historyType === 'all' ? 'all' : historyType,
                    productName: "",
                    specification: "",
                    location: "",
                    company: "",
                    status: "all",
                    destination: "",
                    date: "",
                  })
                  setCurrentPage(1)
                }}
                className="text-gray-600"
              >
                필터 초기화
              </Button>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {Object.values(filters).some((filter) => filter !== "" && filter !== "all") && (
              <span className="inline-flex items-center gap-1">
                <Filter className="w-3 h-3" />
                필터 적용됨 -
              </span>
            )}{" "}
            총 {filteredHistory.length}개 항목
          </div>
        </div>

        <div>
          <table className="w-full text-sm min-w-[1200px]">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 md:p-3 font-semibold">유형</th>
                <th className="text-left p-2 md:p-3 font-semibold">상품명</th>
                <th className="text-left p-2 md:p-3 font-semibold">개별코드</th>
                <th className="text-left p-2 md:p-3 font-semibold">규격</th>
                <th className="text-center p-2 md:p-3 font-semibold">수량</th>
                <th className="relative text-center p-2 md:p-3 pt-7 font-semibold">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-full">
                    {displayUnit === 'set' && (
                      <p className="relative bottom-3 text-xs text-gray-500 font-normal whitespace-nowrap ">
                        (1 set = {SET_QUANTITY}개)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>주문수량</span>
                    <Select value={displayUnit} onValueChange={(value: DisplayUnit) => setDisplayUnit(value)}>
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="개수">개수</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </th>
                <th className="text-center p-2 md:p-3 font-semibold">구역</th>
                <th className="text-left p-2 md:p-3 font-semibold">거래처</th>
                <th className="text-center p-2 md:p-3 font-semibold">상태</th>
                <th className="text-left p-2 md:p-3 font-semibold">목적지</th>
                <th className="text-center p-2 md:p-3 font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 md:p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        item.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.type === "inbound" ? "입고" : "출고"}
                    </span>
                  </td>
                  <td className="p-2 md:p-3">
                    <p className="font-medium text-sm break-words">{item.productName}</p>
                    <p className="text-xs text-gray-500 break-all">SKU: {item.sku}</p>
                  </td>
                  <td className="p-2 md:p-3 text-sm">{item.individualCode}</td>
                  <td className="p-2 md:p-3 text-sm">{item.specification}</td>
                  <td className="p-2 md:p-3 text-center">
                    <span className="font-semibold">{item.quantity}</span>
                  </td>
                  <td className="p-2 md:p-3 text-center">
                    <div className="font-semibold">
                      {displayUnit === 'set'
                        ? `${Math.floor(item.quantity / SET_QUANTITY)} set`
                        : `${item.quantity} 개`}
                    </div>
                  </td>
                  <td className="p-2 md:p-3 text-center text-sm">{item.location}</td>
                  <td className="p-2 md:p-3 text-sm">{item.company}</td>
                  <td className="p-2 md:p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusChipClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2 md:p-3 text-sm">{item.destination || "-"}</td>
                  <td className="p-2 md:p-3 text-center">
                    <div>
                      <p className="text-sm whitespace-nowrap">{item.date}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>검색 결과가 없습니다.</p>
            <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
          </div>
        )}

        {filteredHistory.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600 flex-shrink-0">
              총 {filteredHistory.length}개 중 {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredHistory.length)}개 표시
            </div>
            <div className="flex gap-1 ml-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3"
              >
                이전
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                return (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={`px-3 ${currentPage === page ? "bg-blue-50 text-blue-600" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3"
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
