"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { fetchCompanies, createCompany, updateCompany, deleteCompany } from "@/lib/api"
import { CustomPagination } from "@/components/ui/custom-pagination"

export type Company = {
  companyId: number
  companyCode: string
  companyName: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  address: string
  type: string[]
}

export default function CompanyList({ initialCompanies }: { initialCompanies: Company[] }) {
  const queryClient = useQueryClient();

  const { data: companies = initialCompanies, isLoading, isError } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    initialData: initialCompanies,
  });

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      toast.success("거래처가 성공적으로 등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      resetForm();
    },
    onError: (error) => {
      toast.error(`거래처 등록 실패: ${error.message}`);
    }
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Omit<Company, 'companyId'> }) => updateCompany(id, data),
    onSuccess: () => {
      toast.success("거래처가 성공적으로 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      resetForm();
    },
    onError: (error) => {
      toast.error(`거래처 수정 실패: ${error.message}`);
    }
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      toast.success("거래처가 성공적으로 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error) => {
      toast.error(`거래처 삭제 실패: ${error.message}`);
    }
  });

  const isMutating = isCreating || isUpdating || isDeleting;

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [searchFilters, setSearchFilters] = useState({
    companyCode: "",
    companyName: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    type: "전체",
  })
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const companiesPerPage = 10

  const [formData, setFormData] = useState<Omit<Company, 'companyId'>>({
    companyCode: "",
    companyName: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    type: ["납품처"],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCompany) {
      update({ id: editingCompany.companyId.toString(), data: formData });
    } else {
      create(formData);
    }
  }

  const resetForm = () => {
    setFormData({
      companyCode: "", companyName: "", contactPerson: "", contactPhone: "", contactEmail: "", address: "", type: ["납품처"],
    })
    setEditingCompany(null)
    setIsModalOpen(false)
  }

  const handleRowClick = (company: Company) => {
    setFormData({ ...company });
    setEditingCompany(company);
    setIsModalOpen(true);
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (confirm("이 거래처를 삭제하시겠습니까?")) {
      remove(id.toString());
    }
  }

  const filteredCompanies = useMemo(() => {
    return (companies || []).filter((company) => {
      const type = (company.type?.[0] || "").toLowerCase()
      return (
        (company.companyCode || '').toLowerCase().includes(searchFilters.companyCode.toLowerCase()) &&
        (company.companyName || '').toLowerCase().includes(searchFilters.companyName.toLowerCase()) &&
        (company.contactPerson || '').toLowerCase().includes(searchFilters.contactPerson.toLowerCase()) &&
        (company.contactPhone || '').toLowerCase().includes(searchFilters.contactPhone.toLowerCase()) &&
        (company.contactEmail || '').toLowerCase().includes(searchFilters.contactEmail.toLowerCase()) &&
        (searchFilters.type === "전체" || type === searchFilters.type.toLowerCase())
      )
    })
  }, [companies, searchFilters]);

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage)
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * companiesPerPage, currentPage * companiesPerPage)

  if (isLoading) return <div>로딩 중...</div>
  if (isError) return <div>오류가 발생했습니다.</div>

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">거래처 관리</h2>
        <Button onClick={() => {
          setEditingCompany(null)
          setFormData({ companyCode: "", companyName: "", contactPerson: "", contactPhone: "", contactEmail: "", address: "", type: ["납품처"] })
          setIsModalOpen(true)
        }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> 거래처 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>거래처 목록</CardTitle>
            <Button variant="outline" onClick={() => setShowSearchFilters(!showSearchFilters)} className="flex items-center gap-2">
              <Search className="w-4 h-4" /> 검색
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showSearchFilters && (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <Input placeholder="거래처코드" value={searchFilters.companyCode} onChange={(e) => setSearchFilters(prev => ({ ...prev, companyCode: e.target.value }))} />
              <Input placeholder="거래처명" value={searchFilters.companyName} onChange={(e) => setSearchFilters(prev => ({ ...prev, companyName: e.target.value }))} />
              <Select value={searchFilters.type} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger><SelectValue placeholder="거래처 구분" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="매입처">매입처</SelectItem>
                  <SelectItem value="납품처">납품처</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="대표자명" value={searchFilters.contactPerson} onChange={(e) => setSearchFilters(prev => ({ ...prev, contactPerson: e.target.value }))} />
              <Input placeholder="전화번호" value={searchFilters.contactPhone} onChange={(e) => setSearchFilters(prev => ({ ...prev, contactPhone: e.target.value }))} />
              <Input placeholder="Email" value={searchFilters.contactEmail} onChange={(e) => setSearchFilters(prev => ({ ...prev, contactEmail: e.target.value }))} />
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
                {paginatedCompanies.map((company) => (
                    <tr key={company.companyId} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(company)}>
                      <td className="p-3">{company.companyCode}</td>
                      <td className="p-3 font-medium">{company.companyName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.type?.[0] === "매입처"
                            ? "bg-sky-100 text-sky-800"
                            : company.type?.[0] === "납품처"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-600"
                        }`}>
                          {company.type?.length ? company.type[0] : "거래처 구분없음"}
                        </span>
                      </td>
                      <td className="p-3">{company.contactPerson}</td>
                      <td className="p-3">{company.contactPhone}</td>
                      <td className="p-3">{company.contactEmail}</td>
                      <td className="p-3">{company.address}</td>
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="sm" onClick={(e) => handleDelete(e, company.companyId)} className="text-red-600 hover:text-red-700" disabled={isMutating}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>표시할 거래처가 없습니다.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <CustomPagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>
          )}
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
                    <Label htmlFor="companyCode">거래처코드 *</Label>
                    <Input id="companyCode" value={formData.companyCode} onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })} required disabled={isMutating} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="companyName">거래처명 *</Label>
                    <Input id="companyName" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required disabled={isMutating} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="type">거래처 구분 *</Label>
                    <Select
                      key={editingCompany ? `edit-${editingCompany.companyId}` : 'new'}
                      value={formData.type[0] ?? ""}
                      onValueChange={(value: "매입처" | "납품처") => setFormData({ ...formData, type: [value] })}
                      disabled={isMutating}
                    >
                      <SelectTrigger><SelectValue placeholder="구분을 선택하세요" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="매입처">매입처</SelectItem>
                        <SelectItem value="납품처">납품처</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contactPerson">대표자명</Label>
                    <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} disabled={isMutating} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contactPhone">전화번호</Label>
                    <Input id="contactPhone" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} disabled={isMutating} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input id="contactEmail" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} disabled={isMutating} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="address">주소</Label>
                    <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} disabled={isMutating} />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={isMutating}>
                    {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingCompany ? "수정" : "등록"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent" disabled={isMutating}>취소</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}