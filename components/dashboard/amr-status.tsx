"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Activity, AlertCircle } from 'lucide-react';

// AMR 타입 정의 (기존과 동일)
type AmrStatus = "moving" | "charging" | "idle" | "error";
interface Amr { 
  id: string; 
  name: string; 
  status: AmrStatus; 
  battery: number; 
  location: string; 
  currentTask: string | null; 
}

// Mock 데이터 (기존과 동일)
const mockAmrData: Amr[] = [
  { id: "AMR-001", name: "Pioneer 1", status: "moving", battery: 82, location: "A-3", currentTask: "Order #1234" },
  { id: "AMR-002", name: "Pioneer 2", status: "charging", battery: 34, location: "Charging Bay 1", currentTask: null },
  { id: "AMR-003", name: "Scout 1", status: "idle", battery: 95, location: "Home Base", currentTask: null },
  { id: "AMR-004", name: "Pioneer 3", status: "moving", battery: 65, location: "B-1", currentTask: "Order #1235" },
  { id: "AMR-005", name: "Scout 2", status: "error", battery: 5, location: "C-4", currentTask: "Order #1236" },
];

// 상태별 스타일 설정 (기존과 동일)
const getStatusStyle = (status: AmrStatus) => {
  switch (status) {
    case "moving": return { bg: "bg-blue-100", text: "text-blue-800", label: "이동 중" };
    case "charging": return { bg: "bg-yellow-100", text: "text-yellow-800", label: "충전 중" };
    case "idle": return { bg: "bg-green-100", text: "text-green-800", label: "대기" };
    case "error": return { bg: "bg-red-100", text: "text-red-800", label: "오류" };
    default: return { bg: "bg-gray-100", text: "text-gray-800", label: "알 수 없음" };
  }
};

// 배터리 색상 설정 (기존과 동일)
const getBatteryColor = (battery: number) => {
  if (battery > 60) return "text-green-600";
  if (battery > 30) return "text-yellow-600";
  return "text-red-600";
};

const AmrStatus = React.memo(function AmrStatus() {
  const activeAmrs = mockAmrData.filter(amr => amr.status === "moving").length;
  const totalAmrs = mockAmrData.length;
  const avgBattery = Math.round(mockAmrData.reduce((sum, amr) => sum + amr.battery, 0) / mockAmrData.length);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AMR 상태 모니터링
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">활성 AMR</p>
                  <p className="text-2xl font-bold text-blue-600">{activeAmrs}/{totalAmrs}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">평균 배터리</p>
                  <p className={`text-2xl font-bold ${getBatteryColor(avgBattery)}`}>{avgBattery}%</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">오류 상태</p>
                  <p className="text-2xl font-bold text-red-600">
                    {mockAmrData.filter(amr => amr.status === "error").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAmrData.map((amr) => {
            const statusStyle = getStatusStyle(amr.status);
            return (
              <Card key={amr.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{amr.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>ID:</span>
                      <span className="font-mono">{amr.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>배터리:</span>
                      <span className={`font-semibold ${getBatteryColor(amr.battery)}`}>
                        {amr.battery}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>위치:</span>
                      <span className="font-medium">{amr.location}</span>
                    </div>
                    {amr.currentTask && (
                      <div className="flex justify-between">
                        <span>작업:</span>
                        <span className="font-medium text-blue-600">{amr.currentTask}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

export default AmrStatus;