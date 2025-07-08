"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Package, TruckIcon, Search } from "lucide-react"
import { inoutRequestService, type InOutRequest } from "@/lib/inout-request"

export default function InOutRequestPage() {
  const [requests, setRequests] = useState<InOutRequest[]>([])
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // 검색 필터 상태
  const [pendingFilters, setPendingFilters] = useState({
    type: "",
    itemName: "",
    category: "",
    companyName: "",
    date: "",
  })
  const [completedFilters, setCompletedFilters] = useState({
    type: "",
    itemName: "",
    category: "",
    companyName: "",
    date: "",
  })
  const [showPendingFilters, setShowPendingFilters] = useState(false)
  const [showCompletedFilters, setShowCompletedFilters] = useState(false)

  useEffect(() => {
    loadRequests()
    simulateAppRequests()
  }, [])

  const loadRequests = () => {
    const allRequests = inoutRequestService.getRequests()
    setRequests(allRequests)
  }

  const simulateAppRequests = () => {
    const dummyRequests = [
      {
        type: "inbound" as const,
        itemCode: "ITEM001",
        itemName: "노트북 - ThinkPad X1",
        quantity: 50,
        companyCode: "COMP001",
        companyName: "삼성전자",
        requestDate: new Date().toISOString().split("T")[0],
        notes: "앱에서 요청된 입고",
        status: "pending" as const,
      },
      {
        type: "outbound" as const,
        itemCode: "ITEM002",
        itemName: "무선 마우스",
        quantity: 30,
        companyCode: "COMP002",
        companyName: "LG전자",
        requestDate: new Date().toISOString().split("T")[0],
        notes: "앱에서 요청된 출고",
        status: "pending" as const,
      },
      {
        type: "inbound" as const,
        itemCode: "ITEM003",
        itemName: "기계식 키보드",
        quantity: 25,
        companyCode: "COMP003",
        companyName: "로지텍",
        requestDate: "2024-01-14",
        notes: "정기 입고",
        status: "approved" as const,
      },
      {
        type: "outbound" as const,
        itemCode: "ITEM004",
        itemName: "모니터 - 27인치",
        quantity: 15,
        companyCode: "COMP004",
        companyName: "델",
        requestDate: "2024-01-13",
        notes: "긴급 출고",
        status: "rejected" as const,
      },
    ]

    const existingRequests = inoutRequestService.getRequests()
    if (existingRequests.length === 0) {
      dummyRequests.forEach((request) => {
        inoutRequestService.addRequest(request)
      })
      loadRequests()
    }
  }

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleApprove = (id: string) => {
    inoutRequestService.updateRequestStatus(id, "approved")
    loadRequests()
    showNotification("요청이 승인되었습니다.", "success")
  }

  const handleReject = (id: string) => {
    inoutRequestService.updateRequestStatus(id, "rejected")
    loadRequests()
    showNotification("요청이 거절되었습니다.", "error")
  }

  // 필터링 함수
  const filterRequests = (requestList: InOutRequest[], filters: any) => {
    return requestList.filter((request) => {
      const typeMatch = filters.type === "" || request.type === filters.type
      const itemNameMatch = request.itemName.toLowerCase().includes(filters.itemName.toLowerCase())
      const companyNameMatch = request.companyName.toLowerCase().includes(filters.companyName.toLowerCase())

      let dateMatch = true
      if (filters.date) {
        dateMatch = request.requestDate === filters.date
      }

      return typeMatch && itemNameMatch && companyNameMatch && dateMatch
    })
  }

  const pendingRequests = filterRequests(
    requests.filter((req) => req.status === "pending"),
    pendingFilters,
  )

  const completedRequests = filterRequests(
    requests.filter((req) => req.status !== "pending"),
    completedFilters,
  )

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">입출고 요청</h2>
        <div className="text-sm text-gray-600">앱에서 요청된 입출고 건을 승인/거절할 수 있습니다.</div>
      </div>

      <div className="grid gap-6">
        {/* 승인 대기 중인 요청 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                승인 대기 중인 요청 ({pendingRequests.length}건)
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowPendingFilters(!showPendingFilters)}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                검색
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 검색 필터 */}
            {showPendingFilters && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label htmlFor="pending-type-filter" className="text-sm font-medium">
                    유형
                  </Label>
                  <select
                    id="pending-type-filter"
                    value={pendingFilters.type}
                    onChange={(e) => setPendingFilters((prev) => ({ ...prev, type: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">전체</option>
                    <option value="inbound">입고</option>
                    <option value="outbound">출고</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="pending-item-filter" className="text-sm font-medium">
                    상품명
                  </Label>
                  <Input
                    id="pending-item-filter"
                    placeholder="상품명 검색..."
                    value={pendingFilters.itemName}
                    onChange={(e) => setPendingFilters((prev) => ({ ...prev, itemName: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="pending-company-filter" className="text-sm font-medium">
                    거래처
                  </Label>
                  <Input
                    id="pending-company-filter"
                    placeholder="거래처 검색..."
                    value={pendingFilters.companyName}
                    onChange={(e) => setPendingFilters((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="pending-date-filter" className="text-sm font-medium">
                    날짜
                  </Label>
                  <Input
                    id="pending-date-filter"
                    type="date"
                    value={pendingFilters.date}
                    onChange={(e) => setPendingFilters((prev) => ({ ...prev, date: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPendingFilters({
                        type: "",
                        itemName: "",
                        category: "",
                        companyName: "",
                        date: "",
                      })
                    }
                    className="mt-6 text-gray-600"
                  >
                    필터 초기화
                  </Button>
                </div>
              </div>
            )}

            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">대기 중인 요청이 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">유형</th>
                      <th className="text-left p-3 font-semibold">상품명</th>
                      <th className="text-center p-3 font-semibold">수량</th>
                      <th className="text-left p-3 font-semibold">거래처</th>
                      <th className="text-center p-3 font-semibold">요청일</th>
                      <th className="text-left p-3 font-semibold">비고</th>
                      <th className="text-center p-3 font-semibold">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {request.type === "inbound" ? (
                              <Package className="w-4 h-4 text-blue-500" />
                            ) : (
                              <TruckIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {request.type === "inbound" ? "입고" : "출고"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{request.itemName}</p>
                            <p className="text-xs text-gray-500">코드: {request.itemCode}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-semibold">{request.quantity.toLocaleString()}개</span>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{request.companyName}</p>
                            <p className="text-xs text-gray-500">코드: {request.companyCode}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center">{request.requestDate}</td>
                        <td className="p-3 text-sm">{request.notes || "-"}</td>
                        <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={() => handleApprove(request.id)}
                              size="sm"
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                              승인
                            </Button>
                            <Button
                              onClick={() => handleReject(request.id)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                              거절
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 처리 완료된 요청 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>처리 완료된 요청 ({completedRequests.length}건)</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowCompletedFilters(!showCompletedFilters)}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                검색
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 검색 필터 */}
            {showCompletedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label htmlFor="completed-type-filter" className="text-sm font-medium">
                    유형
                  </Label>
                  <select
                    id="completed-type-filter"
                    value={completedFilters.type}
                    onChange={(e) => setCompletedFilters((prev) => ({ ...prev, type: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">전체</option>
                    <option value="inbound">입고</option>
                    <option value="outbound">출고</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="completed-item-filter" className="text-sm font-medium">
                    상품명
                  </Label>
                  <Input
                    id="completed-item-filter"
                    placeholder="상품명 검색..."
                    value={completedFilters.itemName}
                    onChange={(e) => setCompletedFilters((prev) => ({ ...prev, itemName: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="completed-company-filter" className="text-sm font-medium">
                    거래처
                  </Label>
                  <Input
                    id="completed-company-filter"
                    placeholder="거래처 검색..."
                    value={completedFilters.companyName}
                    onChange={(e) => setCompletedFilters((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="completed-date-filter" className="text-sm font-medium">
                    날짜
                  </Label>
                  <Input
                    id="completed-date-filter"
                    type="date"
                    value={completedFilters.date}
                    onChange={(e) => setCompletedFilters((prev) => ({ ...prev, date: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCompletedFilters({
                        type: "",
                        itemName: "",
                        category: "",
                        companyName: "",
                        date: "",
                      })
                    }
                    className="mt-6 text-gray-600"
                  >
                    필터 초기화
                  </Button>
                </div>
              </div>
            )}

            {completedRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">처리 완료된 요청이 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">유형</th>
                      <th className="text-left p-3 font-semibold">상품명</th>
                      <th className="text-center p-3 font-semibold">수량</th>
                      <th className="text-left p-3 font-semibold">거래처</th>
                      <th className="text-center p-3 font-semibold">요청일</th>
                      <th className="text-left p-3 font-semibold">비고</th>
                      <th className="text-center p-3 font-semibold">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {request.type === "inbound" ? (
                              <Package className="w-4 h-4 text-blue-500" />
                            ) : (
                              <TruckIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {request.type === "inbound" ? "입고" : "출고"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{request.itemName}</p>
                            <p className="text-xs text-gray-500">코드: {request.itemCode}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-semibold">{request.quantity.toLocaleString()}개</span>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{request.companyName}</p>
                            <p className="text-xs text-gray-500">코드: {request.companyCode}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center">{request.requestDate}</td>
                        <td className="p-3 text-sm">{request.notes || "-"}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status === "approved" ? "승인됨" : "거절됨"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 알림 */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 transition-all duration-300">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-gray-800 font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
