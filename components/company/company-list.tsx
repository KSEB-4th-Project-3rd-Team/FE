"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
// import { companyService, type Company } from "@/lib/company" // Removed for Spring backend integration"

// Temporary Company type until API is connected
export type Company = {
  id: string
  code: string
  name: string
  representative: string
  phone: string
  email: string
  address: string
  notes: string
}

// Mock company data
const mockCompanies: Company[] = []

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
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    representative: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = () => {
    // const allCompanies = companyService.getCompanies() // Removed for Spring backend integration
    setCompanies(mockCompanies)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCompany) {
      // companyService.updateCompany(editingCompany.id, formData) // Removed for Spring backend integration
      setCompanies(companies.map((c) => (c.id === editingCompany.id ? { ...formData, id: c.id } : c)))
    } else {
      // companyService.addCompany(formData) // Removed for Spring backend integration
      setCompanies([...companies, { ...formData, id: (companies.length + 1).toString() }])
    }

    loadCompanies()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      representative: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    })
    setEditingCompany(null)
    setIsModalOpen(false)
  }

  const handleEdit = (company: Company) => {
    setFormData({
      code: company.code,
      name: company.name,
      representative: company.representative,
      phone: company.phone,
      email: company.email,
      address: company.address,
      notes: company.notes,
    })
    setEditingCompany(company)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("이 거래처를 삭제하시겠습니까?")) {
      // companyService.deleteCompany(id) // Removed for Spring backend integration
      setCompanies(companies.filter((c) => c.id !== id))
      loadCompanies()
    }
  }

  // 검색 필터링 로직
  const filteredCompanies = companies.filter((company) => {
    const codeMatch = company.code.toLowerCase().includes(searchFilters.code.toLowerCase())
    const nameMatch = company.name.toLowerCase().includes(searchFilters.name.toLowerCase())
    const representativeMatch = company.representative
      .toLowerCase()
      .includes(searchFilters.representative.toLowerCase())
    const phoneMatch = company.phone.toLowerCase().includes(searchFilters.phone.toLowerCase())
    const emailMatch = company.email.toLowerCase().includes(searchFilters.email.toLowerCase())

    return codeMatch && nameMatch && representativeMatch && phoneMatch && emailMatch
  })

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">거래처 관리</h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          거래처 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>거래처 목록</CardTitle>
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
          {showSearchFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <div>
                <Label htmlFor="code-filter" className="text-sm font-medium">
                  거래처코드
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
                  거래처명
                </Label>
                <Input
                  id="name-filter"
                  placeholder="거래처명 검색..."
                  value={searchFilters.name}
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="representative-filter" className="text-sm font-medium">
                  대표자명
                </Label>
                <Input
                  id="representative-filter"
                  placeholder="대표자명 검색..."
                  value={searchFilters.representative}
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, representative: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone-filter" className="text-sm font-medium">
                  전화번호
                </Label>
                <Input
                  id="phone-filter"
                  placeholder="전화번호 검색..."
                  value={searchFilters.phone}
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email-filter" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email-filter"
                  placeholder="이메일 검색..."
                  value={searchFilters.email}
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">거래처코드</th>
                  <th className="text-left p-3 font-semibold">거래처명</th>
                  <th className="text-left p-3 font-semibold">대표자명</th>
                  <th className="text-left p-3 font-semibold">전화번호</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">주소</th>
                  <th className="text-center p-3 font-semibold">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{company.code}</td>
                    <td className="p-3 font-medium">{company.name}</td>
                    <td className="p-3">{company.representative}</td>
                    <td className="p-3">{company.phone}</td>
                    <td className="p-3">{company.email}</td>
                    <td className="p-3">{company.address}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(company)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(company.id)}
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
            {filteredCompanies.length === 0 && (
              <div className="text-center py-8 text-gray-500">등록된 거래처가 없습니다.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 거래처 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editingCompany ? "거래처 수정" : "거래처 등록"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">거래처코드 *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="거래처코드를 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">거래처명 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="거래처명을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="representative">대표자명</Label>
                  <Input
                    id="representative"
                    value={formData.representative}
                    onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                    placeholder="대표자명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="주소를 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">비고</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="비고를 입력하세요"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCompany ? "수정" : "등록"}
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
