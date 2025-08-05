"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Trash2 } from "lucide-react"

import { createItem, updateItem, deleteItem } from "@/lib/api"
import { CustomPagination } from "@/components/ui/custom-pagination"

import { useRouter } from "next/navigation"

export type Item = {
  itemId: number;
  itemCode: string;
  itemName: string;
  itemGroup: string;
  spec: string;
  unit: string;
  unitPriceIn: number;
  unitPriceOut: number;
  createdAt?: string; // 선택적 필드로 추가
};

interface ItemListProps {
  initialItems: Item[];
}

export default function ItemList({ initialItems }: ItemListProps) {
  const [items, setItems] = useState(initialItems);
  const router = useRouter();

  const reloadItems = () => {
    router.refresh();
  };
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [searchFilters, setSearchFilters] = useState({
    itemCode: "", itemName: "", itemGroup: "", spec: "",
  })
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [formData, setFormData] = useState<Omit<Item, 'itemId'> & { itemId?: number }> ({
    itemCode: "", itemName: "", itemGroup: "", spec: "", unit: "", unitPriceIn: 0, unitPriceOut: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Submitting item data:", { editingItem, formData })
      if (editingItem) {
        console.log("Updating item ID:", editingItem.itemId)
        const result = await updateItem(editingItem.itemId.toString(), formData);
        console.log("Update result:", result)
      } else {
        const result = await createItem(formData);
        console.log("Create result:", result)
      }
      reloadItems();
      resetForm();
    } catch (error) {
      console.error("Failed to save item:", error);
      alert(`품목 저장 실패: ${error}`)
    }
  }

  const resetForm = () => {
    setFormData({ itemCode: "", itemName: "", itemGroup: "", spec: "", unit: "", unitPriceIn: 0, unitPriceOut: 0 })
    setEditingItem(null)
    setIsModalOpen(false)
  }

  const handleRowClick = (item: Item) => {
    setFormData({ 
      ...item,
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      itemGroup: item.itemGroup || "",
      spec: item.spec || "",
      unit: item.unit || "",
    });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    console.log("Deleting item with ID:", id, "Type:", typeof id);
    if (confirm("이 품목을 삭제하시겠습니까?")) {
      try {
        await deleteItem(id.toString());
        reloadItems();
      } catch (error) {
        console.error("Failed to delete item:", error);
        alert(`품목 삭제 실패: ${error}`)
      }
    }
  }

  const filteredItems = items.filter((item) => {
    const itemCode = item.itemCode || "";
    const itemName = item.itemName || "";
    const itemGroup = item.itemGroup || "";
    const itemSpecification = item.spec || "";

    return (
      itemCode.toLowerCase().includes(searchFilters.itemCode.toLowerCase()) &&
      itemName.toLowerCase().includes(searchFilters.itemName.toLowerCase()) &&
      itemGroup.toLowerCase().includes(searchFilters.itemGroup.toLowerCase()) &&
      itemSpecification.toLowerCase().includes(searchFilters.spec.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">품목 관리</h2>
        <Button onClick={() => { setEditingItem(null); setFormData({ itemCode: "", itemName: "", itemGroup: "", spec: "", unit: "", unitPriceIn: 0, unitPriceOut: 0 }); setIsModalOpen(true); }} className="flex items-center gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <Input placeholder="품목코드" value={searchFilters.itemCode} onChange={(e) => setSearchFilters(prev => ({ ...prev, itemCode: e.target.value }))} />
              <Input placeholder="품목명" value={searchFilters.itemName} onChange={(e) => setSearchFilters(prev => ({ ...prev, itemName: e.target.value }))} />
              <Input placeholder="품목그룹" value={searchFilters.itemGroup} onChange={(e) => setSearchFilters(prev => ({ ...prev, itemGroup: e.target.value }))} />
              <Input placeholder="규격" value={searchFilters.spec} onChange={(e) => setSearchFilters(prev => ({ ...prev, spec: e.target.value }))} />
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
                  <th className="text-left p-3 font-semibold">단위</th>
                  <th className="text-right p-3 font-semibold">입고단가</th>
                  <th className="text-right p-3 font-semibold">출고단가</th>
                  <th className="text-center p-3 font-semibold">삭제</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, index) => (
                  <tr key={item.itemId || `item-${index}`} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(item)}>
                    <td className="p-3">{item.itemCode}</td>
                    <td className="p-3 font-medium">{item.itemName}</td>
                    <td className="p-3">{item.itemGroup}</td>
                    <td className="p-3">{item.spec}</td>
                    <td className="p-3">{item.unit}</td>
                    <td className="p-3 text-right">{(item.unitPriceIn || 0).toLocaleString()}원</td>
                    <td className="p-3 text-right">{(item.unitPriceOut || 0).toLocaleString()}원</td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={(e) => handleDelete(e, item.itemId)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {Object.values(searchFilters).some(val => val !== "") ? (
                  <>
                    <p>검색 결과가 없습니다.</p>
                    <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
                  </>
                ) : (
                  <>
                    <p>등록된 품목이 없습니다.</p>
                    <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      첫 품목 등록하기
                    </Button>
                  </>
                )}
              </div>
            ) : null}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <CustomPagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
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
                    <Label htmlFor="itemCode">품목코드 *</Label>
                    <Input id="itemCode" name="itemCode" value={formData.itemCode} onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="itemName">품목명 *</Label>
                    <Input id="itemName" name="itemName" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="itemGroup">품목그룹</Label>
                    <Input id="itemGroup" name="itemGroup" value={formData.itemGroup} onChange={(e) => setFormData({ ...formData, itemGroup: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="spec">규격</Label>
                    <Input id="spec" name="spec" value={formData.spec} onChange={(e) => setFormData({ ...formData, spec: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="unit">단위</Label>
                    <Input id="unit" name="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="unitPriceIn">입고단가</Label>
                    <Input id="unitPriceIn" name="unitPriceIn" type="number" value={formData.unitPriceIn} onChange={(e) => setFormData({ ...formData, unitPriceIn: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="unitPriceOut">출고단가</Label>
                    <Input id="unitPriceOut" name="unitPriceOut" type="number" value={formData.unitPriceOut} onChange={(e) => setFormData({ ...formData, unitPriceOut: Number(e.target.value) })} />
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