"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Package } from "lucide-react"
import { CustomPagination } from "@/components/ui/custom-pagination"
import { InOutRecord } from "@/components/utils"
import { Separator } from "@/components/ui/separator"
import { updateInOutRecord } from "@/lib/api"

import { useRouter } from "next/navigation"

type DisplayUnit = "개수" | "set"
type InOutStatus = "완료" | "진행 중" | "예약";

type InOutHistoryTableProps = {
  historyType: "inbound" | "outbound" | "all";
  initialData: InOutRecord[];
}

export default function InOutHistoryTable({ historyType, initialData }: InOutHistoryTableProps) {
  const [data, setData] = useState(initialData);
  const router = useRouter();

  const reloadData = () => {
    router.refresh();
  };
  
  const initialFilters = useMemo(() => ({
    type: historyType === 'all' ? 'all' : historyType,
    productName: "",
    specification: "",
    location: "",
    company: "",
    status: [] as InOutStatus[],
    destination: "",
    date: "",
  }), [historyType]);
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('set')
  const [selectedRecord, setSelectedRecord] = useState<InOutRecord | null>(null);
  const [formData, setFormData] = useState<Partial<InOutRecord>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 10
  const SET_QUANTITY = 14

  const historyData: InOutRecord[] = useMemo(() => {
    const filtered = (data || []).filter(item => {
      const typeMatch = historyType === 'all' || 
        item.type === historyType || 
        (historyType === 'inbound' && item.type === 'INBOUND') ||
        (historyType === 'outbound' && item.type === 'OUTBOUND');
      return typeMatch;
    });
    
    return filtered;
  }, [data, historyType]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value, }))
    setCurrentPage(1)
  }

  const handleStatusToggle = (statusToToggle: InOutStatus) => {
    setFilters(prev => {
      const newStatus = prev.status.includes(statusToToggle)
        ? prev.status.filter(s => s !== statusToToggle)
        : [...prev.status, statusToToggle];
      return { ...prev, status: newStatus };
    });
    setCurrentPage(1);
  };

  const handleTypeToggle = (typeToToggle: 'inbound' | 'outbound' | 'all') => {
    setFilters(prev => ({ ...prev, type: typeToToggle, status: [] }));
    setCurrentPage(1);
  }
  
  const handleRowClick = (record: InOutRecord) => {
    setSelectedRecord(record);
    setFormData(record);
    setIsModalOpen(true);
  }

  const handleFormSubmit = async () => {
    if (!selectedRecord) return;
    try {
      await updateInOutRecord(selectedRecord.id, formData);
      reloadData();
      setIsModalOpen(false);
      setSelectedRecord(null);
      // Optionally, add a success toast message here
    } catch (error) {
      console.error("Failed to update record:", error);
      // Optionally, add an error toast message here
    }
  };

  const filteredHistory = useMemo(() => historyData.filter((item) => {
    const statusMatch = filters.status.length === 0 || filters.status.includes(item.status);
    return (
      (filters.type === "all" || item.type === filters.type) &&
      (item.productName || '').toLowerCase().includes(filters.productName.toLowerCase()) &&
      (item.specification || '').toLowerCase().includes(filters.specification.toLowerCase()) &&
      (item.location || '').toLowerCase().includes(filters.location.toLowerCase()) &&
      (item.company || '').toLowerCase().includes(filters.company.toLowerCase()) &&
      statusMatch &&
      (item.destination || '').toLowerCase().includes(filters.destination.toLowerCase()) &&
      (filters.date === "" || item.date === filters.date)
    )
  }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()), [filters, historyData]);

  const isFiltered = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(initialFilters);
  }, [filters, initialFilters]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredHistory.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusChipClass = (status: "완료" | "진행 중" | "예약") => {
    switch (status) {
      case "완료": return "bg-green-100 text-green-800"
      case "진행 중": return "bg-blue-100 text-blue-800"
      case "예약": return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={
                  (historyType === 'all' && filters.type === 'all' && filters.status.length === 0) ||
                  (historyType !== 'all' && filters.status.length === 0)
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => {
                  setFilters(initialFilters);
                  setCurrentPage(1);
                }}
              >
                전체
              </Button>
              <Separator orientation="vertical" className="mx-1 h-6" />
              {historyType === 'all' && (
                <>
                  <Button variant={filters.type === "inbound" ? "default" : "outline"} size="sm" onClick={() => handleTypeToggle("inbound")}>입고</Button>
                  <Button variant={filters.type === "outbound" ? "default" : "outline"} size="sm" onClick={() => handleTypeToggle("outbound")}>출고</Button>
                  <Separator orientation="vertical" className="mx-1 h-6" />
                </>
              )}
              <Button variant={filters.status.includes("진행 중") ? "default" : "outline"} size="sm" onClick={() => handleStatusToggle("진행 중")}>진행 중</Button>
              <Button variant={filters.status.includes("예약") ? "default" : "outline"} size="sm" onClick={() => handleStatusToggle("예약")}>예약</Button>
              <Button variant={filters.status.includes("완료") ? "default" : "outline"} size="sm" onClick={() => handleStatusToggle("완료")}>완료</Button>
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
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
              {historyType !== 'inbound' && <Input placeholder="목적지" value={filters.destination} onChange={(e) => handleFilterChange("destination", e.target.value)} />}
              <Input type="date" value={filters.date} onChange={(e) => handleFilterChange("date", e.target.value)} />
              <Button variant="outline" onClick={() => setFilters(initialFilters)} className="text-gray-600">필터 초기화</Button>
            </div>
          )}
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-600">
              {isFiltered && (<span className="inline-flex items-center gap-1"><Filter className="w-3 h-3" />필터 적용됨 -</span>)}{" "}
              총 {filteredHistory.length}개 항목
            </div>
          </div>
          <div>
            <table className="w-full text-sm min-w-[1200px] table-fixed">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 md:p-3 font-semibold align-bottom pb-3 w-[8%]">유형</th>
                  <th className="text-left p-2 md:p-3 font-semibold align-bottom pb-3 w-[18%]">상품명</th>
                  <th className="text-left p-2 md:p-3 font-semibold align-bottom pb-3 w-[12%]">개별코드</th>
                  <th className="text-left p-2 md:p-3 font-semibold align-bottom pb-3 w-[8%]">규격</th>
                  <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-3 w-[7%]">수량</th>
                  <th className="text-center p-2 md:p-3 font-semibold align-bottom w-[12%]">
                    <div className="flex flex-col items-center pt-4" style={{ height: '3.5rem' }}>
                      <p className={`text-xs text-gray-500 font-normal whitespace-nowrap ${displayUnit === 'set' ? 'visible' : 'invisible'}`}>(1 set = {SET_QUANTITY}개)</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="whitespace-nowrap">주문수량</span>
                        <Select value={displayUnit} onValueChange={(value: DisplayUnit) => setDisplayUnit(value)}>
                          <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="set">Set</SelectItem>
                            <SelectItem value="개수">개수</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </th>
                  <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-3 w-[8%]">구역</th>
                  <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-3 w-[10%]">거래처</th>
                  <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-3 w-[10%]">상태</th>
                  {historyType !== 'inbound' && <th className="text-left p-2 md:p-3 font-semibold align-bottom pb-3 w-[8%]">목적지</th>}
                  <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-3 w-[10%]">날짜</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item.id || `history-item-${index}`} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(item)}>
                    <td className="p-2 md:p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${item.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>{item.type === "inbound" ? "입고" : "출고"}</span></td>
                    <td className="p-2 md:p-3 text-left truncate"><p className="font-medium">{item.productName}</p><p className="text-xs text-gray-500">SKU: {item.sku}</p></td>
                    <td className="p-2 md:p-3 text-left truncate">{item.individualCode}</td>
                    <td className="p-2 md:p-3 text-left truncate">{item.specification}</td>
                    <td className="p-2 md:p-3 text-center"><span className="font-semibold">{item.quantity}</span></td>
                    <td className="p-2 md:p-3 text-center"><div className="font-semibold">{displayUnit === 'set' ? `${Math.floor(item.quantity / SET_QUANTITY)} set` : `${item.quantity} 개`}</div></td>
                    <td className="p-2 md:p-3 text-center">{item.location}</td>
                    <td className="p-2 md:p-3 text-center truncate"><p className="font-medium">{item.company}</p><p className="text-xs text-gray-500">코드: {item.companyCode}</p></td>
                    <td className="p-2 md:p-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusChipClass(item.status)}`}>{item.status}</span></td>
                    {historyType !== 'inbound' && <td className="p-2 md:p-3 text-left truncate">{item.destination || "-"}</td>}
                    <td className="p-2 md:p-3 text-center"><div><p>{item.date}</p><p className="text-xs text-gray-500">{item.time}</p></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              {isFiltered ? (
                <>
                  <p>검색 결과가 없습니다.</p>
                  <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
                </>
              ) : (
                <p>표시할 입출고 내역이 없습니다.</p>
              )}
            </div>
          ) : null}
          {filteredHistory.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600 flex-shrink-0">총 {filteredHistory.length}개 중 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredHistory.length)}개 표시</div>
              <CustomPagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
      {isModalOpen && selectedRecord && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>입출고 상세 정보</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><Label className="text-gray-500">ID</Label><p>{formData.id}</p></div>
                <div><Label className="text-gray-500">유형</Label><p>{formData.type}</p></div>
                <div><Label className="text-gray-500">상품명</Label><p>{formData.productName}</p></div>
                <div><Label className="text-gray-500">SKU</Label><p>{formData.sku}</p></div>
                <div><Label className="text-gray-500">개별코드</Label><p>{formData.individualCode}</p></div>
                <div><Label className="text-gray-500">규격</Label><p>{formData.specification}</p></div>
                <div><Label className="text-gray-500">수량</Label><p>{formData.quantity}</p></div>
                <div><Label className="text-gray-500">구역</Label><p>{formData.location}</p></div>
                <div><Label className="text-gray-500">거래처</Label><p>{formData.company} ({formData.companyCode})</p></div>
                <div><Label className="text-gray-500">상태</Label><p>{formData.status}</p></div>
                {historyType !== 'inbound' && <div><Label className="text-gray-500">목적지</Label><p>{formData.destination}</p></div>}
                <div><Label className="text-gray-500">일시</Label><p>{formData.date} {formData.time}</p></div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="notes">비고</Label>
                <Textarea id="notes" value={formData.notes || ""} onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>취소</Button>
                <Button type="button" onClick={handleFormSubmit}>저장</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}