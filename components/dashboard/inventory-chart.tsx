"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { InventoryItem } from '../utils';
import { Item } from '../item/item-list';

interface InventoryChartProps {
  inventoryData: InventoryItem[];
  items?: Item[];
}

// Helper function to format numbers with commas
const formatNumber = (num: number) => num.toLocaleString();

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF6B6B', '#8884D8', '#82CA9D'];

const InventoryChart = React.memo(function InventoryChart({ inventoryData, items = [] }: InventoryChartProps) {
  const inventoryByCategory = useMemo(() => {
    const categoryMap = new Map();
    
    inventoryData.forEach(inventoryItem => {
      // InventoryItem의 location을 카테고리로 사용
      const category = inventoryItem.location || '기타';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { name: category, value: 0, count: 0 });
      }
      const existing = categoryMap.get(category);
      
      // SKU로 매칭해서 실제 출고단가 찾기
      const matchedItem = items.find(item => item.itemCode === inventoryItem.sku);
      const unitPrice = matchedItem ? matchedItem.unitPriceOut : 0;
      
      // 실제 가치 계산 (수량 × 출고단가)
      existing.value += inventoryItem.quantity * unitPrice;
      existing.count += 1;
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [inventoryData, items]);

  const stockStatusData = useMemo(() => [
    {
      name: '정상 재고',
      value: inventoryData.filter(item => item.quantity >= 10 && item.quantity > 0).length,
      color: '#00C49F'
    },
    {
      name: '재고 부족', 
      value: inventoryData.filter(item => item.quantity < 10 && item.quantity > 0).length,
      color: '#FFBB28'
    },
    {
      name: '재고 없음',
      value: inventoryData.filter(item => item.quantity === 0).length,
      color: '#FF6B6B'
    }
  ], [inventoryData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 재고 가치</CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryByCategory.length > 0 ? (
            <ChartContainer
              config={{}}
              className="h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={inventoryByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [`₩${formatNumber(Number(value))}`, name]}
                  />}
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>재고 상태 분포</CardTitle>
        </CardHeader>
        <CardContent>
          {stockStatusData.some(item => item.value > 0) ? (
            <ChartContainer
              config={{}}
              className="h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [`${value}개`, name]}
                  />}
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default InventoryChart;