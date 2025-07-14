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
  BookMarkedIcon as MarkAsRead,
  Filter,
} from "lucide-react"

interface Notification {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  timestamp: string
  read: boolean
  category: "system" | "inventory" | "agv" | "user"
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const [filter, setFilter] = useState<"all" | "unread" | "info" | "warning" | "error" | "success">("all")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "system" | "inventory" | "agv" | "user">("all")

  const getNotificationIcon = (type: string) => {
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

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "success":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "system":
        return "bg-purple-100 text-purple-800"
      case "inventory":
        return "bg-blue-100 text-blue-800"
      case "agv":
        return "bg-orange-100 text-orange-800"
      case "user":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  const clearAllNotifications = () => {
    if (confirm("모든 알림을 삭제하시겠습니까?")) {
      setNotifications([])
    }
  }

  const filteredNotifications = notifications.filter((notif) => {
    const typeMatch = filter === "all" || notif.type === filter || (filter === "unread" && !notif.read)
    const categoryMatch = categoryFilter === "all" || notif.category === categoryFilter
    return typeMatch && categoryMatch
  })

  const unreadCount = notifications.filter((notif) => !notif.read).length
  const typeStats = {
    info: notifications.filter((n) => n.type === "info").length,
    warning: notifications.filter((n) => n.type === "warning").length,
    error: notifications.filter((n) => n.type === "error").length,
    success: notifications.filter((n) => n.type === "success").length,
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">알림 센터</h2>
          {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}개 읽지 않음</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <MarkAsRead className="w-4 h-4 mr-2" />
            모두 읽음
          </Button>
          <Button variant="outline" onClick={clearAllNotifications} disabled={notifications.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            모두 삭제
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">정보</p>
                <p className="text-2xl font-bold text-blue-600">{typeStats.info}</p>
              </div>
              <Info className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">경고</p>
                <p className="text-2xl font-bold text-yellow-600">{typeStats.warning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">오류</p>
                <p className="text-2xl font-bold text-red-600">{typeStats.error}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">성공</p>
                <p className="text-2xl font-bold text-green-600">{typeStats.success}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              알림 목록
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* 타입 필터 */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">모든 타입</option>
                  <option value="unread">읽지 않음</option>
                  <option value="info">정보</option>
                  <option value="warning">경고</option>
                  <option value="error">오류</option>
                  <option value="success">성공</option>
                </select>
              </div>

              {/* 카테고리 필터 */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">모든 카테고리</option>
                <option value="system">시스템</option>
                <option value="inventory">재고</option>
                <option value="agv">AGV</option>
                <option value="user">사용자</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>표시할 알림이 없습니다.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    notification.read ? "bg-white" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.read ? "text-blue-900" : "text-gray-900"}`}>
                            {notification.title}
                          </h4>
                          <Badge className={getNotificationBadgeColor(notification.type)}>
                            {notification.type === "info" && "정보"}
                            {notification.type === "warning" && "경고"}
                            {notification.type === "error" && "오류"}
                            {notification.type === "success" && "성공"}
                          </Badge>
                          <Badge className={getCategoryBadgeColor(notification.category)}>
                            {notification.category === "system" && "시스템"}
                            {notification.category === "inventory" && "재고"}
                            {notification.category === "agv" && "AGV"}
                            {notification.category === "user" && "사용자"}
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
                          <MarkAsRead className="w-4 h-4" />
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
        </CardContent>
      </Card>
    </div>
  )
}
