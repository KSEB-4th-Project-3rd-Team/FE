"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, AlertTriangle, XCircle, Archive, Truck, Clock, CalendarCheck } from 'lucide-react';
import { InOutRecord, InventoryItem } from '../utils';
import { Item } from '../item/item-list';

interface DashboardMetricsProps {
  inventoryData: InventoryItem[];
  inOutData: InOutRecord[];
  items?: Item[];
}

type MetricItem = {
  id: string;
  title: string;
  value: number | string;
  icon: React.ElementType;
  items: (InventoryItem | InOutRecord)[];
};

// Helper function to format numbers with commas
const formatNumber = (num: number) => num.toLocaleString();

const DashboardMetrics = React.memo(function DashboardMetrics({ inventoryData, inOutData, items = [] }: DashboardMetricsProps) {
  const metricsData: MetricItem[] = useMemo(() => [
    {
      id: "total-items",
      title: "전체 품목 수",
      value: inventoryData.length,
      icon: Package,
      items: inventoryData,
    },
    {
      id: "low-stock",
      title: "재고 부족",
      value: inventoryData.filter(item => item.quantity < 10).length, // 임계값 10으로 설정
      icon: AlertTriangle,
      items: inventoryData.filter(item => item.quantity < 10),
    },
    {
      id: "out-of-stock",
      title: "재고 없음",
      value: inventoryData.filter(item => item.quantity === 0).length,
      icon: XCircle,
      items: inventoryData.filter(item => item.quantity === 0),
    },
    {
      id: "in-stock",
      title: "정상 재고",
      value: inventoryData.filter(item => item.quantity >= 10 && item.quantity > 0).length,
      icon: CheckCircle,
      items: inventoryData.filter(item => item.quantity >= 10 && item.quantity > 0),
    },
    {
      id: "total-value",
      title: "총 재고 가치",
      value: `₩${formatNumber(inventoryData.reduce((sum, inventoryItem) => {
        // SKU로 매칭해서 실제 단가 찾기
        const matchedItem = items.find(item => item.itemCode === inventoryItem.sku);
        const unitPrice = matchedItem ? matchedItem.unitPriceOut : 0;
        return sum + (inventoryItem.quantity * unitPrice);
      }, 0))}`,
      icon: Archive,
      items: inventoryData,
    },
    {
      id: "pending-inbound",
      title: "대기 중인 입고",
      value: inOutData.filter(record => record.type.toLowerCase() === 'inbound' && record.status === '진행 중').length,
      icon: Truck,
      items: inOutData.filter(record => record.type.toLowerCase() === 'inbound' && record.status === '진행 중'),
    },
    {
      id: "pending-outbound",
      title: "대기 중인 출고",
      value: inOutData.filter(record => record.type.toLowerCase() === 'outbound' && record.status === '진행 중').length,
      icon: Clock,
      items: inOutData.filter(record => record.type.toLowerCase() === 'outbound' && record.status === '진행 중'),
    },
    {
      id: "completed-today",
      title: "오늘 완료된 작업",
      value: inOutData.filter(record => {
        const today = new Date().toISOString().split('T')[0];
        return record.date === today && record.status === '완료';
      }).length,
      icon: CalendarCheck,
      items: inOutData.filter(record => {
        const today = new Date().toISOString().split('T')[0];
        return record.date === today && record.status === '완료';
      }),
    },
  ], [inventoryData, inOutData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricsData.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

export default DashboardMetrics;