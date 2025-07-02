"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Package,
  PackageOpen,
  Warehouse,
  Truck,
  TruckIcon,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

type ViewType = "simulation" | "schedule" | "inventory" | "history"
type SidePanelType = "inbound" | "outbound" | null

export default function WMSSystem() {
  const [currentView, setCurrentView] = useState<ViewType>("simulation")
  const [sidePanel, setSidePanel] = useState<SidePanelType>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const handleScheduleClick = () => {
    setCurrentView("schedule")
    setSidePanel(null)
  }

  const handleInventoryClick = () => {
    setCurrentView("inventory")
    setSidePanel(null)
  }

  const handleInboundClick = () => {
    setCurrentView("simulation")
    setSidePanel("inbound")
  }

  const handleOutboundClick = () => {
    setCurrentView("simulation")
    setSidePanel("outbound")
  }

  const handleHistoryClick = () => {
    setCurrentView("history")
    setSidePanel(null)
  }

  const closeSidePanel = () => {
    setSidePanel(null)
  }

  // 캘린더 관련 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

    // 빈 칸들 추가
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // 날짜들 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = day === 15 || day === 20 || day === 25 // 예시 이벤트
      days.push(
        <div key={day} className="h-24 border border-gray-200 p-1">
          <div className="font-semibold text-sm">{day}</div>
          {hasEvent && (
            <div className="mt-1 space-y-1">
              {day === 15 && <div className="text-xs bg-blue-100 text-blue-800 px-1 rounded">입고작업</div>}
              {day === 20 && <div className="text-xs bg-red-100 text-red-800 px-1 rounded">출고작업</div>}
              {day === 25 && <div className="text-xs bg-green-100 text-green-800 px-1 rounded">재고정리</div>}
            </div>
          )}
        </div>,
      )
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </h3>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
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
      case "schedule":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">일정 관리</h2>
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
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span>입고 작업 - A구역</span>
                      <span className="text-sm text-gray-600">09:00 - 11:00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>출고 작업 - B구역</span>
                      <span className="text-sm text-gray-600">13:00 - 15:00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span>재고 정리 - C구역</span>
                      <span className="text-sm text-gray-600">16:00 - 17:00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "inventory":
        return (
          <div className="p-6">
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
            </div>
          </div>
        )
      case "history":
        return (
          <div className="p-6">
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

              {/* 내역 리스트 */}
              <Card>
                <CardHeader>
                  <CardTitle>최근 입출고 내역</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div>
                        <span className="font-semibold">입고</span>
                        <p className="text-sm text-gray-600">노트북 - 50개</p>
                        <p className="text-xs text-gray-500">담당자: 김철수</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">A구역</p>
                        <p className="text-xs text-gray-500">2024-01-15 09:30</p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">완료</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div>
                        <span className="font-semibold">출고</span>
                        <p className="text-sm text-gray-600">마우스 - 30개</p>
                        <p className="text-xs text-gray-500">담당자: 이영희</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">B구역</p>
                        <p className="text-xs text-gray-500">2024-01-15 14:20</p>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">진행중</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div>
                        <span className="font-semibold">입고</span>
                        <p className="text-sm text-gray-600">키보드 - 25개</p>
                        <p className="text-xs text-gray-500">담당자: 박민수</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">C구역</p>
                        <p className="text-xs text-gray-500">2024-01-14 16:45</p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">완료</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Truck className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">AGV 시뮬레이션 영역</h3>
              <p className="text-gray-500">AGV 시뮬레이션이 여기에 표시됩니다</p>
            </div>
          </div>
        )
    }
  }

  const renderSidePanel = () => {
    if (!sidePanel) return null

    const panelContent =
      sidePanel === "inbound" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">입고 등록</h3>
            <Button variant="ghost" size="sm" onClick={closeSidePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <Label htmlFor="product-name">상품명</Label>
            <Input id="product-name" placeholder="상품명을 입력하세요" />
          </div>
          <div>
            <Label htmlFor="quantity">수량</Label>
            <Input id="quantity" type="number" placeholder="수량을 입력하세요" />
          </div>
          <div>
            <Label htmlFor="location">보관 위치</Label>
            <Input id="location" placeholder="보관 위치를 입력하세요" />
          </div>
          <div>
            <Label htmlFor="notes">비고</Label>
            <Textarea id="notes" placeholder="추가 정보를 입력하세요" />
          </div>
          <Button className="w-full">입고 등록</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">출고 등록</h3>
            <Button variant="ghost" size="sm" onClick={closeSidePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <Label htmlFor="out-product-name">상품명</Label>
            <Input id="out-product-name" placeholder="출고할 상품명을 입력하세요" />
          </div>
          <div>
            <Label htmlFor="out-quantity">출고 수량</Label>
            <Input id="out-quantity" type="number" placeholder="출고 수량을 입력하세요" />
          </div>
          <div>
            <Label htmlFor="destination">목적지</Label>
            <Input id="destination" placeholder="목적지를 입력하세요" />
          </div>
          <div>
            <Label htmlFor="out-notes">비고</Label>
            <Textarea id="out-notes" placeholder="추가 정보를 입력하세요" />
          </div>
          <Button className="w-full">출고 등록</Button>
        </div>
      )

    return (
      <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg border-l flex flex-col animate-in slide-in-from-right duration-300 z-10">
        <div className="p-4 flex-1">{panelContent}</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 */}
      <div className="w-48 bg-white shadow-lg flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-blue-600">AGV WMS</h1>
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

        {/* 푸터 */}
        <div className="p-3 border-t bg-gray-50">
          <p className="text-xs text-gray-600 text-center">KSEB 3조</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col relative">
        {renderMainContent()}
        {/* 사이드 패널 */}
        {renderSidePanel()}
      </div>
    </div>
  )
}
