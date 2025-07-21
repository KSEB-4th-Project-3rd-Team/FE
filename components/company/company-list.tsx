"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Trash2 } from "lucide-react"

export type Company = {
  id: string
  code: string
  name: string
  representative: string
  phone: string
  email: string
  address: string
  notes: string
  type: "매입처" | "납품처"
}

export const mockCompanies: Company[] = [
    { id: '1', code: 'C001', name: '삼성전자', representative: '이재용', phone: '02-111-1111', email: 'contact@samsung.com', address: '서울시 서초구', notes: '주요 파트너', type: '납품처' },
    { id: '2', code: 'C002', name: 'LG전자', representative: '구광모', phone: '02-222-2222', email: 'contact@lge.com', address: '서울시 영등포구', notes: '', type: '납품처' },
    { id: '3', code: 'C003', name: '하이닉스', representative: '곽노정', phone: '031-123-4567', email: 'contact@hynix.com', address: '경기도 이천시', notes: '반도체 공급', type: '매입처' },
];

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [searchFilters, setSearchFilters] = useState({
    code: "",
    name: "",
    representative: "",
    phone: "",
    email: "",
    type: "전체",
  })
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    representative: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    type: "납품처" as "매입처" | "납품처",
  })

  useEffect(() => {
    setCompanies(mockCompanies)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCompany) {
      setCompanies(companies.map((c) => (c.id === editingCompany.id ? { ...formData, id: c.id } : c)))
    } else {
      setCompanies([...companies, { ...formData, id: (companies.length + 1).toString() }])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      code: "", name: "", representative: "", phone: "", email: "", address: "", notes: "", type: "납품처",
    })
    setEditingCompany(null)
    setIsModalOpen(false)
  }

  const handleRowClick = (company: Company) => {
    setFormData({ ...company });
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 행 클릭 이벤트 전파 방���
    if (confirm("이 거래처를 삭제하시겠습니까?")) {
      setCompanies(companies.filter((c) => c.id !== id))
    }
  }

  const filteredCompanies = companies.filter((company) => {
    return (
      company.code.toLowerCase().includes(searchFilters.code.toLowerCase()) &&
      company.name.toLowerCase().includes(searchFilters.name.toLowerCase()) &&
      company.representative.toLowerCase().includes(searchFilters.representative.toLowerCase()) &&
      company.phone.toLowerCase().includes(searchFilters.phone.toLowerCase()) &&
      company.email.toLowerCase().includes(searchFilters.email.toLowerCase()) &&
      (searchFilters.type === "전체" || company.type === searchFilters.type)
    )
  })

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">거래처 관리</h2>
        <Button onClick={() => { setEditingCompany(null); setFormData({ code: "", name: "", representative: "", phone: "", email: "", address: "", notes: "", type: "납품처" }); setIsModalOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          거래처 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>거래처 목록</CardTitle>
            <Button variant="outline" onClick={() => setShowSearchFilters(!showSearchFilters)} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              검색
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showSearchFilters && (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <Input placeholder="거래처코드" value={searchFilters.code} onChange={(e) => setSearchFilters(prev => ({ ...prev, code: e.target.value }))} />
              <Input placeholder="거래처명" value={searchFilters.name} onChange={(e) => setSearchFilters(prev => ({ ...prev, name: e.target.value }))} />
              <Select value={searchFilters.type} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="거래처 구분" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="매입처">매입처</SelectItem>
                  <SelectItem value="납품처">납품처</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="대표자명" value={searchFilters.representative} onChange={(e) => setSearchFilters(prev => ({ ...prev, representative: e.target.value }))} />
              <Input placeholder="전화번호" value={searchFilters.phone} onChange={(e) => setSearchFilters(prev => ({ ...prev, phone: e.target.value }))} />
              <Input placeholder="Email" value={searchFilters.email} onChange={(e) => setSearchFilters(prev => ({ ...prev, email: e.target.value }))} />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">거래처코드</th>
                  <th className="text-left p-3 font-semibold">거래처명</th>
                  <th className="text-left p-3 font-semibold">거래처 구분</th>
                  <th className="text-left p-3 font-semibold">대표자명</th>
                  <th className="text-left p-3 font-semibold">전화번호</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">주소</th>
                  <th className="text-center p-3 font-semibold">삭제</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(company)}>
                    <td className="p-3">{company.code}</td>
                    <td className="p-3 font-medium">{company.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${company.type === "매입처" ? "bg-sky-100 text-sky-800" : "bg-orange-100 text-orange-800"}`}>
                        {company.type}
                      </span>
                    </td>
                    <td className="p-3">{company.representative}</td>
                    <td className="p-3">{company.phone}</td>
                    <td className="p-3">{company.email}</td>
                    <td className="p-3">{company.address}</td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={(e) => handleDelete(e, company.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCompanies.length === 0 && (
              <div className="text-center py-8 text-gray-500">등록된 거래처가 없습니다.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>{editingCompany ? "거래처 수정" : "거래처 등록"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="code">거래처코드 *</Label>
                    <Input id="code" name="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="name">거래처명 *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="type">거래처 구분 *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "매입처" | "납품처") => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="구분을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="매입처">매입처</SelectItem>
                        <SelectItem value="납품처">납품처</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="representative">대표자명</Label>
                    <Input id="representative" name="representative" value={formData.representative} onChange={(e) => setFormData({...formData, representative: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="address">주소</Label>
                    <Input id="address" name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="notes">비고</Label>
                    <Textarea id="notes" name="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">{editingCompany ? "수정" : "등록"}</Button>
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