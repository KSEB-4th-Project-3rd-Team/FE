"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
// import { itemService, type Item } from "@/lib/item" // Removed for Spring backend integration"

// Temporary Item type until API is connected
export type Item = {
  id: string
  code: string
  name: string
  group: string
  specification: string
  barcode: string
  inboundPrice: number
  outboundPrice: number
}

// Mock item data
const mockItems: Item[] = []

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    group: "",
    specification: "",
    barcode: "",
    inboundPrice: 0,
    outboundPrice: 0,
  })

  // 검색 필터 상태 변경
  const [searchFilters, setSearchFilters] = useState({
    code: "",
    name: "",
    group: "",
    specification: "",
    barcode: "",
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    // const allItems = itemService.getItems() // Removed for Spring backend integration
    setItems(mockItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingItem) {
      // itemService.updateItem(editingItem.id, formData) // Removed for Spring backend integration
      setItems(items.map((i) => (i.id === editingItem.id ? { ...formData, id: i.id } : i)))
    } else {
      // itemService.addItem(formData) // Removed for Spring backend integration
      setItems([...items, { ...formData, id: (items.length + 1).toString() }])
    }

    loadItems()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      group: "",
      specification: "",
      barcode: "",
      inboundPrice: 0,
      outboundPrice: 0,
    })
    setEditingItem(null)
    setIsModalOpen(false)
  }

  const handleEdit = (item: Item) => {
    setFormData({
      code: item.code,
      name: item.name,
      group: item.group,
      specification: item.specification,
      barcode: item.barcode,
      inboundPrice: item.inboundPrice,
      outboundPrice: item.outboundPrice,
    })
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("이 품목을 삭제하시겠습니까?")) {
      // itemService.deleteItem(id) // Removed for Spring backend integration
      setItems(items.filter((i) => i.id !== id))
      loadItems()
    }
  }

  // 검색 필터링 로직 수정
  const filteredItems = items.filter((item) => {
    const codeMatch = item.code.toLowerCase().includes(searchFilters.code.toLowerCase())
    const nameMatch = item.name.toLowerCase().includes(searchFilters.name.toLowerCase())
    const groupMatch = item.group.toLowerCase().includes(searchFilters.group.toLowerCase())
    const specificationMatch = item.specification.toLowerCase().includes(searchFilters.specification.toLowerCase())
    const barcodeMatch = item.barcode.toLowerCase().includes(searchFilters.barcode.toLowerCase())

    return codeMatch && nameMatch && groupMatch && specificationMatch && barcodeMatch
  })

  const [showSearchFilters, setShowSearchFilters] = useState(false)

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">품목 관리</h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          품목 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>품목 목록</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSearchFilters(!showSearchFilters)}>
                <Search className="w-4 h-4 text-gray-400" /> 검색 필터
              </Button>
            </div>
          </div>
          {showSearchFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <div>
                <Label htmlFor="code-filter" className="text-sm font-medium">
                  품목코드
                </Label>
                <Input
                  id="code-filter"
                  placeholder="코드 검색..."
                  value={searchFilters.code}
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, code: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="name-filter" className="text-sm font-medium">
                  품목명
                </Label>
                <Input
                  id="name-filter"
                  placeholder="품목명 검색..."
                  value={searchFilters.name}
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="group-filter" className="text-sm font-medium">
                  품목그룹
                </Label>
                <Input
                  id="group-filter"
                  placeholder="그룹 검색..."
                  value={searchFilters.group}
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, group: e.target.value }))}
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
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, specification: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="barcode-filter" className="text-sm font-medium">
                  바코드
                </Label>
                <Input
                  id="barcode-filter"
                  placeholder="바코드 검색..."
                  value={searchFilters.barcode}
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, barcode: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">품목코드</th>
                  <th className="text-left p-3 font-semibold">품목명</th>
                  <th className="text-left p-3 font-semibold">품목그룹</th>
                  <th className="text-left p-3 font-semibold">규격</th>
                  <th className="text-left p-3 font-semibold">바코드</th>
                  <th className="text-right p-3 font-semibold">입고단가</th>
                  <th className="text-right p-3 font-semibold">출고단가</th>
                  <th className="text-center p-3 font-semibold">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.code}</td>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">{item.group}</td>
                    <td className="p-3">{item.specification}</td>
                    <td className="p-3">{item.barcode}</td>
                    <td className="p-3 text-right">{item.inboundPrice.toLocaleString()}원</td>
                    <td className="p-3 text-right">{item.outboundPrice.toLocaleString()}원</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">등록된 품목이 없습니다.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 품목 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editingItem ? "품목 수정" : "품목 등록"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">품목코드 *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="품목코드를 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">품목명 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="품목명을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="group">품목그룹</Label>
                  <Input
                    id="group"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    placeholder="품목그룹을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="specification">규격</Label>
                  <Input
                    id="specification"
                    value={formData.specification}
                    onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                    placeholder="규격을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="barcode">바코드</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="바코드를 입력하세요"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inboundPrice">입고단가</Label>
                    <Input
                      id="inboundPrice"
                      type="number"
                      value={formData.inboundPrice}
                      onChange={(e) => setFormData({ ...formData, inboundPrice: Number(e.target.value) })}
                      placeholder="입고단가"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outboundPrice">출고단가</Label>
                    <Input
                      id="outboundPrice"
                      type="number"
                      value={formData.outboundPrice}
                      onChange={(e) => setFormData({ ...formData, outboundPrice: Number(e.target.value) })}
                      placeholder="출고단가"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingItem ? "수정" : "등록"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
