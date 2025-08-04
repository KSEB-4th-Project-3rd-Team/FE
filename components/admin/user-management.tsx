"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Shield, UserCheck, UserX } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomPagination } from "@/components/ui/custom-pagination"
import { User } from "@/app/(main)/layout"
import { useUsers } from "@/lib/queries"

import { useRouter } from "next/navigation"

export default function UserManagement() {
  const { data: users = [], isLoading, error } = useUsers();
  const router = useRouter();

  const reloadUsers = () => {
    router.refresh();
  };
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<"ADMIN" | "USER" | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10


  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus = !statusFilter || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

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

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <p>사용자 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <p>사용자 데이터를 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">사용자 관리</h2>
      </div>

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
                <p className="text-sm text-gray-600">일반 사용자</p>
                <p className="text-2xl font-bold text-blue-600">{roleStats.USER}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>사용자 목록</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="사용자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={roleFilter ?? "ALL"} onValueChange={(value) => setRoleFilter(value === "ALL" ? undefined : value as "ADMIN" | "USER")}> 
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="모든 역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">모든 역할</SelectItem>
                  <SelectItem value="ADMIN">관리자</SelectItem>
                  <SelectItem value="USER">일반 사용자</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter ?? "ALL"} onValueChange={(value) => setStatusFilter(value === "ALL" ? undefined : value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="모든 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">모든 상태</SelectItem>
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
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
