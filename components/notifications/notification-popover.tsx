"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Info, AlertTriangle, XCircle, CheckCircle, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface Notification {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Mock data for demonstration
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "info",
    title: "New feature added",
    message: "You can now export your data to CSV.",
    timestamp: "2024-07-22 10:30 AM",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Low inventory",
    message: "Item #12345 is running low on stock.",
    timestamp: "2024-07-22 09:15 AM",
    read: false,
  },
  {
    id: "3",
    type: "error",
    title: "AGV offline",
    message: "AGV #3 is currently offline.",
    timestamp: "2024-07-22 08:00 AM",
    read: true,
  },
    {
    id: "4",
    type: "success",
    title: "Outbound complete",
    message: "Order #54321 has been successfully shipped.",
    timestamp: "2024-07-21 05:45 PM",
    read: true,
  },
]

export default function NotificationPopover() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

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

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-white hover:bg-gray-100 z-50"
        >
          <Bell className="h-6 w-6 text-gray-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-2 py-0.5 text-xs rounded-full">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-6 mb-2" side="top" align="end">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Notifications</h4>
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
          </div>
          <div className="max-h-96 overflow-y-auto pr-2 -mr-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg transition-all ${
                      !notification.read ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/notifications" onClick={() => setIsOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
