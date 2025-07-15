"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, Search, Filter, BarChart3, TrendingUp, TrendingDown } from "lucide-react"
import { InventoryItem, mockInventoryData } from "@/components/utils"

export default function InventoryManagement() {
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    category: "",
    location: "",
    status: "",
  })
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 더미 재고 데이터
const inventoryData: InventoryItem[] = mockInventoryData;

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
    const categoryMatch = item.category.toLowerCase().includes(searchFilters.category.toLowerCase())
    const locationMatch = item.location.toLowerCase().includes(searchFilters.location.toLowerCase())
    const statusMatch = item.status.toLowerCase().includes(searchFilters.status.toLowerCase())

    return nameMatch && categoryMatch && locationMatch && statusMatch
  })

  // 페이지네이션
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredInventory.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">재고 현황</h2>
      <div className="grid gap-6">
        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 재고</p>
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold text-green-600">0</p>
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
                  <p className="text-2xl font-bold text-red-600">0</p>
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
                  <p className="text-2xl font-bold text-yellow-600">0</p>
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
                  <Label htmlFor="category-filter" className="text-sm font-medium">
                    카테고리
                  </Label>
                  <Input
                    id="category-filter"
                    placeholder="카테고리 검색..."
                    value={searchFilters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
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
            <div className="flex justify-between items-center mb-4">
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
                      category: "",
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
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 md:p-3 font-semibold min-w-[200px]">상품명</th>
                    <th className="text-left p-2 md:p-3 font-semibold min-w-[100px]">카테고리</th>
                    <th className="text-center p-2 md:p-3 font-semibold min-w-[60px]">수량</th>
                    <th className="text-center p-2 md:p-3 font-semibold min-w-[80px]">위치</th>
                    <th className="text-center p-2 md:p-3 font-semibold min-w-[60px]">상태</th>
                    <th className="text-left p-2 md:p-3 font-semibold min-w-[120px]">마지막 업데이트</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 md:p-3">
                        <div>
                          <p className="font-medium text-sm break-words">{item.name}</p>
                          <p className="text-xs text-gray-500 break-all">SKU: {item.sku}</p>
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-sm">{item.category}</td>
                      <td className="p-2 md:p-3 text-center">
                        <span className="font-semibold">{item.quantity}</span>
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
                      <td className="p-2 md:p-3 text-gray-600 text-xs break-words">{item.lastUpdate}</td>
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
      </div>
    </div>
  )
}
