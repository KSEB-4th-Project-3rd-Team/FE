"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Filter, Package, TruckIcon, BarChart3, X } from "lucide-react"

export default function InOutHistory() {
  const [historyFilters, setHistoryFilters] = useState({
    type: "",
    productName: "",
    location: "",
    category: "",
    company: "",
    destination: "",
    date: "",
  })
  const [showHistoryFilters, setShowHistoryFilters] = useState(false)
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [registrationItems, setRegistrationItems] = useState<any[]>([])
  const itemsPerPage = 10

  // 더미 입출고 내역 데이터
  interface InOutHistoryItem {
  id: number;
  type: "inbound" | "outbound";
  productName: string;
  sku: string;
  category: string;
  quantity: number;
  location: string;
  company: string;
  status: string;
  date: string;
  time: string;
  destination: string;
  notes: string;
}

const historyData: InOutHistoryItem[] = [];

  const handleHistoryFilterChange = (field: string, value: string) => {
    setHistoryFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHistoryCurrentPage(1)
  }

  // 입출고 내역 필터링
  const filteredHistory = historyData.filter((item) => {
    const typeMatch = historyFilters.type === "" || item.type === historyFilters.type
    const productNameMatch = item.productName.toLowerCase().includes(historyFilters.productName.toLowerCase())
    const locationMatch = item.location.toLowerCase().includes(historyFilters.location.toLowerCase())
    const categoryMatch = item.category.toLowerCase().includes(historyFilters.category.toLowerCase())
    const companyMatch = item.company.toLowerCase().includes(historyFilters.company.toLowerCase())
    const destinationMatch = item.destination.toLowerCase().includes(historyFilters.destination.toLowerCase())

    let dateMatch = true
    if (historyFilters.date) {
      dateMatch = item.date === historyFilters.date
    }

    return (
      typeMatch && productNameMatch && locationMatch && categoryMatch && companyMatch && destinationMatch && dateMatch
    )
  })

  // 페이지네이션
  const historyTotalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const historyStartIndex = (historyCurrentPage - 1) * itemsPerPage
  const historyCurrentItems = filteredHistory.slice(historyStartIndex, historyStartIndex + itemsPerPage)

  const handleHistoryPageChange = (page: number) => {
    setHistoryCurrentPage(page)
  }

  // 등록 모달 관련 함수들
  const addRegistrationItem = () => {
    const newItem = {
      id: registrationItems.length + 1,
      type: "inbound",
      productName: "",
      category: "",
      quantity: "",
      location: "창고1",
      company: "",
      destination: "",
      notes: "",
    }
    setRegistrationItems([...registrationItems, newItem])
  }

  const removeRegistrationItem = (id: number) => {
    if (registrationItems.length > 1) {
      setRegistrationItems(registrationItems.filter((item) => item.id !== id))
    }
  }

  const updateRegistrationItem = (id: number, field: string, value: string) => {
    setRegistrationItems(registrationItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleRegistrationSubmit = () => {
    // 등록 로직 처리
    console.log("등록할 항목들:", registrationItems)
    setIsRegistrationModalOpen(false)
    setRegistrationItems([])
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">입출고 내역</h2>
        <Button onClick={() => setIsRegistrationModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          입출고 등록
        </Button>
      </div>
      <div className="grid gap-6">
        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">오늘 입고</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-xs text-green-600">0% 전일대비</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">오늘 출고</p>
                  <p className="text-2xl font-bold text-red-600">0</p>
                  <p className="text-xs text-red-600">0% 전일대비</p>
                </div>
                <TruckIcon className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">이번 주 총량</p>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-green-600">0% 전주대비</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상세 내역 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                전체 입출고 내역
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowHistoryFilters(!showHistoryFilters)}
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  검색
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 검색 필터 */}
            {showHistoryFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label htmlFor="type-filter" className="text-sm font-medium">
                    유형
                  </Label>
                  <select
                    id="type-filter"
                    value={historyFilters.type}
                    onChange={(e) => handleHistoryFilterChange("type", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">전체</option>
                    <option value="inbound">입고</option>
                    <option value="outbound">출고</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="product-filter" className="text-sm font-medium">
                    상품명
                  </Label>
                  <Input
                    id="product-filter"
                    placeholder="상품명 검색..."
                    value={historyFilters.productName}
                    onChange={(e) => handleHistoryFilterChange("productName", e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="category-filter" className="text-sm font-medium">
                    카테고리
                  </Label>
                  <Input
                    id="category-filter"
                    placeholder="카테고리 검색..."
                    value={historyFilters.category}
                    onChange={(e) => handleHistoryFilterChange("category", e.target.value)}
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
                    value={historyFilters.location}
                    onChange={(e) => handleHistoryFilterChange("location", e.target.value)}
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
                    value={historyFilters.company}
                    onChange={(e) => handleHistoryFilterChange("company", e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="destination-filter" className="text-sm font-medium">
                    목적지
                  </Label>
                  <Input
                    id="destination-filter"
                    placeholder="목적지 검색..."
                    value={historyFilters.destination}
                    onChange={(e) => handleHistoryFilterChange("destination", e.target.value)}
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
                    value={historyFilters.date}
                    onChange={(e) => handleHistoryFilterChange("date", e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setHistoryFilters({
                        type: "",
                        productName: "",
                        location: "",
                        category: "",
                        company: "",
                        destination: "",
                        date: "",
                      })
                      setHistoryCurrentPage(1)
                    }}
                    className="mt-6 text-gray-600"
                  >
                    필터 초기화
                  </Button>
                </div>
              </div>
            )}

            {/* 필터 상태 및 초기화 버튼 */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {Object.values(historyFilters).some((filter) => filter !== "") && (
                  <span className="inline-flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    필터 적용됨 -
                  </span>
                )}{" "}
                총 {filteredHistory.length}개 항목
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 md:p-3 font-semibold min-w-[60px]">유형</th>
                    <th className="text-left p-2 md:p-3 font-semibold min-w-[200px]">상품명</th>
                    <th className="text-left p-2 md:p-3 font-semibold min-w-[80px]">카테고리</th>
                    <th className="text-center p-2 md:p-3 font-semibold min-w-[60px]">수량</th>
                    <th className="text-center p-2 md:p-3 font-semibold min-w-[80px]">위치</th>
                    <th className="text-left p-2 md:p-3 font-semibold min-w-[100px]">거래처</th>
                    <th className="text-left p-2 md:p-3 font-semibold min-w-[100px]">목적지</th>
                    <th className="text-center p-2 md:p-3 font-semibold min-w-[100px]">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {historyCurrentItems.map((item) => (
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
                        <div>
                          <p className="font-medium text-sm break-words">{item.productName}</p>
                          <p className="text-xs text-gray-500 break-all">SKU: {item.sku}</p>
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-sm">{item.category}</td>
                      <td className="p-2 md:p-3 text-center">
                        <span className="font-semibold">{item.quantity}</span>
                      </td>
                      <td className="p-2 md:p-3 text-center text-sm">{item.location}</td>
                      <td className="p-2 md:p-3 text-sm">{item.company}</td>
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

            {/* 검색 결과가 없을 때 */}
            {filteredHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
              </div>
            )}

            {/* 페이지네이션 */}
            {filteredHistory.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 flex-shrink-0">
                  총 {filteredHistory.length}개 중 {historyStartIndex + 1}-
                  {Math.min(historyStartIndex + itemsPerPage, filteredHistory.length)}개 표시
                </div>
                <div className="flex gap-1 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyCurrentPage === 1}
                    onClick={() => handleHistoryPageChange(historyCurrentPage - 1)}
                    className="px-3"
                  >
                    이전
                  </Button>
                  {Array.from({ length: Math.min(historyTotalPages, 5) }, (_, i) => {
                    let page: number
                    if (historyTotalPages <= 5) {
                      page = i + 1
                    } else if (historyCurrentPage <= 3) {
                      page = i + 1
                    } else if (historyCurrentPage >= historyTotalPages - 2) {
                      page = historyTotalPages - 4 + i
                    } else {
                      page = historyCurrentPage - 2 + i
                    }
                    return (
                      <Button
                        key={page}
                        variant="outline"
                        size="sm"
                        className={`px-3 ${historyCurrentPage === page ? "bg-blue-50 text-blue-600" : ""}`}
                        onClick={() => handleHistoryPageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyCurrentPage === historyTotalPages}
                    onClick={() => handleHistoryPageChange(historyCurrentPage + 1)}
                    className="px-3"
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 입출고 등록 모달 */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>입출고 등록</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsRegistrationModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {registrationItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">항목 {index + 1}</h4>
                      {registrationItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRegistrationItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`type-${item.id}`}>유형 *</Label>
                        <select
                          id={`type-${item.id}`}
                          value={item.type}
                          onChange={(e) => updateRegistrationItem(item.id, "type", e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="inbound">입고</option>
                          <option value="outbound">출고</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor={`productName-${item.id}`}>상품명 *</Label>
                        <Input
                          id={`productName-${item.id}`}
                          value={item.productName}
                          onChange={(e) => updateRegistrationItem(item.id, "productName", e.target.value)}
                          placeholder="상품명을 입력하세요"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`category-${item.id}`}>카테고리</Label>
                        <Input
                          id={`category-${item.id}`}
                          value={item.category}
                          onChange={(e) => updateRegistrationItem(item.id, "category", e.target.value)}
                          placeholder="카테고리를 입력하세요"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`quantity-${item.id}`}>수량 *</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateRegistrationItem(item.id, "quantity", e.target.value)}
                          placeholder="수량을 입력하세요"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`location-${item.id}`}>위치 *</Label>
                        <select
                          id={`location-${item.id}`}
                          value={item.location}
                          onChange={(e) => updateRegistrationItem(item.id, "location", e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="창고1">창고1</option>
                          <option value="창고2">창고2</option>
                          <option value="창고3">창고3</option>
                          <option value="창고4">창고4</option>
                          <option value="창고5">창고5</option>
                          <option value="창고6">창고6</option>
                          <option value="창고7">창고7</option>
                          <option value="창고8">창고8</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor={`company-${item.id}`}>거래처</Label>
                        <Input
                          id={`company-${item.id}`}
                          value={item.company}
                          onChange={(e) => updateRegistrationItem(item.id, "company", e.target.value)}
                          placeholder="거래처를 입력하세요"
                        />
                      </div>

                      {item.type === "outbound" && (
                        <div>
                          <Label htmlFor={`destination-${item.id}`}>목적지</Label>
                          <Input
                            id={`destination-${item.id}`}
                            value={item.destination}
                            onChange={(e) => updateRegistrationItem(item.id, "destination", e.target.value)}
                            placeholder="목적지를 입력하세요"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Label htmlFor={`notes-${item.id}`}>비고</Label>
                      <Textarea
                        id={`notes-${item.id}`}
                        value={item.notes}
                        onChange={(e) => updateRegistrationItem(item.id, "notes", e.target.value)}
                        placeholder="추가 정보를 입력하세요"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={addRegistrationItem}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Plus className="w-4 h-4" />
                    항목 추가
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-6 border-t mt-6">
                <Button onClick={handleRegistrationSubmit} className="flex-1">
                  등록 완료
                </Button>
                <Button variant="outline" onClick={() => setIsRegistrationModalOpen(false)} className="flex-1">
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
