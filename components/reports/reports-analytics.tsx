"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  TruckIcon,
  BarChart3,
  PieChart,
  Activity,
  Users,
} from "lucide-react"

export default function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  })

  const [selectedReport, setSelectedReport] = useState("inventory")

  // 더미 데이터
  interface TopItem {
  name: string;
  quantity: number;
  value: number;
}

interface MonthlyTrend {
  month: string;
  inbound: number;
  outbound: number;
}

const analyticsData: {
  inventory: {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
    turnoverRate: number;
    topItems: TopItem[];
  };
  inout: {
    totalInbound: number;
    totalOutbound: number;
    pendingRequests: number;
    completionRate: number;
    avgProcessingTime: number;
    monthlyTrend: MonthlyTrend[];
  };
  agv: {
    totalAGVs: number;
    activeAGVs: number;
    efficiency: number;
    totalDistance: number;
    avgBatteryLevel: number;
    taskCompletion: number;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    loginRate: number;
    avgSessionTime: number;
  };
} = {
  inventory: {
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    turnoverRate: 0,
    topItems: [],
  },
  inout: {
    totalInbound: 0,
    totalOutbound: 0,
    pendingRequests: 0,
    completionRate: 0,
    avgProcessingTime: 0,
    monthlyTrend: [],
  },
  agv: {
    totalAGVs: 0,
    activeAGVs: 0,
    efficiency: 0,
    totalDistance: 0,
    avgBatteryLevel: 0,
    taskCompletion: 0,
  },
  users: {
    totalUsers: 0,
    activeUsers: 0,
    loginRate: 0,
    avgSessionTime: 0,
  },
};

  const reportTypes = [
    { id: "inventory", name: "재고 분석", icon: Package },
    { id: "inout", name: "입출고 분석", icon: TruckIcon },
    { id: "agv", name: "AGV 성능", icon: Activity },
    { id: "users", name: "사용자 활동", icon: Users },
  ]

  const handleExportReport = (format: string) => {
    // 보고서 내보내기 로직
    alert(`${format} 형식으로 보고서를 내보냅니다.`)
  }

  const renderInventoryReport = () => (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 품목 수</p>
                <p className="text-2xl font-bold">{analyticsData.inventory.totalItems.toLocaleString()}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">재고 부족</p>
                <p className="text-2xl font-bold text-yellow-600">{analyticsData.inventory.lowStockItems}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">품절</p>
                <p className="text-2xl font-bold text-red-600">{analyticsData.inventory.outOfStockItems}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 재고 가치</p>
                <p className="text-2xl font-bold text-green-600">
                  {(analyticsData.inventory.totalValue / 1000000).toFixed(1)}M원
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상위 재고 품목</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.inventory.topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.value.toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInOutReport = () => (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 입고</p>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.inout.totalInbound}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 출고</p>
                <p className="text-2xl font-bold text-red-600">{analyticsData.inout.totalOutbound}</p>
              </div>
              <TruckIcon className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">완료율</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData.inout.completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 처리시간</p>
                <p className="text-2xl font-bold">{analyticsData.inout.avgProcessingTime}h</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>월별 입출고 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">차트 라이브러리 연동 시 표시됩니다</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAGVReport = () => (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 AGV</p>
                <p className="text-2xl font-bold">{analyticsData.agv.totalAGVs}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 AGV</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData.agv.activeAGVs}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">효율성</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.agv.efficiency}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">작업 완료율</p>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.agv.taskCompletion}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AGV 성능 지표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>총 이동 거리</span>
                <span className="font-semibold">{analyticsData.agv.totalDistance.toLocaleString()}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span>평균 배터리 레벨</span>
                <span className="font-semibold">{analyticsData.agv.avgBatteryLevel}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>작업 완료율</span>
                <span className="font-semibold">{analyticsData.agv.taskCompletion}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AGV 상태 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">파이 차트 표시 영역</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderUserReport = () => (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 사용자</p>
                <p className="text-2xl font-bold">{analyticsData.users.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData.users.activeUsers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">로그인율</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.users.loginRate}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 세션시간</p>
                <p className="text-2xl font-bold">{analyticsData.users.avgSessionTime}h</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderReportContent = () => {
    switch (selectedReport) {
      case "inventory":
        return renderInventoryReport()
      case "inout":
        return renderInOutReport()
      case "agv":
        return renderAGVReport()
      case "users":
        return renderUserReport()
      default:
        return renderInventoryReport()
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">보고서 및 분석</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport("PDF")}>
            <Download className="w-4 h-4 mr-2" />
            PDF 내보내기
          </Button>
          <Button variant="outline" onClick={() => handleExportReport("Excel")}>
            <Download className="w-4 h-4 mr-2" />
            Excel 내보내기
          </Button>
        </div>
      </div>

      {/* 필터 및 설정 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            보고서 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="startDate">시작일:</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="endDate">종료일:</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 보고서 타입 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedReport === type.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedReport(type.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon
                  className={`w-8 h-8 mx-auto mb-2 ${selectedReport === type.id ? "text-blue-600" : "text-gray-500"}`}
                />
                <p className={`font-medium ${selectedReport === type.id ? "text-blue-600" : "text-gray-700"}`}>
                  {type.name}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 보고서 내용 */}
      {renderReportContent()}
    </div>
  )
}
