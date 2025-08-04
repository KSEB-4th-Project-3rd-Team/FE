"use client"

import React, { useState, useEffect } from 'react';
import { subYears } from 'date-fns';
import { DateRange } from 'react-day-picker';
import DashboardMetrics from './dashboard-metrics';
import InventoryChart from './inventory-chart';
import InOutChart from './inout-chart';
import AmrStatus from './amr-status';
import RecentActivities from './recent-activities';
import { InOutRecord, InventoryItem } from '../utils';
import { Item } from '../item/item-list';

interface UnifiedDashboardProps {
  initialInventoryData: InventoryItem[];
  initialInOutData?: InOutRecord[];
  initialItems?: Item[];
}

export const UnifiedDashboard = React.memo(function UnifiedDashboard({ 
  initialInventoryData, 
  initialInOutData = [], 
  initialItems = [] 
}: UnifiedDashboardProps) {
  const [inventoryData, setInventoryData] = useState(initialInventoryData);
  const [inOutData, setInOutData] = useState(initialInOutData);
  const [items, setItems] = useState(initialItems);

  // 기본 날짜 범위 설정 (기존과 동일)
  useEffect(() => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    // 필요한 초기 설정이 있다면 여기서 처리
  }, []);

  // Props 변경 시 상태 업데이트
  useEffect(() => {
    setInventoryData(initialInventoryData);
  }, [initialInventoryData]);

  useEffect(() => {
    setInOutData(initialInOutData);
  }, [initialInOutData]);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">통합 대시보드</h1>
        <p className="text-gray-600 mt-1">스마트 창고 관리 시스템 현황</p>
      </div>

      {/* 메트릭 카드들 */}
      <DashboardMetrics 
        inventoryData={inventoryData}
        inOutData={inOutData}
        items={items}
      />

      {/* 재고 차트들 */}
      <InventoryChart 
        inventoryData={inventoryData}
        items={items}
      />

      {/* 입출고 차트 */}
      <InOutChart 
        inOutData={inOutData}
      />

      {/* AMR 상태 모니터링 */}
      <AmrStatus />

      {/* 최근 활동 테이블 */}
      <RecentActivities 
        inOutData={inOutData}
      />
    </div>
  );
});