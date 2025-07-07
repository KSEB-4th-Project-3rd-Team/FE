"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Package,
  PackageOpen,
  Warehouse,
  TruckIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  LogOut,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { authService, type User } from "@/lib/auth"
import { scheduleService, type Schedule } from "@/lib/schedule"
import AuthForm from "@/components/auth/auth-form"
import ScheduleModal from "@/components/schedule/schedule-modal"
import DayDetailModal from "@/components/schedule/day-detail-modal"
import CalendarHeader from "@/components/schedule/calendar-header"
import WarehouseSimulation from "@/components/simulation/warehouse-simulation"
import { agvSimulation } from "@/lib/agv-simulation"
import InboundForm from "@/components/forms/inbound-form"
import OutboundForm from "@/components/forms/outbound-form"

// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수 (시간대 문제 해결)
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type ViewType = "simulation" | "schedule" | "inventory" | "history"
type SidePanelType = "inbound" | "outbound" | null

export default function WMSSystem() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>("simulation")
  const [sidePanel, setSidePanel] = useState<SidePanelType>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // 더미 재고 데이터
  const inventoryData = [
    {
      id: 1,
      name: "노트북 - ThinkPad X1",
      sku: "NB-TP-X1-001",
      category: "전자제품",
      quantity: 245,
      location: "A구역-01",
      status: "정상",
      lastUpdate: "2024-01-15 14:30",
    },
    {
      id: 2,
      name: "무선 마우스",
      sku: "MS-WL-001",
      category: "주변기기",
      quantity: 89,
      location: "B구역-03",
      status: "부족",
      lastUpdate: "2024-01-15 11:20",
    },
    {
      id: 3,
      name: "기계식 키보드",
      sku: "KB-MEC-001",
      category: "주변기기",
      quantity: 156,
      location: "A구역-05",
      status: "정상",
      lastUpdate: "2024-01-15 09:45",
    },
    {
      id: 4,
      name: "모니터 - 27인치 4K",
      sku: "MN-27-4K-001",
      category: "디스플레이",
      quantity: 78,
      location: "C구역-02",
      status: "정상",
      lastUpdate: "2024-01-14 16:15",
    },
    {
      id: 5,
      name: "USB 허브",
      sku: "HB-USB-001",
      category: "주변기기",
      quantity: 12,
      location: "B구역-07",
      status: "부족",
      lastUpdate: "2024-01-14 13:22",
    },
    {
      id: 6,
      name: "웹캠 - HD",
      sku: "WC-HD-001",
      category: "주변기기",
      quantity: 134,
      location: "A구역-08",
      status: "정상",
      lastUpdate: "2024-01-14 10:30",
    },
    {
      id: 7,
      name: "스피커 - 블루투스",
      sku: "SP-BT-001",
      category: "오디오",
      quantity: 67,
      location: "C구역-04",
      status: "정상",
      lastUpdate: "2024-01-13 15:45",
    },
    {
      id: 8,
      name: "태블릿 - iPad Pro",
      sku: "TB-IP-PRO-001",
      category: "전자제품",
      quantity: 45,
      location: "A구역-12",
      status: "정상",
      lastUpdate: "2024-01-13 12:10",
    },
    {
      id: 9,
      name: "헤드셋 - 게이밍",
      sku: "HS-GM-001",
      category: "오디오",
      quantity: 23,
      location: "B구역-09",
      status: "부족",
      lastUpdate: "2024-01-13 09:15",
    },
    {
      id: 10,
      name: "프린터 - 레이저",
      sku: "PR-LS-001",
      category: "사무기기",
      quantity: 34,
      location: "C구역-06",
      status: "정상",
      lastUpdate: "2024-01-12 16:20",
    },
    {
      id: 11,
      name: "외장하드 - 2TB",
      sku: "HD-EX-2TB-001",
      category: "저장장치",
      quantity: 89,
      location: "A구역-15",
      status: "정상",
      lastUpdate: "2024-01-12 14:45",
    },
    {
      id: 12,
      name: "충전기 - USB-C",
      sku: "CH-USBC-001",
      category: "주변기기",
      quantity: 156,
      location: "B구역-11",
      status: "정상",
      lastUpdate: "2024-01-12 11:30",
    },
    {
      id: 13,
      name: "마이크 - 콘덴서",
      sku: "MC-CD-001",
      category: "오디오",
      quantity: 28,
      location: "C구역-08",
      status: "부족",
      lastUpdate: "2024-01-11 15:10",
    },
    {
      id: 14,
      name: "라우터 - WiFi 6",
      sku: "RT-WF6-001",
      category: "네트워크",
      quantity: 67,
      location: "A구역-18",
      status: "정상",
      lastUpdate: "2024-01-11 13:25",
    },
    {
      id: 15,
      name: "케이블 - HDMI",
      sku: "CB-HDMI-001",
      category: "케이블",
      quantity: 234,
      location: "B구역-14",
      status: "정상",
      lastUpdate: "2024-01-11 10:40",
    },
    {
      id: 16,
      name: "스위치 - 네트워크",
      sku: "SW-NW-001",
      category: "네트워크",
      quantity: 45,
      location: "C구역-10",
      status: "정상",
      lastUpdate: "2024-01-10 16:55",
    },
    {
      id: 17,
      name: "SSD - 1TB",
      sku: "SSD-1TB-001",
      category: "저장장치",
      quantity: 78,
      location: "A구역-20",
      status: "정상",
      lastUpdate: "2024-01-10 14:20",
    },
    {
      id: 18,
      name: "메모리 - 16GB",
      sku: "RAM-16GB-001",
      category: "부품",
      quantity: 123,
      location: "B구역-16",
      status: "정상",
      lastUpdate: "2024-01-10 11:35",
    },
    {
      id: 19,
      name: "그래픽카드 - RTX",
      sku: "GPU-RTX-001",
      category: "부품",
      quantity: 12,
      location: "C구역-12",
      status: "부족",
      lastUpdate: "2024-01-09 15:50",
    },
    {
      id: 20,
      name: "CPU - Intel i7",
      sku: "CPU-I7-001",
      category: "부품",
      quantity: 34,
      location: "A구역-22",
      status: "정상",
      lastUpdate: "2024-01-09 13:15",
    },
  ]

  // 더미 입출고 내역 데이터 추가
  const historyData = [
    {
      id: 1,
      type: "inbound",
      productName: "노트북 - ThinkPad X1",
      sku: "NB-TP-X1-001",
      quantity: 50,
      location: "A구역-01",
      manager: "김철수",
      status: "완료",
      date: "2024-01-15",
      time: "09:30",
      supplier: "삼성전자",
      notes: "정기 입고",
    },
    {
      id: 2,
      type: "outbound",
      productName: "무선 마우스",
      sku: "MS-WL-001",
      quantity: 30,
      location: "B구역-03",
      manager: "이영희",
      status: "진행중",
      date: "2024-01-15",
      time: "14:20",
      destination: "강남지점",
      notes: "긴급 출고",
    },
    {
      id: 3,
      type: "inbound",
      productName: "기계식 키보드",
      sku: "KB-MEC-001",
      quantity: 25,
      location: "C구역-05",
      manager: "박민수",
      status: "완료",
      date: "2024-01-14",
      time: "16:45",
      supplier: "로지텍",
      notes: "",
    },
    {
      id: 4,
      type: "outbound",
      productName: "모니터 - 27인치 4K",
      sku: "MN-27-4K-001",
      quantity: 15,
      location: "C구역-02",
      manager: "정수진",
      status: "완료",
      date: "2024-01-14",
      time: "11:30",
      destination: "서초지점",
      notes: "고객 주문",
    },
    {
      id: 5,
      type: "inbound",
      productName: "USB 허브",
      sku: "HB-USB-001",
      quantity: 100,
      location: "B구역-07",
      manager: "김철수",
      status: "완료",
      date: "2024-01-13",
      time: "10:15",
      supplier: "애플",
      notes: "대량 입고",
    },
    {
      id: 6,
      type: "outbound",
      productName: "웹캠 - HD",
      sku: "WC-HD-001",
      quantity: 20,
      location: "A구역-08",
      manager: "이영희",
      status: "완료",
      date: "2024-01-13",
      time: "15:20",
      destination: "판교지점",
      notes: "",
    },
    {
      id: 7,
      type: "inbound",
      productName: "스피커 - 블루투스",
      sku: "SP-BT-001",
      category: "오디오",
      quantity: 40,
      location: "C구역-04",
      manager: "박민수",
      status: "완료",
      date: "2024-01-12",
      time: "13:45",
      supplier: "소니",
      notes: "신제품 입고",
    },
    {
      id: 8,
      type: "outbound",
      productName: "태블릿 - iPad Pro",
      sku: "TB-IP-PRO-001",
      category: "오디오",
      quantity: 8,
      location: "A구역-12",
      manager: "정수진",
      status: "대기",
      date: "2024-01-12",
      time: "09:00",
      destination: "홍대지점",
      notes: "배송 대기중",
    },
    {
      id: 9,
      type: "inbound",
      productName: "헤드셋 - 게이밍",
      sku: "HS-GM-001",
      category: "오디오",
      quantity: 60,
      location: "B구역-09",
      manager: "김철수",
      status: "완료",
      date: "2024-01-11",
      time: "14:30",
      supplier: "레이저",
      notes: "",
    },
    {
      id: 10,
      type: "outbound",
      productName: "프린터 - 레이저",
      sku: "PR-LS-001",
      category: "사무기기",
      quantity: 5,
      location: "C구역-06",
      manager: "이영희",
      status: "완료",
      date: "2024-01-11",
      time: "16:10",
      destination: "신촌지점",
      notes: "사무용품 보충",
    },
    {
      id: 11,
      type: "inbound",
      productName: "외장하드 - 2TB",
      sku: "HD-EX-2TB-001",
      category: "저장장치",
      quantity: 35,
      location: "A구역-15",
      manager: "박민수",
      status: "완료",
      date: "2024-01-10",
      time: "11:20",
      supplier: "씨게이트",
      notes: "정기 보충",
    },
    {
      id: 12,
      type: "outbound",
      productName: "충전기 - USB-C",
      sku: "CH-USBC-001",
      category: "주변기기",
      quantity: 45,
      location: "B구역-11",
      manager: "정수진",
      status: "완료",
      date: "2024-01-10",
      time: "13:50",
      destination: "건대지점",
      notes: "",
    },
    {
      id: 13,
      type: "inbound",
      productName: "마이크 - 콘덴서",
      sku: "MC-CD-001",
      category: "오디오",
      quantity: 20,
      location: "C구역-08",
      manager: "김철수",
      status: "완료",
      date: "2024-01-09",
      time: "15:40",
      supplier: "오디오테크니카",
      notes: "방송장비",
    },
    {
      id: 14,
      type: "outbound",
      productName: "라우터 - WiFi 6",
      sku: "RT-WF6-001",
      category: "네트워크",
      quantity: 12,
      location: "A구역-18",
      manager: "이영희",
      status: "진행중",
      date: "2024-01-09",
      time: "10:30",
      destination: "수원지점",
      notes: "네트워크 업그레이드",
    },
    {
      id: 15,
      type: "inbound",
      productName: "케이블 - HDMI",
      sku: "CB-HDMI-001",
      category: "케이블",
      quantity: 80,
      location: "B구역-14",
      manager: "박민수",
      status: "완료",
      date: "2024-01-08",
      time: "12:15",
      supplier: "벨킨",
      notes: "",
    },
  ]

  // 검색 상태를 개별 필터로 변경 (수량 제거)
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    category: "",
    location: "",
    status: "",
  })

  // 검색 필터에 historyFilters 추가
  const [historyFilters, setHistoryFilters] = useState({
    type: "",
    productName: "",
    location: "",
    status: "",
    date: "",
    notes: "",
  })

  const [showHistoryFilters, setShowHistoryFilters] = useState(false)
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1)

  const [currentPage, setCurrentPage] = useState(1)
  const [showSearchFilters, setShowSearchFilters] = useState(false)
  const itemsPerPage = 8

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    const checkAuthStatus = () => {
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    checkAuthStatus()
    loadSchedules()
  }, [])

  const loadSchedules = () => {
    const allSchedules = scheduleService.getSchedules()
    setSchedules(allSchedules)
  }

  const handleAuthSuccess = (user: User) => {
    setUser(user)
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setCurrentView("simulation")
    setSidePanel(null)
  }

  const handleScheduleClick = () => {
    setCurrentView("schedule")
    setSidePanel(null)
    setIsPanelCollapsed(false)
  }

  const handleInventoryClick = () => {
    setCurrentView("inventory")
    setSidePanel(null)
    setIsPanelCollapsed(false)
  }

  const handleInboundClick = () => {
    setCurrentView("simulation")
    setSidePanel("inbound")
    setIsPanelCollapsed(false) // 패널을 펼친 상태로 설정
  }

  const handleOutboundClick = () => {
    setCurrentView("simulation")
    setSidePanel("outbound")
    setIsPanelCollapsed(false) // 패널을 펼친 상태로 설정
  }

  const handleHistoryClick = () => {
    setCurrentView("history")
    setSidePanel(null)
    setIsPanelCollapsed(false)
  }

  const closeSidePanel = () => {
    setSidePanel(null)
    setIsPanelCollapsed(false)
  }

  const handleScheduleAdded = (schedule: Schedule) => {
    setSchedules([...schedules, schedule])
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
    return schedules.filter((schedule) => schedule.date === dateString)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // 오늘 날짜 정보
    const today = new Date()
    const isCurrentMonth =
      currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth()
    const todayDate = today.getDate()

    // 빈 칸들 추가
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // 날짜들 추가
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

  const renderMainContent = () => {
    // 검색 필터링 로직 (수량 제거)
    const filteredInventory = inventoryData.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      const categoryMatch = item.category.toLowerCase().includes(searchFilters.category.toLowerCase())
      const locationMatch = item.location.toLowerCase().includes(searchFilters.location.toLowerCase())
      const statusMatch = item.status.toLowerCase().includes(searchFilters.status.toLowerCase())

      return nameMatch && categoryMatch && locationMatch && statusMatch
    })

    // 페이지네이션
    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentItems = filteredInventory.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (page: number) => {
      setCurrentPage(page)
    }

    const handleFilterChange = (field: string, value: string) => {
      setSearchFilters((prev) => ({
        ...prev,
        [field]: value,
      }))
      setCurrentPage(1) // 필터 변경 시 첫 페이지로 이동
    }

    // 입출고 내역 필터링
    const filteredHistory = historyData.filter((item) => {
      const typeMatch = historyFilters.type === "" || item.type === historyFilters.type
      const productNameMatch = item.productName.toLowerCase().includes(historyFilters.productName.toLowerCase())
      const locationMatch = item.location.toLowerCase().includes(historyFilters.location.toLowerCase())
      const statusMatch = item.status.toLowerCase().includes(historyFilters.status.toLowerCase())
      const notesMatch = historyFilters.notes.toLowerCase().includes(historyFilters.notes.toLowerCase())

      // 날짜 범위 필터링
      let dateMatch = true
      if (historyFilters.date) {
        dateMatch = item.date === historyFilters.date
      }

      return typeMatch && productNameMatch && locationMatch && statusMatch && dateMatch && notesMatch
    })

    // 페이지네이션
    const historyTotalPages = Math.ceil(filteredHistory.length / itemsPerPage)
    const historyStartIndex = (historyCurrentPage - 1) * itemsPerPage
    const historyCurrentItems = filteredHistory.slice(historyStartIndex, historyStartIndex + itemsPerPage)

    const handleHistoryPageChange = (page: number) => {
      setHistoryCurrentPage(page)
    }

    const handleHistoryFilterChange = (field: string, value: string) => {
      setHistoryFilters((prev) => ({
        ...prev,
        [field]: value,
      }))
      setHistoryCurrentPage(1)
    }

    switch (currentView) {
      case "schedule":
        return (
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
                      .filter((schedule) => schedule.date === formatDateToString(new Date()))
                      .map((schedule) => (
                        <div key={schedule.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <div>
                            <span className="font-medium">{schedule.title}</span>
                            <p className="text-sm text-gray-600">{schedule.location}</p>
                          </div>
                          <span className="text-sm text-gray-600">{schedule.time}</span>
                        </div>
                      ))}
                    {schedules.filter((schedule) => schedule.date === formatDateToString(new Date())).length === 0 && (
                      <div className="text-center py-4 text-gray-500">오늘 등록된 일정이 없습니다.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "inventory":
        return (
          <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-6">재고 현황</h2>
            <div className="grid gap-6">
              {/* 통계 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">총 재고</p>
                        <p className="text-2xl font-bold">2,707</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">입고 대기</p>
                        <p className="text-2xl font-bold text-green-600">156</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">출고 예정</p>
                        <p className="text-2xl font-bold text-red-600">89</p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">부족 재고</p>
                        <p className="text-2xl font-bold text-yellow-600">23</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 창고별 재고 현황 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="w-5 h-5" />
                    창고별 재고 현황
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <h3 className="font-semibold">A구역</h3>
                      <p className="text-2xl font-bold text-blue-600">1,250</p>
                      <p className="text-sm text-gray-600">개 보관중</p>
                      <div className="mt-2 bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "83%" }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">83% 사용중</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <h3 className="font-semibold">B구역</h3>
                      <p className="text-2xl font-bold text-green-600">890</p>
                      <p className="text-sm text-gray-600">개 보관중</p>
                      <div className="mt-2 bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "59%" }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">59% 사용중</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg text-center">
                      <h3 className="font-semibold">C구역</h3>
                      <p className="text-2xl font-bold text-yellow-600">567</p>
                      <p className="text-sm text-gray-600">개 보관중</p>
                      <div className="mt-2 bg-yellow-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "38%" }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">38% 사용중</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 재고 목록 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      재고 목록
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowSearchFilters(!showSearchFilters)}
                        className="flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        검색
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 검색 필터 (토글 방식) */}
                  {showSearchFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <Label htmlFor="name-filter" className="text-sm font-medium">
                          상품명
                        </Label>
                        <Input
                          id="name-filter"
                          placeholder="상품명 검색..."
                          value={searchFilters.name}
                          onChange={(e) => handleFilterChange("name", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-filter" className="text-sm font-medium">
                          카테고리
                        </Label>
                        <Input
                          id="category-filter"
                          placeholder="카테고리 검색..."
                          value={searchFilters.category}
                          onChange={(e) => handleFilterChange("category", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location-filter" className="text-sm font-medium">
                          위치
                        </Label>
                        <Input
                          id="location-filter"
                          placeholder="위치 검색..."
                          value={searchFilters.location}
                          onChange={(e) => handleFilterChange("location", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="status-filter" className="text-sm font-medium">
                          상태
                        </Label>
                        <select
                          id="status-filter"
                          value={searchFilters.status}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">전체</option>
                          <option value="정상">정상</option>
                          <option value="부족">부족</option>
                          <option value="위험">위험</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 필터 상태 및 초기화 버튼 */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600">
                      {Object.values(searchFilters).some((filter) => filter !== "") && (
                        <span className="inline-flex items-center gap-1">
                          <Filter className="w-3 h-3" />
                          필터 적용됨 -
                        </span>
                      )}{" "}
                      총 {filteredInventory.length}개 항목
                    </div>
                    {Object.values(searchFilters).some((filter) => filter !== "") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchFilters({
                            name: "",
                            category: "",
                            location: "",
                            status: "",
                          })
                          setCurrentPage(1)
                        }}
                        className="text-gray-600"
                      >
                        필터 초기화
                      </Button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 md:p-3 font-semibold min-w-[200px]">상품명</th>
                          <th className="text-left p-2 md:p-3 font-semibold min-w-[100px]">카테고리</th>
                          <th className="text-center p-2 md:p-3 font-semibold min-w-[60px]">수량</th>
                          <th className="text-center p-2 md:p-3 font-semibold min-w-[80px]">위치</th>
                          <th className="text-center p-2 md:p-3 font-semibold min-w-[60px]">상태</th>
                          <th className="text-left p-2 md:p-3 font-semibold min-w-[120px]">마지막 업데이트</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 md:p-3">
                              <div>
                                <p className="font-medium text-sm break-words">{item.name}</p>
                                <p className="text-xs text-gray-500 break-all">SKU: {item.sku}</p>
                              </div>
                            </td>
                            <td className="p-2 md:p-3 text-sm">{item.category}</td>
                            <td className="p-2 md:p-3 text-center">
                              <span className="font-semibold">{item.quantity}</span>
                            </td>
                            <td className="p-2 md:p-3 text-center text-sm">{item.location}</td>
                            <td className="p-2 md:p-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                  item.status === "정상"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "부족"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="p-2 md:p-3 text-gray-600 text-xs break-words">{item.lastUpdate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 검색 결과가 없을 때 */}
                  {filteredInventory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>검색 결과가 없습니다.</p>
                      <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
                    </div>
                  )}

                  {/* 페이지네이션 */}
                  {filteredInventory.length > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-gray-600 flex-shrink-0">
                        총 {filteredInventory.length}개 중 {startIndex + 1}-
                        {Math.min(startIndex + itemsPerPage, filteredInventory.length)}개 표시
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="px-3"
                        >
                          이전
                        </Button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page
                          if (totalPages <= 5) {
                            page = i + 1
                          } else if (currentPage <= 3) {
                            page = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i
                          } else {
                            page = currentPage - 2 + i
                          }
                          return (
                            <Button
                              key={page}
                              variant="outline"
                              size="sm"
                              className={`px-3 ${currentPage === page ? "bg-blue-50 text-blue-600" : ""}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          )
                        })}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="px-3"
                        >
                          다음
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "history":
        return (
          <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-6">입출고 내역</h2>
            <div className="grid gap-6">
              {/* 통계 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">오늘 입고</p>
                        <p className="text-2xl font-bold text-blue-600">125</p>
                        <p className="text-xs text-green-600">+12% 전일대비</p>
                      </div>
                      <PackageOpen className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">오늘 출고</p>
                        <p className="text-2xl font-bold text-red-600">89</p>
                        <p className="text-xs text-red-600">-5% 전일대비</p>
                      </div>
                      <TruckIcon className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">이번 주 총량</p>
                        <p className="text-2xl font-bold">1,456</p>
                        <p className="text-xs text-green-600">+8% 전주대비</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 상세 내역 목록 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Warehouse className="w-5 h-5" />
                      전체 입출고 내역
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowHistoryFilters(!showHistoryFilters)}
                        className="flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        검색
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 검색 필터 */}
                  {showHistoryFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <Label htmlFor="type-filter" className="text-sm font-medium">
                          유형
                        </Label>
                        <select
                          id="type-filter"
                          value={historyFilters.type}
                          onChange={(e) => handleHistoryFilterChange("type", e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">전체</option>
                          <option value="inbound">입고</option>
                          <option value="outbound">출고</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="product-filter" className="text-sm font-medium">
                          상품명
                        </Label>
                        <Input
                          id="product-filter"
                          placeholder="상품명 검색..."
                          value={historyFilters.productName}
                          onChange={(e) => handleHistoryFilterChange("productName", e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location-filter" className="text-sm font-medium">
                          위치
                        </Label>
                        <Input
                          id="location-filter"
                          placeholder="위치 검색..."
                          value={historyFilters.location}
                          onChange={(e) => handleHistoryFilterChange("location", e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="status-filter" className="text-sm font-medium">
                          상태
                        </Label>
                        <select
                          id="status-filter"
                          value={historyFilters.status}
                          onChange={(e) => handleHistoryFilterChange("status", e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">전체</option>
                          <option value="완료">완료</option>
                          <option value="진행중">진행중</option>
                          <option value="대기">대기</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="date-filter" className="text-sm font-medium">
                          날짜
                        </Label>
                        <Input
                          id="date-filter"
                          type="date"
                          value={historyFilters.date}
                          onChange={(e) => handleHistoryFilterChange("date", e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-5">
                        <Label htmlFor="notes-filter" className="text-sm font-medium">
                          비고
                        </Label>
                        <Input
                          id="notes-filter"
                          placeholder="비고 검색..."
                          value={historyFilters.notes}
                          onChange={(e) => handleHistoryFilterChange("notes", e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* 필터 상태 및 초기화 버튼 */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600">
                      {Object.values(historyFilters).some((filter) => filter !== "") && (
                        <span className="inline-flex items-center gap-1">
                          <Filter className="w-3 h-3" />
                          필터 적용됨 -
                        </span>
                      )}{" "}
                      총 {filteredHistory.length}개 항목
                    </div>
                    {Object.values(historyFilters).some((filter) => filter !== "") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setHistoryFilters({
                            type: "",
                            productName: "",
                            location: "",
                            status: "",
                            date: "",
                            notes: "",
                          })
                          setHistoryCurrentPage(1)
                        }}
                        className="text-gray-600"
                      >
                        필터 초기화
                      </Button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 md:p-3 font-semibold min-w-[60px]">유형</th>
                          <th className="text-left p-2 md:p-3 font-semibold min-w-[200px]">상품명</th>
                          <th className="text-center p-2 md:p-3 font-semibold min-w-[60px]">수량</th>
                          <th className="text-center p-2 md:p-3 font-semibold min-w-[80px]">위치</th>
                          <th className="text-center p-2 md:p-3 font-semibold min-w-[60px]">상태</th>
                          <th className="text-center p-2 md:p-3 font-semibold min-w-[100px]">날짜</th>
                          <th className="text-left p-2 md:p-3 font-semibold min-w-[150px]">비고</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyCurrentItems.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 md:p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                  item.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.type === "inbound" ? "입고" : "출고"}
                              </span>
                            </td>
                            <td className="p-2 md:p-3">
                              <div>
                                <p className="font-medium text-sm break-words">{item.productName}</p>
                                <p className="text-xs text-gray-500 break-all">SKU: {item.sku}</p>
                              </div>
                            </td>
                            <td className="p-2 md:p-3 text-center">
                              <span className="font-semibold">{item.quantity}</span>
                            </td>
                            <td className="p-2 md:p-3 text-center text-sm">{item.location}</td>
                            <td className="p-2 md:p-3 text-center">
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs min-w-[50px] text-center whitespace-nowrap ${
                                  item.status === "완료"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "진행중"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="p-2 md:p-3 text-center">
                              <div>
                                <p className="text-sm whitespace-nowrap">{item.date}</p>
                                <p className="text-xs text-gray-500">{item.time}</p>
                              </div>
                            </td>
                            <td className="p-2 md:p-3">
                              <div className="text-xs">
                                <p className="text-gray-600 break-words">
                                  {item.type === "inbound" ? `공급: ${item.supplier}` : `목적: ${item.destination}`}
                                </p>
                                <p className="text-gray-600">담당: {item.manager}</p>
                                {item.notes && <p className="text-gray-500 mt-1 break-words">{item.notes}</p>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 검색 결과가 없을 때 */}
                  {filteredHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Warehouse className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>검색 결과가 없습니다.</p>
                      <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
                    </div>
                  )}

                  {/* 페이지네이션 */}
                  {filteredHistory.length > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-gray-600 flex-shrink-0">
                        총 {filteredHistory.length}개 중 {historyStartIndex + 1}-
                        {Math.min(historyStartIndex + itemsPerPage, filteredHistory.length)}개 표시
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={historyCurrentPage === 1}
                          onClick={() => handleHistoryPageChange(historyCurrentPage - 1)}
                          className="px-3"
                        >
                          이전
                        </Button>
                        {Array.from({ length: Math.min(historyTotalPages, 5) }, (_, i) => {
                          let page
                          if (historyTotalPages <= 5) {
                            page = i + 1
                          } else if (historyCurrentPage <= 3) {
                            page = i + 1
                          } else if (historyCurrentPage >= historyTotalPages - 2) {
                            page = historyTotalPages - 4 + i
                          } else {
                            page = historyCurrentPage - 2 + i
                          }
                          return (
                            <Button
                              key={page}
                              variant="outline"
                              size="sm"
                              className={`px-3 ${historyCurrentPage === page ? "bg-blue-50 text-blue-600" : ""}`}
                              onClick={() => handleHistoryPageChange(page)}
                            >
                              {page}
                            </Button>
                          )
                        })}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={historyCurrentPage === historyTotalPages}
                          onClick={() => handleHistoryPageChange(historyCurrentPage + 1)}
                          className="px-3"
                        >
                          다음
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex-1 h-screen bg-white">
            <WarehouseSimulation />
          </div>
        )
    }
  }

  // 토스트 표시 함수
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleInboundSubmit = (formData: any) => {
    // AGV에 작업 할당
    const assignedAGV = agvSimulation.assignTaskToAGV("inbound", formData.location || "창고1")

    if (assignedAGV) {
      showToast(`입고 등록 완료 - ${assignedAGV} 할당됨`)
    } else {
      showToast("입고 등록 완료 - 대기 중인 AGV가 없습니다", "error")
    }

    // 패널을 닫지 않고 축소만 함
    setIsPanelCollapsed(true)
  }

  const handleOutboundSubmit = (formData: any) => {
    // AGV에 작업 할당
    const assignedAGV = agvSimulation.assignTaskToAGV("outbound", formData.location || "창고1")

    if (assignedAGV) {
      showToast(`출고 등록 완료 - ${assignedAGV} 할당됨`)
    } else {
      showToast("출고 등록 완료 - 대기 중인 AGV가 없습니다", "error")
    }

    // 패널을 닫지 않고 축소만 함
    setIsPanelCollapsed(true)
  }

  const renderSidePanel = () => {
    if (!sidePanel) return null

    const panelContent =
      sidePanel === "inbound" ? (
        <InboundForm onSubmit={handleInboundSubmit} onClose={closeSidePanel} />
      ) : (
        <OutboundForm onSubmit={handleOutboundSubmit} onClose={closeSidePanel} />
      )

    return (
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl border-l flex transition-all duration-300 z-50 ${
          isPanelCollapsed ? "w-0" : "w-80"
        }`}
      >
        {/* 접기/펼치기 버튼 - 자연스럽게 연결 */}
        <div className="relative">
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-16 bg-white border border-gray-300 shadow-lg hover:bg-gray-50 flex items-center justify-center transition-all duration-300 z-10 ${
              isPanelCollapsed ? "-left-8 rounded-l-lg border-r-0" : "-left-4 rounded-l-full border-r-0"
            }`}
          >
            {isPanelCollapsed ? (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* 패널 내용 */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${isPanelCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">{sidePanel === "inbound" ? "입고 등록" : "출고 등록"}</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">{panelContent}</div>
        </div>
      </div>
    )
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Warehouse className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // Show login form if user is not authenticated
  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  // Show main application if user is authenticated
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 사이드바 */}
      <div className="w-48 bg-white shadow-lg flex flex-col fixed top-0 bottom-0 left-0 z-20 overflow-y-auto">
        {/* 헤더 */}
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-blue-600">SMART WMS</h1>
          <p className="text-xs text-gray-500">창고 관리 시스템</p>
        </div>

        {/* 메뉴 */}
        <div className="flex-1 p-3">
          <nav className="space-y-1">
            <Button
              variant={currentView === "schedule" ? "default" : "ghost"}
              className="w-full justify-start text-sm"
              onClick={handleScheduleClick}
            >
              <Calendar className="w-4 h-4 mr-2" />
              일정
            </Button>

            <Button
              variant={sidePanel === "inbound" ? "default" : "ghost"}
              className="w-full justify-start text-sm"
              onClick={handleInboundClick}
            >
              <PackageOpen className="w-4 h-4 mr-2" />
              입고
            </Button>

            <Button
              variant={sidePanel === "outbound" ? "default" : "ghost"}
              className="w-full justify-start text-sm"
              onClick={handleOutboundClick}
            >
              <TruckIcon className="w-4 h-4 mr-2" />
              출고
            </Button>

            <Button
              variant={currentView === "inventory" ? "default" : "ghost"}
              className="w-full justify-start text-sm"
              onClick={handleInventoryClick}
            >
              <Package className="w-4 h-4 mr-2" />
              재고
            </Button>

            <Button
              variant={currentView === "history" ? "default" : "ghost"}
              className="w-full justify-start text-sm"
              onClick={handleHistoryClick}
            >
              <Warehouse className="w-4 h-4 mr-2" />
              내역
            </Button>
          </nav>
        </div>

        {/* 사용자 정보 및 로그아웃 */}
        <div className="border-t bg-gray-50">
          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-3 h-3 mr-2" />
              로그아웃
            </Button>
          </div>
          <div className="p-3 border-t">
            <p className="text-xs text-gray-600 text-center">
              {user.fullName} @{user.username}
            </p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={`flex-1 ml-48 transition-all duration-300 ${sidePanel && !isPanelCollapsed ? "mr-80" : ""}`}>
        {renderMainContent()}
        {/* 사이드 패널 */}
        {renderSidePanel()}
        {/* 토스트 알림 */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
              toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>

      {/* 모달들 */}
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
        onScheduleDeleted={loadSchedules}
      />
    </div>
  )
}
