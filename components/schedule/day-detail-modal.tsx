"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Calendar, MapPin, Clock, Trash2, Package, TruckIcon } from "lucide-react"
import type { Schedule } from "@/app/(main)/schedule/page"
import { type InOutRecord } from "@/components/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DayDetailModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  onScheduleDeleted: () => void
  schedules: Schedule[];
  inOutData: InOutRecord[];
}

export default function DayDetailModal({ isOpen, onClose, selectedDate, onScheduleDeleted, schedules, inOutData }: DayDetailModalProps) {
  const [daySchedules, setDaySchedules] = useState<Schedule[]>([])
  const [inboundRecords, setInboundRecords] = useState<InOutRecord[]>([])
  const [outboundRecords, setOutboundRecords] = useState<InOutRecord[]>([])
  const [activeTab, setActiveTab] = useState<"schedule" | "inbound" | "outbound">("schedule")

  useEffect(() => {
    if (isOpen && selectedDate) {
      setActiveTab("schedule") // Reset tab to default
      const filteredSchedules = schedules.filter((s) => s.date === selectedDate)
      setDaySchedules(filteredSchedules)

      // Filter In/Out records for the selected date
      const dayInOutRecords = inOutData.filter((record) => record.date === selectedDate)
      setInboundRecords(dayInOutRecords.filter((r) => r.type === "inbound"))
      setOutboundRecords(dayInOutRecords.filter((r) => r.type === "outbound"))
    }
  }, [isOpen, selectedDate, schedules, inOutData])

  const handleDeleteSchedule = (id: string) => {
    if (confirm("이 일정을 삭제하시겠습니까?")) {
      // This should ideally call a service to delete and then trigger a refresh via onScheduleDeleted
      const updatedSchedules = daySchedules.filter((schedule) => schedule.id !== id)
      setDaySchedules(updatedSchedules)
      onScheduleDeleted() // Notify parent to refetch all schedules
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

  const renderHistoryTable = (records: InOutRecord[], type: "inbound" | "outbound") => {
    if (records.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {type === "inbound" ? (
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          ) : (
            <TruckIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          )}
          <p>해당 날짜에 {type === "inbound" ? "입고" : "출고"} 내역이 없습니다.</p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">시간</TableHead>
            <TableHead className="w-[25%]">품목명</TableHead>
            <TableHead className="w-[20%] text-center">수량</TableHead>
            <TableHead className="w-[20%]">거래처</TableHead>
            <TableHead className="w-[20%]">상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.time}</TableCell>
              <TableCell>{record.productName}</TableCell>
              <TableCell className="text-center">{record.quantity}</TableCell>
              <TableCell>{record.company}</TableCell>
              <TableCell>{record.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
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
              일정 ({daySchedules.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "inbound"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("inbound")}
            >
              입고 내역 ({inboundRecords.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "outbound"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("outbound")}
            >
              출고 내역 ({outboundRecords.length})
            </button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-grow">
          {activeTab === "schedule" && (
            <div className="space-y-4">
              {daySchedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>등록된 일정이 없습니다.</p>
                </div>
              ) : (
                daySchedules.map((schedule) => (
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

          {activeTab === "inbound" && renderHistoryTable(inboundRecords, "inbound")}

          {activeTab === "outbound" && renderHistoryTable(outboundRecords, "outbound")}
        </CardContent>
      </Card>
    </div>
  )
}
