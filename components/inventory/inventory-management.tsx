"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter, BarChart3, TrendingUp, TrendingDown } from "lucide-react"
import { CustomPagination } from "@/components/ui/custom-pagination"
import { InventoryItem } from "@/components/utils"

type DisplayUnit = "개수" | "set"

export default function InventoryManagement({ data }: { data: InventoryItem[] }) {
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    specification: "",
    location: "",
    status: "",
  })
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>("개수")
  const itemsPerPage = 10
  const SET_QUANTITY = 14

  // 재고 데이터
const inventoryData: InventoryItem[] = data;

  const handleFilterChange = (field: string, value: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
    setCurrentPage(1)
  }

  // 검색 필터링 로직
  const filteredInventory = inventoryData.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(searchFilters.name.toLowerCase())
    const specificationMatch = item.specification.toLowerCase().includes(searchFilters.specification.toLowerCase())
    const locationMatch = item.location.toLowerCase().includes(searchFilters.location.toLowerCase())
    const statusMatch = item.status.toLowerCase().includes(searchFilters.status.toLowerCase())

    return nameMatch && specificationMatch && locationMatch && statusMatch
  })

  // 페이지네이션
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredInventory.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getDisplayQuantity = (quantity: number) => {
    if (displayUnit === 'set') {
      return Math.floor(quantity / SET_QUANTITY);
    }
    return quantity;
  }

  // 통계 데이터 계산 (Memoization)
  const { totalInventory, totalInboundScheduled, totalOutboundScheduled, lowStockItems } = useMemo(() => {
    const totalInventory = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalInboundScheduled = filteredInventory.reduce((sum, item) => sum + item.inboundScheduled, 0);
    const totalOutboundScheduled = filteredInventory.reduce((sum, item) => sum + item.outboundScheduled, 0);
    const lowStockItems = filteredInventory.filter(item => item.status === '부족' || item.status === '위험').length;
    return { totalInventory, totalInboundScheduled, totalOutboundScheduled, lowStockItems };
  }, [filteredInventory]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">재고 현황</h2>
      <div className="grid gap-4">
        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 재고</p>
                  <p className="text-2xl font-bold">{totalInventory.toLocaleString()}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">입고 대기</p>
                  <p className="text-2xl font-bold text-green-600">{totalInboundScheduled.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">출고 예정</p>
                  <p className="text-2xl font-bold text-red-600">{totalOutboundScheduled.toLocaleString()}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">부족 재고</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 재고 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                재고 목록
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSearchFilters(!showSearchFilters)}
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
            {showSearchFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label htmlFor="name-filter" className="text-sm font-medium">
                    상품명
                  </Label>
                  <Input
                    id="name-filter"
                    placeholder="상품명 검색..."
                    value={searchFilters.name}
                    onChange={(e) => handleFilterChange("name", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="specification-filter" className="text-sm font-medium">
                    규격
                  </Label>
                  <Input
                    id="specification-filter"
                    placeholder="규격 검색..."
                    value={searchFilters.specification}
                    onChange={(e) => handleFilterChange("specification", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location-filter" className="text-sm font-medium">
                    위치
                  </Label>
                  <Input
                    id="location-filter"
                    placeholder="위치 검색..."
                    value={searchFilters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status-filter" className="text-sm font-medium">
                    상태
                  </Label>
                  <select
                    id="status-filter"
                    value={searchFilters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">전체</option>
                    <option value="정상">정상</option>
                    <option value="부족">부족</option>
                    <option value="위험">위험</option>
                  </select>
                </div>
              </div>
            )}

            {/* 필터 상태 및 초기화 버튼 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {Object.values(searchFilters).some((filter) => filter !== "") && (
                  <span className="inline-flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    필터 적용됨 -
                  </span>
                )}{" "}
                총 {filteredInventory.length}개 항목
              </div>
              {Object.values(searchFilters).some((filter) => filter !== "") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchFilters({
                      name: "",
                      specification: "",
                      location: "",
                      status: "",
                    })
                    setCurrentPage(1)
                  }}
                  className="text-gray-600"
                >
                  필터 초기화
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px] table-fixed">
                <thead>
                  <tr className="border-b">
                    <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-2 w-[5%]">No</th>
                    <th className="text-left p-2 md:p-3 font-semibold align-bottom pb-2 w-[25%]">상품명</th>
                    <th className="text-left p-2 md:p-3 font-semibold align-bottom pb-2 w-[12%]">규격</th>
                    <th className="text-center p-2 md:p-3 font-semibold align-bottom w-[12%]">
                      <div className="flex flex-col items-center justify-end" style={{ height: '3.5rem' }}>
                        <p className={`text-xs text-gray-500 font-normal whitespace-nowrap ${displayUnit === 'set' ? 'visible' : 'invisible'}`}>
                          (1 set = {SET_QUANTITY}개)
                        </p>
                        <Select value={displayUnit} onValueChange={(value: DisplayUnit) => setDisplayUnit(value)}>
                          <SelectTrigger className="w-20 h-7 text-xs mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="set">Set</SelectItem>
                            <SelectItem value="개수">개수</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </th>
                    <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-2 w-[8%]">현재수량</th>
                    <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-2 w-[8%]">입고예정</th>
                    <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-2 w-[8%]">출고예정</th>
                    <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-2 w-[8%]">구역</th>
                    <th className="text-center p-2 md:p-3 font-semibold align-bottom pb-2 w-[8%]">상태</th>
                    <th className="text-left p-2 md:p-3 font-semibold align-bottom pb-2 w-[12%]">마지막 업데이트</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 md:p-3 text-center text-sm text-gray-600">{startIndex + index + 1}</td>
                      <td className="p-2 md:p-3 truncate">
                        <div>
                          <p className="font-medium text-sm break-words">{item.name}</p>
                          <p className="text-xs text-gray-500 break-all">SKU: {item.sku}</p>
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-sm truncate">{item.specification}</td>
                      <td className="p-2 md:p-3 text-center">
                        {/* Empty cell for the dropdown header */}
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <span className="font-semibold">
                          {getDisplayQuantity(item.quantity)}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-center text-sm text-blue-600">
                        {item.inboundScheduled > 0 ? getDisplayQuantity(item.inboundScheduled) : "-"}
                      </td>
                      <td className="p-2 md:p-3 text-center text-sm text-red-600">
                        {item.outboundScheduled > 0 ? getDisplayQuantity(item.outboundScheduled) : "-"}
                      </td>
                      <td className="p-2 md:p-3 text-center text-sm">{item.location}</td>
                      <td className="p-2 md:p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                            item.status === "정상"
                              ? "bg-green-100 text-green-800"
                              : item.status === "부족"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-gray-600 text-xs break-words truncate">{item.lastUpdate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 검색 결과가 없을 때 */}
            {filteredInventory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
              </div>
            )}

            {/* 페이지네이션 */}
            {filteredInventory.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 flex-shrink-0">
                  총 {filteredInventory.length}개 중 {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, filteredInventory.length)}개 표시
                </div>
                <CustomPagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
