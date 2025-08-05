"use client"

import React from 'react';
import DashboardMetrics from './dashboard-metrics';
import InventoryChart from './inventory-chart';
import InOutChart from './inout-chart';
import AmrStatus from './amr-status';

import { DashboardData } from '@/lib/api'; // 통합 데이터 타입 import
import { InOutRecord, InventoryItem } from '../utils'; // 변환된 데이터 타입
import { useMemo } from 'react';
import { Item } from '../item/item-list';

interface UnifiedDashboardProps {
  dashboardData: DashboardData;
}

// 백엔드 API 응답을 프론트엔드 컴포넌트 타입으로 변환하는 로직
const transformInventoryData = (data: DashboardData): InventoryItem[] => {
  if (!data.inventory || !data.items) return [];
  return data.inventory.map((inv, index) => {
    const itemInfo = data.items.find(i => i.itemId === inv.itemId);
    return {
      id: index + 1,
      name: inv.itemName,
      sku: itemInfo?.itemCode || `SKU-${inv.itemId}`,
      specification: itemInfo?.spec || 'N/A',
      quantity: inv.quantity,
      inboundScheduled: 0, // 필요 시 계산 로직 추가
      outboundScheduled: 0, // 필요 시 계산 로직 추가
      location: inv.locationCode,
      status: inv.quantity > 10 ? '정상' : (inv.quantity > 0 ? '부족' : '위험'),
      lastUpdate: new Date(inv.lastUpdated).toLocaleString('ko-KR'),
    };
  });
};

const transformInOutData = (data: DashboardData): InOutRecord[] => {
  if (!data.orders) return [];
  return data.orders
    .filter(order => order.status === 'COMPLETED')
    .flatMap(order => 
      order.items.map((item, itemIndex) => ({
        id: `${order.orderId}-${itemIndex}`,
        type: order.type.toLowerCase() as 'inbound' | 'outbound',
        productName: item.itemName,
        sku: item.itemCode,
        individualCode: `ORDER-${order.orderId}-${item.itemId}`,
        specification: item.specification,
        quantity: item.requestedQuantity,
        location: 'A-01', // 예시 위치
        company: order.companyName,
        companyCode: order.companyCode,
        status: '완료',
        destination: 'N/A',
        date: order.updatedAt.split('T')[0],
        time: order.updatedAt.split('T')[1]?.substring(0, 8) || '00:00:00',
        notes: 'N/A',
      }))
    );
};

const transformItems = (data: DashboardData): Item[] => {
    if (!data.items) return [];
    return data.items.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      itemGroup: item.itemGroup,
      spec: item.spec,
      unit: item.unit,
      unitPriceIn: item.unitPriceIn,
      unitPriceOut: item.unitPriceOut,
      createdAt: item.createdAt,
    }));
  };


export const UnifiedDashboard = React.memo(function UnifiedDashboard({ dashboardData }: UnifiedDashboardProps) {
  
  // API 데이터를 프론트엔드 컴포넌트가 사용하는 형태로 변환
  const inventoryData = useMemo(() => transformInventoryData(dashboardData), [dashboardData]);
  const inOutData = useMemo(() => transformInOutData(dashboardData), [dashboardData]);
  const items = useMemo(() => transformItems(dashboardData), [dashboardData]);

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
    </div>
  );
});

UnifiedDashboard.displayName = 'UnifiedDashboard';
