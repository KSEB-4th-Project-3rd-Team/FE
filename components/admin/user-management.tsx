"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Users, Shield, UserCheck, UserX } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { CustomPagination } from "@/components/ui/custom-pagination"
import { createUser, updateUser, deleteUser } from "@/lib/api"
import { User } from "@/app/(main)/layout"

interface UserManagementProps {
  users: User[];
  setUsers: () => void;
}

export default function UserManagement({ users, setUsers: reloadUsers }: UserManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<"ADMIN" | "USER" | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "USER" as "ADMIN" | "USER",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        const { password, ...userData } = formData; // Don't send password if not changed
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(formData);
      }
      reloadUsers();
      resetForm();
    } catch (error) {
      console.error("Failed to save user:", error);
      // Optionally, show an error message
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      role: "USER",
      status: "ACTIVE",
      password: "",
    })
    setEditingUser(null)
    setIsModalOpen(false)
  }

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status as "ACTIVE" | "INACTIVE" | "SUSPENDED", // Assuming status exists and is one of these
      password: "",
    })
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("이 사용자를 삭제하시겠습니까?")) {
      try {
        await deleteUser(id.toString()); // API expects string ID
        reloadUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
        // Optionally, show an error message
      }
    }
  }

  const toggleUserStatus = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (confirm(`이 사용자를 ${newStatus === 'ACTIVE' ? '활성' : '비활성'} 상태로 변경하시겠습니까?`)) {
      try {
        await updateUser(id.toString(), { status: newStatus }); // API expects string ID
        reloadUsers();
      } catch (error) {
        console.error("Failed to toggle user status:", error);
        // Optionally, show an error message
      }
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "" || user.role === roleFilter
    const matchesStatus = statusFilter === "" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "USER":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INACTIVE":
        return "bg-gray-100 text-gray-800"
      case "SUSPENDED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const roleStats = {
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    USER: users.filter((u) => u.role === "USER").length,
  }

  const statusStats = {
    ACTIVE: users.filter((u) => u.status === "ACTIVE").length,
    INACTIVE: users.filter((u) => u.status === "INACTIVE").length,
    SUSPENDED: users.filter((u) => u.status === "SUSPENDED").length,
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">사용자 관리</h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          사용자 추가
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 사용자</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold text-green-600">{statusStats.ACTIVE}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">비활성 사용자</p>
                <p className="text-2xl font-bold text-gray-600">{statusStats.INACTIVE}</p>
              </div>
              <UserX className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">관리자</p>
                <p className="text-2xl font-bold text-red-600">{roleStats.ADMIN}</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>사용자 목록</CardTitle>
            <div className="flex items-center gap-4">
              {/* 검색 */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="사용자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* 역할 필터 */}
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value === "" ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="모든 역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>모든 역할</SelectItem>
                  <SelectItem value="ADMIN">관리자</SelectItem>
                  <SelectItem value="USER">일반 사용자</SelectItem>
                </SelectContent>
              </Select>

              {/* 상태 필터 */}
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value === "" ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="모든 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>모든 상태</SelectItem>
                  <SelectItem value="ACTIVE">활성</SelectItem>
                  <SelectItem value="INACTIVE">비활성</SelectItem>
                  <SelectItem value="SUSPENDED">정지</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">사용자</th>
                  <th className="text-left p-3 font-semibold">역할</th>
                  <th className="text-center p-3 font-semibold">상태</th>
                  <th className="text-left p-3 font-semibold">마지막 접속</th>
                  <th className="text-left p-3 font-semibold">가입일</th>
                  <th className="text-center p-3 font-semibold">관리</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === "ADMIN" && "관리자"}
                        {user.role === "USER" && "일반 사용자"}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status === "ACTIVE" && "활성"}
                        {user.status === "INACTIVE" && "비활성"}
                        {user.status === "SUSPENDED" && "정지"}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{user.lastLogin}</td>
                    <td className="p-3 text-sm text-gray-600">{user.createdAt}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                          className={
                            user.status === "ACTIVE"
                              ? "text-gray-600 hover:text-gray-700"
                              : "text-green-600 hover:text-green-700"
                          }
                        >
                          {user.status === "ACTIVE" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
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
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || roleFilter || statusFilter ? (
                  <>
                    <p>검색 결과가 없습니다.</p>
                    <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
                  </>
                ) : (
                  <>
                    <p>등록된 사용자가 없습니다.</p>
                    <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      첫 사용자 등록하기
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

      {/* 사용자 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingUser ? "사용자 수정" : "사용자 추가"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">사용자명 *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="사용자명을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">이름 *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>
                {!editingUser && (
                  <div>
                    <Label htmlFor="password">비밀번호 *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="비밀번호를 입력하세요"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="role">역할 *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "ADMIN" | "USER") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="역할 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">일반 사용자</SelectItem>
                      <SelectItem value="ADMIN">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">상태 *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "ACTIVE" | "INACTIVE" | "SUSPENDED") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">활성</SelectItem>
                      <SelectItem value="INACTIVE">비활성</SelectItem>
                      <SelectItem value="SUSPENDED">정지</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingUser ? "수정" : "추가"}
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
