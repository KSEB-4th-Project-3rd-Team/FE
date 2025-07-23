"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, TruckIcon } from "lucide-react"
import { InOutRecord, mockInOutData } from "@/components/utils"
import { Separator } from "@/components/ui/separator"
import { CustomPagination } from "@/components/ui/custom-pagination"

interface InOutStatusPanelProps {
  showSearch: boolean;
}

export default function InOutStatusPanel({ showSearch }: InOutStatusPanelProps) {
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    productName: "",
    date: "",
  })
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const statusData: InOutRecord[] = useMemo(() => mockInOutData.filter(
    (item) => item.status === "진행 중" || item.status === "예약"
  ), []);

  const handleToggleFilter = (field: 'type' | 'status', value: string) => {
    setFilters(prev => ({
        ...prev,
        [field]: prev[field] === value ? 'all' : value
    }));
    setCurrentPage(1);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
    setCurrentPage(1);
  }

  const filteredData = useMemo(() => statusData.filter((item) => {
    return (
      (filters.type === "all" || item.type === filters.type) &&
      (filters.status === "all" || item.status === filters.status) &&
      item.productName.toLowerCase().includes(filters.productName.toLowerCase()) &&
      (filters.date === "" || item.date === filters.date)
    )
  }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()), [statusData, filters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusChipClass = (status: "완료" | "진행 중" | "예약") => {
    switch (status) {
      case "진행 중":
        return "bg-blue-100 text-blue-800"
      case "예약":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  
  const getTypeIcon = (type: "inbound" | "outbound") => {
    return type === 'inbound' 
      ? <Package className="w-5 h-5 text-blue-500" /> 
      : <TruckIcon className="w-5 h-5 text-red-500" />
  }

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-4">
        {/* 검색 필터 */}
        {showSearch && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
            <Input
              placeholder="상품명 검색..."
              value={filters.productName}
              onChange={(e) => handleFilterChange("productName", e.target.value)}
              className="h-9 text-sm"
            />
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        )}

        {/* 필터 버튼 */}
        <div className="flex items-center gap-1">
          <Button
            variant={filters.type === "all" && filters.status === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilters({ type: 'all', status: 'all', productName: '', date: ''});
              setCurrentPage(1);
            }}
          >
            전체
          </Button>
          <Separator orientation="vertical" className="h-6" />
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
          <Separator orientation="vertical" className="h-6" />
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
        </div>
      </div>

      {/* 현황 목록 */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mt-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((item) => (
            <div key={item.id} className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getTypeIcon(item.type)}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 break-words">{item.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusChipClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">{item.quantity}개</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-medium text-gray-700 whitespace-nowrap">{item.date}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">해당하는 현황이 없습니다.</p>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-auto pt-4">
          <CustomPagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
