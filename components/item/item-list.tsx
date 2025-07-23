"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Trash2 } from "lucide-react"

export type Item = {
  id: string
  code: string
  name: string
  group: string
  specification: string
  barcode: string
  inboundPrice: number
  outboundPrice: number
  notes: string
}



export default function ItemList({ items, setItems }: { items: Item[], setItems: React.Dispatch<React.SetStateAction<Item[]>> }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [searchFilters, setSearchFilters] = useState({
    code: "", name: "", group: "", specification: "", barcode: "",
  })
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const [formData, setFormData] = useState({
    code: "", name: "", group: "", specification: "", barcode: "", inboundPrice: 0, outboundPrice: 0, notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      setItems(items.map((i) => (i.id === editingItem.id ? { ...formData, id: i.id } : i)))
    } else {
      setItems([...items, { ...formData, id: (items.length + 1).toString() }])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({ code: "", name: "", group: "", specification: "", barcode: "", inboundPrice: 0, outboundPrice: 0, notes: "" })
    setEditingItem(null)
    setIsModalOpen(false)
  }

  const handleRowClick = (item: Item) => {
    setFormData({ ...item });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("이 품목을 삭제하시겠습니까?")) {
      setItems(items.filter((i) => i.id !== id))
    }
  }

  const filteredItems = items.filter((item) => {
    return (
      item.code.toLowerCase().includes(searchFilters.code.toLowerCase()) &&
      item.name.toLowerCase().includes(searchFilters.name.toLowerCase()) &&
      item.group.toLowerCase().includes(searchFilters.group.toLowerCase()) &&
      item.specification.toLowerCase().includes(searchFilters.specification.toLowerCase()) &&
      item.barcode.toLowerCase().includes(searchFilters.barcode.toLowerCase())
    )
  })

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">품목 관리</h2>
        <Button onClick={() => { setEditingItem(null); setFormData({ code: "", name: "", group: "", specification: "", barcode: "", inboundPrice: 0, outboundPrice: 0, notes: "" }); setIsModalOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          품목 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>품목 목록</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowSearchFilters(!showSearchFilters)}>
              <Search className="w-4 h-4 mr-2" /> 검색
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showSearchFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <Input placeholder="품목코드" value={searchFilters.code} onChange={(e) => setSearchFilters(prev => ({ ...prev, code: e.target.value }))} />
              <Input placeholder="품목명" value={searchFilters.name} onChange={(e) => setSearchFilters(prev => ({ ...prev, name: e.target.value }))} />
              <Input placeholder="품목그룹" value={searchFilters.group} onChange={(e) => setSearchFilters(prev => ({ ...prev, group: e.target.value }))} />
              <Input placeholder="규격" value={searchFilters.specification} onChange={(e) => setSearchFilters(prev => ({ ...prev, specification: e.target.value }))} />
              <Input placeholder="바코드" value={searchFilters.barcode} onChange={(e) => setSearchFilters(prev => ({ ...prev, barcode: e.target.value }))} />
            </div>
          )}
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
                  <th className="text-center p-3 font-semibold">삭제</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(item)}>
                    <td className="p-3">{item.code}</td>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">{item.group}</td>
                    <td className="p-3">{item.specification}</td>
                    <td className="p-3">{item.barcode}</td>
                    <td className="p-3 text-right">{item.inboundPrice.toLocaleString()}원</td>
                    <td className="p-3 text-right">{item.outboundPrice.toLocaleString()}원</td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={(e) => handleDelete(e, item.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>{editingItem ? "품목 수정" : "품목 등록"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="code">품목코드 *</Label>
                    <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="name">품목명 *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="group">품목그룹</Label>
                    <Input id="group" value={formData.group} onChange={(e) => setFormData({ ...formData, group: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="specification">규격</Label>
                    <Input id="specification" value={formData.specification} onChange={(e) => setFormData({ ...formData, specification: e.target.value })} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="barcode">바코드</Label>
                    <Input id="barcode" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="inboundPrice">입고단가</Label>
                    <Input id="inboundPrice" type="number" value={formData.inboundPrice} onChange={(e) => setFormData({ ...formData, inboundPrice: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="outboundPrice">출고단가</Label>
                    <Input id="outboundPrice" type="number" value={formData.outboundPrice} onChange={(e) => setFormData({ ...formData, outboundPrice: Number(e.target.value) })} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="notes">비고</Label>
                    <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">{editingItem ? "수정" : "등록"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">취소</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}