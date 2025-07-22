"use client"

import { createContext, useContext, useState, ReactNode, FC } from 'react';

interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "system" | "inventory" | "agv" | "user";
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const mockNotifications: Notification[] = [
    {
    id: "1",
    type: "info",
    title: "새로운 기능: 다크 모드",
    message: "이제 설정에서 다크 모드로 전환할 수 있습니다.",
    timestamp: "2024-07-22 11:00",
    read: false,
    category: "system",
  },
  {
    id: "2",
    type: "warning",
    title: "AGV 배터리 부족",
    message: "AGV #2의 배터리가 15% 남았습니다.",
    timestamp: "2024-07-22 10:45",
    read: false,
    category: "agv",
  },
  {
    id: "3",
    type: "error",
    title: "입고 처리 실패",
    message: "입고 주문 #98765 처리에 실패했습니다.",
    timestamp: "2024-07-22 10:30",
    read: false,
    category: "inventory",
  },
  {
    id: "4",
    type: "success",
    title: "사용자 'JaneDoe' 추가됨",
    message: "새로운 사용자가 성공적으로 추가되었습니다.",
    timestamp: "2024-07-21 18:00",
    read: true,
    category: "user",
  },
    {
    id: "5",
    type: "info",
    title: "시스템 점검 예정",
    message: "일요일에 시스템 점검이 예정되어 있습니다.",
    timestamp: "2024-07-20 14:00",
    read: true,
    category: "system",
  },
];

export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    if (confirm("모든 알림을 삭제하시겠습니까?")) {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead, clearAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};