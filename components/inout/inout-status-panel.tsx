"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, TruckIcon, Check, X, Trash2 } from "lucide-react"
import { InOutRecord } from "@/components/utils"
import { Separator } from "@/components/ui/separator"
import { CustomPagination } from "@/components/ui/custom-pagination"
import { useUpdateOrderStatus } from "@/lib/queries"
import { toast } from "sonner"
import { ORDER_STATUS_CONFIG, type OrderStatus, getStatusIcon, STATUS_TRANSITIONS } from "@/lib/order-status"
import { Badge } from "@/components/ui/badge"

interface InOutStatusPanelProps {
  showSearch: boolean;
  data: InOutRecord[];
  onReserveOrder?: (order: InOutRecord) => void; // Unity 연동용 콜백 추가
}

export default function InOutStatusPanel({ showSearch, data, onReserveOrder }: InOutStatusPanelProps) {
  const updateStatusMutation = useUpdateOrderStatus();

  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    productName: "",
    date: "",
  })
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const statusData: InOutRecord[] = useMemo(() => data.filter(
    (item) => item.status === "pending" || item.status === "scheduled"
  ), [data]);

  const handleStatusChange = async (record: InOutRecord, newStatus: OrderStatus) => {
    try {
      // Unity 연동: 예약 상태로 변경할 때 Unity에 작업 전송
      if (newStatus === 'scheduled') {
        console.log('[Unity] Sending order to Unity:', record);
        
        // 콜백이 있으면 콜백 사용, 없으면 전역 함수 사용
        if (onReserveOrder) {
          onReserveOrder(record);
        } else if ((window as any).unityReserveOrder) {
          (window as any).unityReserveOrder(record);
        } else {
          console.warn('[Unity] No Unity reserve function available');
        }
      }
      
      await updateStatusMutation.mutateAsync({ orderId: record.id, status: newStatus });
      toast.success(`주문 상태가 ${ORDER_STATUS_CONFIG[newStatus].label}(으)로 변경되었습니다.`);
    } catch (error) {
      toast.error("상태 변경 중 오류가 발생했습니다.");
      console.error('Status change failed:', error);
    }
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

  const getStatusBadge = (status: OrderStatus) => {
    const config = ORDER_STATUS_CONFIG[status];
    if (!config) return <Badge variant="secondary" className="text-xs">알 수 없음</Badge>;
    return (
      <Badge variant={config.variant as any} className={`${config.bgColor} ${config.textColor} text-xs whitespace-nowrap`}>
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

  const renderActionButtons = (record: InOutRecord) => {
    const currentStatus = record.status as OrderStatus;
    const possibleTransitions = STATUS_TRANSITIONS[currentStatus];

    if (!possibleTransitions || possibleTransitions.length === 0) {
      return null;
    }

    return (
      <div className="mt-2 pt-2 border-t border-gray-200 flex justify-end gap-2">
        {possibleTransitions.map((targetStatus) => {
          const config = ORDER_STATUS_CONFIG[targetStatus];
          let icon = null;
          let variant: any = 'outline';

          switch (targetStatus) {
            case 'scheduled':
              icon = <Check className="w-3 h-3" />;
              variant = 'default';
              break;
            case 'rejected':
              icon = <X className="w-3 h-3" />;
              variant = 'destructive';
              break;
            case 'cancelled':
              icon = <Trash2 className="w-3 h-3" />;
              variant = 'secondary';
              break;
          }

          return (
            <Button
              key={targetStatus}
              size="sm"
              variant={variant}
              onClick={() => handleStatusChange(record, targetStatus)}
              disabled={updateStatusMutation.isPending}
              className="h-7 px-2 text-xs"
              title={`${config.label}로 변경`}
            >
              {icon}
              <span className="ml-1">{config.label}</span>
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4">
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
        <div className="flex items-center gap-1">
          <Button variant={filters.type === "all" && filters.status === "all" ? "default" : "outline"} size="sm" onClick={() => { setFilters({ type: 'all', status: 'all', productName: '', date: ''}); setCurrentPage(1); }}>전체</Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant={filters.type === "inbound" ? "default" : "outline"} size="sm" onClick={() => handleToggleFilter("type", "inbound")}>입고</Button>
          <Button variant={filters.type === "outbound" ? "default" : "outline"} size="sm" onClick={() => handleToggleFilter("type", "outbound")}>출고</Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant={filters.status === "pending" ? "default" : "outline"} size="sm" onClick={() => handleToggleFilter("status", "pending")}>승인대기</Button>
          <Button variant={filters.status === "scheduled" ? "default" : "outline"} size="sm" onClick={() => handleToggleFilter("status", "scheduled")}>예약</Button>
        </div>
      </div>

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
              {renderActionButtons(item)}
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
