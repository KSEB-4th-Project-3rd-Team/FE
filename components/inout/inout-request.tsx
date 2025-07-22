"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X } from "lucide-react"
import { InOutRequest, mockInOutRequests } from "@/components/utils"
import { CustomPagination } from "@/components/ui/custom-pagination"

type DisplayUnit = "개수" | "set"

export default function InOutRequestPage() {
  const [requests, setRequests] = useState<InOutRequest[]>([])
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('set')
  const [selectedRequest, setSelectedRequest] = useState<InOutRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);

  const itemsPerPage = 5; // 페이지당 5개 항목
  const SET_QUANTITY = 14

  useEffect(() => {
    setRequests(mockInOutRequests)
  }, [])

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleApprove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "approved" } : r)))
    showNotification("요청이 승인되었습니다.", "success")
  }

  const handleReject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)))
    showNotification("요청이 거절되었습니다.", "error")
  }
  
  const handleRowClick = (request: InOutRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  }

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const completedRequests = requests.filter((req) => req.status !== "pending")

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }
  
  const getDisplayQuantity = (quantity: number) => {
    if (displayUnit === 'set') {
      return `${Math.floor(quantity / SET_QUANTITY)} set`;
    }
    return `${quantity} 개`;
  }

  const RequestTable = ({ 
    title, 
    requestList,
    currentPage,
    onPageChange
  }: { 
    title: string, 
    requestList: InOutRequest[],
    currentPage: number,
    onPageChange: (page: number) => void
  }) => {
    const totalPages = Math.ceil(requestList.length / itemsPerPage);
    const paginatedList = requestList.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title} ({requestList.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {requestList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">해당하는 요청이 없습니다.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center table-fixed">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 font-semibold w-[8%]">유형</th>
                      <th className="p-3 font-semibold text-left w-[20%]">상품명</th>
                      <th className="p-3 font-semibold text-left w-[15%]">규격</th>
                      <th className="p-3 font-semibold w-[7%]">수량</th>
                      <th className="p-3 font-semibold w-[12%]">
                        <div style={{ transform: 'translateY(-11.5px)' }}>
                          <p 
                            className="text-xs text-gray-500 font-normal mb-1"
                            style={{ visibility: displayUnit === 'set' ? 'visible' : 'hidden' }}
                          >
                            (1 set = {SET_QUANTITY}개)
                          </p>
                          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                            <span>주문수량</span>
                            <Select value={displayUnit} onValueChange={(value: DisplayUnit) => setDisplayUnit(value)}>
                              <SelectTrigger className="w-20 h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="set">Set</SelectItem>
                                <SelectItem value="개수">개수</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </th>
                      <th className="p-3 font-semibold text-left w-[15%]">거래처</th>
                      <th className="p-3 font-semibold w-[15%]">예정일시</th>
                      <th className="p-3 font-semibold w-[8%]">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(request)}>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ request.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800" }`}>
                            {request.type === "inbound" ? "입고" : "출고"}
                          </span>
                        </td>
                        <td className="p-3 text-left truncate">
                          <p className="font-medium">{request.itemName}</p>
                          <p className="text-xs text-gray-500">SKU: {request.itemCode}</p>
                        </td>
                        <td className="p-3 text-left truncate">{request.specification}</td>
                        <td className="p-3">{request.quantity}</td>
                        <td className="p-3">{getDisplayQuantity(request.quantity)}</td>
                        <td className="p-3 text-left truncate">
                          <p className="font-medium">{request.companyName}</p>
                          <p className="text-xs text-gray-500">코드: {request.companyCode}</p>
                        </td>
                        <td className="p-3">{formatDateTime(request.scheduledDateTime)}</td>
                        <td className="p-3">
                          {request.status === 'pending' ? (
                            <div className="flex gap-2 justify-center">
                              <Button onClick={(e) => handleApprove(e, request.id)} size="sm" className="bg-green-600 hover:bg-green-700">
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button onClick={(e) => handleReject(e, request.id)} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ request.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800" }`}>
                              {request.status === "approved" ? "승인됨" : "거절됨"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    총 {requestList.length}개 중 {paginatedList.length}개 표시
                  </div>
                  <CustomPagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">입출고 요청</h2>
        <div className="text-sm text-gray-600">앱에서 요청된 입출고 건을 승인/거절할 수 있습니다.</div>
      </div>

      <div className="grid gap-6">
        <RequestTable 
          title="승인 대기 중인 요청" 
          requestList={pendingRequests} 
          currentPage={pendingCurrentPage}
          onPageChange={setPendingCurrentPage}
        />
        <RequestTable 
          title="처리 완료된 요청" 
          requestList={completedRequests} 
          currentPage={completedCurrentPage}
          onPageChange={setCompletedCurrentPage}
        />
      </div>

      {isModalOpen && selectedRequest && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>요청 상세 정보</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p className="text-gray-500">요청 ID</p><p>{selectedRequest.id}</p>
              <p className="text-gray-500">유형</p><p>{selectedRequest.type === 'inbound' ? '입고' : '출고'}</p>
              <p className="text-gray-500">상품명</p><p>{selectedRequest.itemName}</p>
              <p className="text-gray-500">SKU</p><p>{selectedRequest.itemCode}</p>
              <p className="text-gray-500">규격</p><p>{selectedRequest.specification}</p>
              <p className="text-gray-500">수량</p><p>{selectedRequest.quantity}</p>
              <p className="text-gray-500">거래처</p><p>{selectedRequest.companyName} ({selectedRequest.companyCode})</p>
              <p className="text-gray-500">예정일시</p><p>{formatDateTime(selectedRequest.scheduledDateTime)}</p>
              <p className="text-gray-500">상태</p><p>{selectedRequest.status}</p>
              <p className="text-gray-500 col-span-2">비고</p>
              <p className="col-span-2 whitespace-pre-wrap">{selectedRequest.notes || "-"}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-gray-800 font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}