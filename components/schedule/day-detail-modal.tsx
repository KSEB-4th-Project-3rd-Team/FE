"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Calendar, MapPin, Clock, Trash2, Package, TruckIcon } from "lucide-react"
import { scheduleService, type Schedule } from "@/lib/schedule"

interface DayDetailModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  onScheduleDeleted: () => void
}

export default function DayDetailModal({ isOpen, onClose, selectedDate, onScheduleDeleted }: DayDetailModalProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [activeTab, setActiveTab] = useState<"schedule" | "inbound" | "outbound">("schedule")

  useEffect(() => {
    if (isOpen && selectedDate) {
      const daySchedules = scheduleService.getSchedulesByDate(selectedDate)
      setSchedules(daySchedules)
    }
  }, [isOpen, selectedDate])

  const handleDeleteSchedule = (id: string) => {
    if (confirm("이 일정을 삭제하시겠습니까?")) {
      scheduleService.deleteSchedule(id)
      const updatedSchedules = schedules.filter((schedule) => schedule.id !== id)
      setSchedules(updatedSchedules)
      onScheduleDeleted()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "inbound":
        return "bg-green-100 text-green-800"
      case "outbound":
        return "bg-red-100 text-red-800"
      case "work":
        return "bg-blue-100 text-blue-800"
      case "meeting":
        return "bg-purple-100 text-purple-800"
      case "other":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case "inbound":
        return "입고"
      case "outbound":
        return "출고"
      case "work":
        return "작업"
      case "meeting":
        return "회의"
      case "other":
        return "기타"
      default:
        return "기타"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {formatDate(selectedDate)} 상세 정보
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "schedule"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("schedule")}
            >
              일정
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "inbound"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("inbound")}
            >
              입고 내역
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "outbound"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("outbound")}
            >
              출고 내역
            </button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-96">
          {activeTab === "schedule" && (
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>등록된 일정이 없습니다.</p>
                </div>
              ) : (
                schedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{schedule.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(schedule.type)}`}>
                            {getTypeName(schedule.type)}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          {schedule.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{schedule.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.time}</span>
                          </div>
                        </div>

                        {schedule.details && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">{schedule.details}</div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "inbound" && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>입고 내역 데이터를 불러오는 중...</p>
                <p className="text-xs mt-2">백엔드 API 연결 후 실제 데이터가 표시됩니다.</p>
              </div>
            </div>
          )}

          {activeTab === "outbound" && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <TruckIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>출고 내역 데이터를 불러오는 중...</p>
                <p className="text-xs mt-2">백엔드 API 연결 후 실제 데이터가 표시됩니다.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
