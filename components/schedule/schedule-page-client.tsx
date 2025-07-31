"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus } from "lucide-react"
import ScheduleModal from "@/components/schedule/schedule-modal"
import DayDetailModal from "@/components/schedule/day-detail-modal"
import CalendarHeader from "@/components/schedule/calendar-header"
import { Schedule } from "@/lib/api"
import { InOutRecord } from "@/components/utils"

// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수 (시간대 문제 해결)
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface SchedulePageClientProps {
  initialSchedules: Schedule[];
  initialInOutData: InOutRecord[];
}

export default function SchedulePageClient({ initialSchedules, initialInOutData }: SchedulePageClientProps) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [inOutData, setInOutData] = useState(initialInOutData);
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date())
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  
  const reloadData = () => {
    router.refresh();
  }

  const handleScheduleAdded = () => {
    reloadData()
  }

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString = formatDateToString(clickedDate)
    setSelectedDate(dateString)
    setIsDayDetailModalOpen(true)
  }

  // 캘린더 관련 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getSchedulesForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString = formatDateToString(date)
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startTime).toISOString().split('T')[0]
      return scheduleDate === dateString
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    const today = new Date()
    const isCurrentMonth =
      currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth()
    const todayDate = today.getDate()

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const daySchedules = getSchedulesForDate(day)
      const isToday = isCurrentMonth && day === todayDate

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 cursor-pointer transition-colors relative ${
            isToday ? "bg-blue-100 border-blue-300 hover:bg-blue-150" : "hover:bg-blue-50"
          }`}
          onClick={() => handleDayClick(day)}
        >
          <div className={`font-semibold text-sm ${isToday ? "text-blue-700" : ""}`}>
            {day}
            {isToday && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>}
          </div>
          <div className="mt-1 space-y-1">
            {daySchedules.slice(0, 2).map((schedule, index) => (
              <div key={index} className="text-xs bg-blue-100 text-blue-800 px-1 rounded truncate">
                {schedule.title}
              </div>
            ))}
            {daySchedules.length > 2 && <div className="text-xs text-gray-500">+{daySchedules.length - 2}개 더</div>}
          </div>
        </div>,
      )
    }

    return (
      <div>
        <CalendarHeader currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="grid grid-cols-7 gap-0 mb-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="h-8 flex items-center justify-center font-semibold text-sm bg-gray-100">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 border border-gray-200">{days}</div>
      </div>
    )
  }

  return (
    <>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">일정 관리</h2>
          <Button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            일정 등록
          </Button>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                작업 캘린더
              </CardTitle>
            </CardHeader>
            <CardContent>{renderCalendar()}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>오늘의 작업 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedules
                  .filter((schedule) => {
                    const scheduleDate = new Date(schedule.startTime).toISOString().split('T')[0]
                    return scheduleDate === formatDateToString(new Date())
                  })
                  .map((schedule) => (
                    <div key={schedule.scheduleId} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium">{schedule.title}</span>
                        <p className="text-sm text-gray-600">{schedule.type}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(schedule.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(schedule.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                {schedules.filter((schedule) => {
                  const scheduleDate = new Date(schedule.startTime).toISOString().split('T')[0]
                  return scheduleDate === formatDateToString(new Date())
                }).length === 0 && (
                  <div className="text-center py-4 text-gray-500">오늘 등록된 일정이 없습니다.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleAdded={handleScheduleAdded}
        selectedDate={selectedDate}
      />
      <DayDetailModal
        isOpen={isDayDetailModalOpen}
        onClose={() => setIsDayDetailModalOpen(false)}
        selectedDate={selectedDate}
        onScheduleDeleted={reloadData}
        schedules={schedules}
        inOutData={inOutData}
      />
    </>
  )
}
