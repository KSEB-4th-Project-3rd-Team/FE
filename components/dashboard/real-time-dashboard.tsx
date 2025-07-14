"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  TruckIcon,
  AlertTriangle,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

export default function RealTimeDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 실시간 데이터 시뮬레이션
  interface Alert {
  id: number;
  type: "warning" | "info" | "error";
  message: string;
  time: string;
}

const dashboardData: {
  inventory: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    trend: string;
  };
  operations: {
    todayInbound: number;
    todayOutbound: number;
    pending: number;
    completed: number;
    inboundTrend: string;
    outboundTrend: string;
  };
  agv: {
    total: number;
    active: number;
    charging: number;
    maintenance: number;
    efficiency: number;
  };
  alerts: Alert[];
} = {
  inventory: {
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    trend: "0%",
  },
  operations: {
    todayInbound: 0,
    todayOutbound: 0,
    pending: 0,
    completed: 0,
    inboundTrend: "0%",
    outboundTrend: "0%",
  },
  agv: {
    total: 0,
    active: 0,
    charging: 0,
    maintenance: 0,
    efficiency: 0,
  },
  alerts: [],
};

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">실시간 대시보드</h2>
        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
          실시간: {formatTime(currentTime)}
        </div>
      </div>

      <div className="grid gap-6">
        {/* 주요 지표 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 재고</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardData.inventory.total.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {dashboardData.inventory.trend}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">오늘 입고</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardData.operations.todayInbound}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {dashboardData.operations.inboundTrend}
                  </p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">오늘 출고</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardData.operations.todayOutbound}</p>
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {dashboardData.operations.outboundTrend}
                  </p>
                </div>
                <TruckIcon className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AGV 효율성</p>
                  <p className="text-2xl font-bold text-purple-600">{dashboardData.agv.efficiency}%</p>
                  <p className="text-xs text-green-600">정상 운영</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상세 현황 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 재고 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                재고 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">정상 재고</span>
                  </div>
                  <span className="font-bold text-green-600">{dashboardData.inventory.inStock.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">부족 재고</span>
                  </div>
                  <span className="font-bold text-yellow-600">{dashboardData.inventory.lowStock}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">품절</span>
                  </div>
                  <span className="font-bold text-red-600">{dashboardData.inventory.outOfStock}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AGV 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                AGV 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">활동 중</span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {dashboardData.agv.active}/{dashboardData.agv.total}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">충전 중</span>
                  </div>
                  <span className="font-bold text-purple-600">{dashboardData.agv.charging}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">정비 중</span>
                  </div>
                  <span className="font-bold text-gray-600">{dashboardData.agv.maintenance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 작업 현황 및 알림 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 작업 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5" />
                오늘 작업 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">완료</span>
                  </div>
                  <span className="font-bold text-green-600">{dashboardData.operations.completed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">대기 중</span>
                  </div>
                  <span className="font-bold text-yellow-600">{dashboardData.operations.pending}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(dashboardData.operations.completed / (dashboardData.operations.completed + dashboardData.operations.pending)) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 text-center">
                  완료율:{" "}
                  {Math.round(
                    (dashboardData.operations.completed /
                      (dashboardData.operations.completed + dashboardData.operations.pending)) *
                      100,
                  )}
                  %
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 실시간 알림 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                실시간 알림
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === "error"
                        ? "bg-red-50 border-red-500"
                        : alert.type === "warning"
                          ? "bg-yellow-50 border-yellow-500"
                          : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 실시간 차트 영역 */}
        <Card>
          <CardHeader>
            <CardTitle>실시간 작업량 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">실시간 차트 데이터</p>
                <p className="text-sm text-gray-500">차트 라이브러리 연동 시 표시됩니다</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
