"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, TruckIcon, Timer, CalendarDays, CheckCircle, X, XCircle } from "lucide-react"
import { InOutRecord } from "@/components/utils"
import { Separator } from "@/components/ui/separator"
import { CustomPagination } from "@/components/ui/custom-pagination"
import { useApproveInboundOrder, useDeclineInboundOrder } from "@/lib/queries"
import { toast } from "sonner"
import { ORDER_STATUS_CONFIG, type OrderStatus, getStatusIcon } from "@/lib/order-status"
import { Badge } from "@/components/ui/badge"

interface InOutStatusPanelProps {
  showSearch: boolean;
  data: InOutRecord[];
}

export default function InOutStatusPanel({ showSearch, data }: InOutStatusPanelProps) {
  const { mutate: approveOrder, isPending: isApproving } = useApproveInboundOrder();
  const { mutate: declineOrder, isPending: isDeclining } = useDeclineInboundOrder();

  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    productName: "",
    date: "",
  })
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 🔄 새로운 상태 시스템: 완료되지 않은 상태만 표시 (대기중, 예약)
  const statusData: InOutRecord[] = useMemo(() => data.filter(
    (item) => item.status === "pending" || item.status === "scheduled"
  ), [data]);

  const handleApprove = (orderId: string) => {
    approveOrder(orderId, {
      onSuccess: () => toast.success("작업이 승인되었습니다."),
      onError: (err: any) => toast.error(`승인 실패: ${err.message}`),
    });
  };

  const handleDecline = (orderId: string) => {
    declineOrder(orderId, {
      onSuccess: () => toast.success("작업이 거절되었습니다."),
      onError: (err: any) => toast.error(`거절 실패: ${err.message}`),
    });
  };

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
      (item.productName || '').toLowerCase().includes(filters.productName.toLowerCase()) &&
      (filters.date === "" || item.date === filters.date)
    )
  }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()), [statusData, filters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🎯 새로운 상태 배지 렌더링 함수
  const getStatusBadge = (status: OrderStatus) => {
    const config = ORDER_STATUS_CONFIG[status];
    
    if (!config) {
      return (
        <Badge variant="secondary" className="text-xs">
          <span className="mr-1">?</span>
          알 수 없음
        </Badge>
      );
    }

    return (
      <Badge 
        variant={config.variant as any}
        className={`${config.bgColor} ${config.textColor} text-xs whitespace-nowrap`}
      >
        <span className="mr-1">{getStatusIcon(status)}</span>
        {config.label}
      </Badge>
    );
  };
  
  const getTypeIcon = (type: "inbound" | "outbound") => {
    return type === 'inbound' 
      ? <Package className="w-5 h-5 text-blue-500" /> 
      : <TruckIcon className="w-5 h-5 text-red-500" />
  }

  return (
    <div className="flex flex-col">
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
            variant={filters.status === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleFilter("status", "pending")}
          >
            대기중
          </Button>
          <Button
            variant={filters.status === "scheduled" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleFilter("status", "scheduled")}
          >
            예약
          </Button>
        </div>
      </div>

      {/* 현황 목록 */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 mt-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((item) => (
            <div key={item.id} className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getTypeIcon(item.type)}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 break-words truncate">{item.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(item.status as OrderStatus)}
                      <span className="text-xs text-gray-600 font-medium">{item.quantity}개</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-medium text-gray-700 whitespace-nowrap">{item.date}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
              {item.status === 'pending' && (
                <div className="mt-2 pt-2 border-t border-gray-200 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleDecline(item.id)}
                    disabled={isApproving || isDeclining}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    거절
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleApprove(item.id)}
                    disabled={isApproving || isDeclining}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    승인
                  </Button>
                </div>
              )}
              {item.status === 'scheduled' && (
                <div className="mt-2 pt-2 border-t border-gray-200 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleDecline(item.id)}
                    disabled={isApproving || isDeclining}
                  >
                    <X className="w-3 h-3 mr-1" />
                    취소
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(item.id)}
                    disabled={isApproving || isDeclining}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    완료
                  </Button>
                </div>
              )}
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
        <div className="mt-4 pt-2">
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
