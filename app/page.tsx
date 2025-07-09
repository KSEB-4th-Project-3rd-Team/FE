"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Package,
  Warehouse,
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building2,
  Box,
  BarChart3,
  Settings,
  FileText,
  Search,
} from "lucide-react"
import { authService, type User } from "@/lib/auth"
import { scheduleService, type Schedule } from "@/lib/schedule"
import AuthForm from "@/components/auth/auth-form"
import ScheduleModal from "@/components/schedule/schedule-modal"
import DayDetailModal from "@/components/schedule/day-detail-modal"
import CalendarHeader from "@/components/schedule/calendar-header"
import WarehouseSimulation from "@/components/simulation/warehouse-simulation"
import InboundForm from "@/components/forms/inbound-form"
import OutboundForm from "@/components/forms/outbound-form"
import CompanyList from "@/components/company/company-list"
import ItemList from "@/components/item/item-list"
import InOutRequestPage from "@/components/inout/inout-request"
import InventoryManagement from "@/components/inventory/inventory-management"
import InOutHistory from "@/components/inout/inout-history"
import InOutStatus from "@/components/inout/inout-status"
import RealTimeDashboard from "@/components/dashboard/real-time-dashboard"
import UserManagement from "@/components/admin/user-management"
import SystemSettings from "@/components/admin/system-settings"
import ReportsAnalytics from "@/components/reports/reports-analytics"
import NotificationCenter from "@/components/notifications/notification-center"
import GlobalSearch from "@/components/search/global-search"

// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수 (시간대 문제 해결)
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type ViewType =
  | "simulation"
  | "dashboard"
  | "schedule"
  | "inventory"
  | "history"
  | "company-list"
  | "item-list"
  | "inout-status"
  | "inout-history"
  | "inout-request"
  | "user-management"
  | "system-settings"
  | "reports"
  | "notifications"

type SidePanelType = "inbound" | "outbound" | null

export default function WMSSystem() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [sidePanel, setSidePanel] = useState<SidePanelType>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)

  // 네비게이션 확장 상태
  const [expandedMenus, setExpandedMenus] = useState<{
    basicInfo: boolean
    inoutManagement: boolean
    inventoryManagement: boolean
    systemManagement: boolean
  }>({
    basicInfo: false,
    inoutManagement: false,
    inventoryManagement: false,
    systemManagement: false,
  })

  useEffect(() => {
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
    setCurrentView("dashboard")
    setSidePanel(null)
  }

  const toggleMenu = (menu: keyof typeof expandedMenus) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const handleMenuClick = (view: ViewType, panelType?: SidePanelType) => {
    setCurrentView(view)
    setSidePanel(panelType || null)
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

  const renderMainContent = () => {
    switch (currentView) {
      case "dashboard":
        return <RealTimeDashboard />
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
      case "company-list":
        return <CompanyList />
      case "item-list":
        return <ItemList />
      case "inout-request":
        return <InOutRequestPage />
      case "inout-status":
        return <InOutStatus />
      case "inout-history":
        return <InOutHistory />
      case "inventory":
        return <InventoryManagement />
      case "user-management":
        return <UserManagement />
      case "system-settings":
        return <SystemSettings />
      case "reports":
        return <ReportsAnalytics />
      case "notifications":
        return <NotificationCenter />
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
    showToast("입고 등록이 완료되었습니다.")
    setIsPanelCollapsed(true)
  }

  const handleOutboundSubmit = (formData: any) => {
    showToast("출고 등록이 완료되었습니다.")
    setIsPanelCollapsed(true)
  }

  const PANEL_WIDTH = 320

  const renderSidePanel = () => {
    if (!sidePanel) return null

    const panelContent =
      sidePanel === "inbound" ? (
        <InboundForm onSubmit={handleInboundSubmit} onClose={closeSidePanel} />
      ) : (
        <OutboundForm onSubmit={handleOutboundSubmit} onClose={closeSidePanel} />
      )

    return (
      <>
        {/* 사이드 패널 */}
        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-2xl border-l transition-all duration-300 z-40 overflow-hidden`}
          style={{
            width: isPanelCollapsed ? 0 : PANEL_WIDTH,
          }}
        >
          <div
            className={`h-full flex flex-col transition-opacity duration-300 ${
              isPanelCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">{sidePanel === "inbound" ? "입고 등록" : "출고 등록"}</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">{panelContent}</div>
          </div>
        </div>

        {/* 접기/펼치기 버튼 - 입출고 관리 페이지에서만 표시 */}
        {(currentView === "simulation" || sidePanel) && (
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            style={{
              position: "fixed",
              top: "50%",
              right: isPanelCollapsed ? 0 : PANEL_WIDTH,
              transform: "translateY(-50%)",
              zIndex: 50,
              boxShadow: "none",
              border: "1px solid #d1d5db",
              background: "#fff",
            }}
            className="w-8 h-14 flex items-center justify-center rounded-l-full transition-all duration-300"
          >
            {isPanelCollapsed ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Warehouse className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
              <div className="w-16 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 font-medium">시스템 로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="w-64 bg-white shadow-xl flex flex-col fixed top-0 bottom-0 left-0 z-20 overflow-y-auto border-r border-gray-200">
        {/* 헤더 */}
        <div
          className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600"
          style={{ height: "120px" }}
        >
          <div
            className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity h-full"
            onClick={() => handleMenuClick("dashboard")}
          >
            <img
              src="/images/smart-wms-logo.png"
              alt="Smart WMS Logo"
              className="h-full w-full object-contain filter brightness-0 invert"
            />
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="flex-1 p-3">
          <nav className="space-y-1">
            {/* 대시보드 */}
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start text-sm hover:bg-blue-50 hover:text-blue-700"
              onClick={() => handleMenuClick("dashboard")}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span>대시보드</span>
              </div>
            </Button>

            {/* 일정 */}
            <Button
              variant={currentView === "schedule" ? "default" : "ghost"}
              className="w-full justify-start text-sm hover:bg-blue-50 hover:text-blue-700"
              onClick={() => handleMenuClick("schedule")}
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>일정 관리</span>
              </div>
            </Button>

            {/* AGV 시뮬레이션 */}
            <Button
              variant={currentView === "simulation" ? "default" : "ghost"}
              className="w-full justify-start text-sm hover:bg-blue-50 hover:text-blue-700"
              onClick={() => handleMenuClick("simulation")}
            >
              <div className="flex items-center">
                <Warehouse className="w-4 h-4 mr-2" />
                <span>AGV 시뮬레이션</span>
              </div>
            </Button>

            {/* 기초 정보 */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm hover:bg-blue-50 hover:text-blue-700"
                onClick={() => toggleMenu("basicInfo")}
              >
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  <span>기초 정보</span>
                </div>
                {expandedMenus.basicInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              {expandedMenus.basicInfo && (
                <div className="ml-6 mt-1 space-y-1">
                  <Button
                    variant={currentView === "company-list" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("company-list")}
                  >
                    <span className="mr-2">•</span>
                    거래처 관리
                  </Button>
                  <Button
                    variant={currentView === "item-list" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("item-list")}
                  >
                    <span className="mr-2">•</span>
                    품목 관리
                  </Button>
                </div>
              )}
            </div>

            {/* 입/출고 관리 */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm hover:bg-blue-50 hover:text-blue-700"
                onClick={() => toggleMenu("inoutManagement")}
              >
                <div className="flex items-center">
                  <Box className="w-4 h-4 mr-2" />
                  <span>입/출고 관리</span>
                </div>
                {expandedMenus.inoutManagement ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              {expandedMenus.inoutManagement && (
                <div className="ml-6 mt-1 space-y-1">
                  <Button
                    variant={currentView === "simulation" && sidePanel === "inbound" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("simulation", "inbound")}
                  >
                    <span className="mr-2">•</span>
                    입고 등록
                  </Button>
                  <Button
                    variant={currentView === "simulation" && sidePanel === "outbound" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("simulation", "outbound")}
                  >
                    <span className="mr-2">•</span>
                    출고 등록
                  </Button>
                  <Button
                    variant={currentView === "inout-status" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("inout-status")}
                  >
                    <span className="mr-2">•</span>
                    입출고 현황
                  </Button>
                  <Button
                    variant={currentView === "inout-history" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("inout-history")}
                  >
                    <span className="mr-2">•</span>
                    입출고 내역
                  </Button>
                  <Button
                    variant={currentView === "inout-request" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("inout-request")}
                  >
                    <span className="mr-2">•</span>
                    입출고 요청
                  </Button>
                </div>
              )}
            </div>

            {/* 재고 관리 */}
            <Button
              variant={currentView === "inventory" ? "default" : "ghost"}
              className="w-full justify-start text-sm hover:bg-blue-50 hover:text-blue-700"
              onClick={() => handleMenuClick("inventory")}
            >
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                <span>재고 관리</span>
              </div>
            </Button>

            {/* 보고서 및 분석 */}
            <Button
              variant={currentView === "reports" ? "default" : "ghost"}
              className="w-full justify-start text-sm hover:bg-blue-50 hover:text-blue-700"
              onClick={() => handleMenuClick("reports")}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                <span>보고서 및 분석</span>
              </div>
            </Button>

            {/* 시스템 관리 */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm hover:bg-blue-50 hover:text-blue-700"
                onClick={() => toggleMenu("systemManagement")}
              >
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>시스템 관리</span>
                </div>
                {expandedMenus.systemManagement ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              {expandedMenus.systemManagement && (
                <div className="ml-6 mt-1 space-y-1">
                  <Button
                    variant={currentView === "user-management" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("user-management")}
                  >
                    <span className="mr-2">•</span>
                    사용자 관리
                  </Button>
                  <Button
                    variant={currentView === "system-settings" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("system-settings")}
                  >
                    <span className="mr-2">•</span>
                    시스템 설정
                  </Button>
                  <Button
                    variant={currentView === "notifications" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleMenuClick("notifications")}
                  >
                    <span className="mr-2">•</span>
                    알림 센터
                    {notificationCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* 하단 액션 */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-3 space-y-2">
            {/* 전역 검색 */}
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center text-sm bg-white hover:bg-gray-50"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              전역 검색
            </Button>

            {/* 로그아웃 */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={`flex-1 ml-64 transition-all duration-300 ${sidePanel && !isPanelCollapsed ? "mr-80" : ""}`}>
        {renderMainContent()}
        {/* 사이드 패널 */}
        {renderSidePanel()}

        {/* 토스트 알림 */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 transition-all duration-300 min-w-[300px]">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-gray-800 font-medium flex-1">{toast.message}</span>
              <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 전역 검색 모달 */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

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
