"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Trash2,
  BookCheck,
  Filter,
} from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { CustomPagination } from "@/components/ui/custom-pagination"

type NotificationType = "info" | "warning" | "error" | "success"
type CategoryType = "system" | "inventory" | "agv" | "user"

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications()

  const [typeFilter, setTypeFilter] = useState<"all" | "unread" | NotificationType>("all")
  const [categoryFilter, setCategoryFilter] = useState<"all" | CategoryType>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const notificationsPerPage = 10

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationBadgeColor = (type: NotificationType) => {
    switch (type) {
      case "info":
        return "border-blue-500/50 bg-blue-50 text-blue-700"
      case "warning":
        return "border-yellow-500/50 bg-yellow-50 text-yellow-700"
      case "error":
        return "border-red-500/50 bg-red-50 text-red-700"
      case "success":
        return "border-green-500/50 bg-green-50 text-green-700"
      default:
        return "border-gray-500/50 bg-gray-50 text-gray-700"
    }
  }

  const getCategoryBadgeColor = (category: CategoryType) => {
    switch (category) {
      case "system":
        return "border-purple-500/50 bg-purple-50 text-purple-700"
      case "inventory":
        return "border-cyan-500/50 bg-cyan-50 text-cyan-700"
      case "agv":
        return "border-orange-500/50 bg-orange-50 text-orange-700"
      case "user":
        return "border-pink-500/50 bg-pink-50 text-pink-700"
      default:
        return "border-gray-500/50 bg-gray-50 text-gray-700"
    }
  }

  const filteredNotifications = notifications.filter((notif) => {
    const typeMatch = typeFilter === "all" || (typeFilter === "unread" ? !notif.read : notif.type === typeFilter)
    const categoryMatch = categoryFilter === "all" || notif.category === categoryFilter
    return typeMatch && categoryMatch
  })

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage)
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage,
  )

  const typeStats = {
    info: notifications.filter((n) => n.type === "info").length,
    warning: notifications.filter((n) => n.type === "warning").length,
    error: notifications.filter((n) => n.type === "error").length,
    success: notifications.filter((n) => n.type === "success").length,
  }

  const typeToKorean = (type: NotificationType | 'unread' | 'all') => {
    const map = {
      info: "정보",
      warning: "경고",
      error: "오류",
      success: "성공",
      unread: "읽지 않음",
      all: "모든 타입"
    };
    return map[type];
  }

  const categoryToKorean = (category: CategoryType | 'all') => {
    const map = {
      system: "시스템",
      inventory: "재고",
      agv: "AGV",
      user: "사용자",
      all: "모든 카테고리"
    };
    return map[category];
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">알림 센터</h2>
          {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}개 읽지 않음</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <BookCheck className="w-4 h-4 mr-2" />
            모두 읽음으로 표시
          </Button>
          <Button variant="destructive" onClick={clearAllNotifications} disabled={notifications.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            모두 삭제
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-gray-600">전체</p><p className="text-2xl font-bold">{notifications.length}</p></div>
            <Bell className="w-8 h-8 text-gray-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-blue-600">정보</p><p className="text-2xl font-bold text-blue-600">{typeStats.info}</p></div>
            <Info className="w-8 h-8 text-blue-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-yellow-600">경고</p><p className="text-2xl font-bold text-yellow-600">{typeStats.warning}</p></div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-red-600">오류</p><p className="text-2xl font-bold text-red-600">{typeStats.error}</p></div>
            <XCircle className="w-8 h-8 text-red-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-green-600">성공</p><p className="text-2xl font-bold text-green-600">{typeStats.success}</p></div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell className="w-5 h-5" />
              알림 목록
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">{typeToKorean('all')}</option>
                  <option value="unread">{typeToKorean('unread')}</option>
                  <option value="info">{typeToKorean('info')}</option>
                  <option value="warning">{typeToKorean('warning')}</option>
                  <option value="error">{typeToKorean('error')}</option>
                  <option value="success">{typeToKorean('success')}</option>
                </select>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">{categoryToKorean('all')}</option>
                <option value="system">{categoryToKorean('system')}</option>
                <option value="inventory">{categoryToKorean('inventory')}</option>
                <option value="agv">{categoryToKorean('agv')}</option>
                <option value="user">{categoryToKorean('user')}</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedNotifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">표시할 알림이 없습니다.</p>
                <p className="text-sm">필터를 조정해 보세요.</p>
              </div>
            ) : (
              paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    notification.read ? "bg-white" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-800"}`}>
                            {notification.title}
                          </h4>
                          <Badge variant="outline" className={getNotificationBadgeColor(notification.type)}>
                            {typeToKorean(notification.type)}
                          </Badge>
                          <Badge variant="outline" className={getCategoryBadgeColor(notification.category)}>
                            {categoryToKorean(notification.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <BookCheck className="w-4 h-4 mr-1" /> 읽음으로 표시
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
    </div>
  )
}
