"use client"

import React, { useMemo, useState } from 'react';
import { format, subDays, subMonths, addMonths, startOfMonth, isSameMonth, subYears } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Line, XAxis, YAxis, CartesianGrid, LineChart } from 'recharts';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { InOutRecord } from '../utils';

interface InOutChartProps {
  inOutData: InOutRecord[];
}

const InOutChart = React.memo(function InOutChart({ inOutData }: InOutChartProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // 기간별 입출고 데이터 집계
  const aggregatedData = useMemo(() => {
    const filteredData = inOutData.filter(record => {
      if (!dateRange?.from || !dateRange?.to) return true;
      const recordDate = new Date(record.date);
      return recordDate >= dateRange.from && recordDate <= dateRange.to;
    });

    const dataMap = new Map();
    
    filteredData.forEach(record => {
      let key: string;
      const recordDate = new Date(record.date);
      
      switch (selectedPeriod) {
        case 'week':
          key = format(recordDate, 'yyyy-MM-dd');
          break;
        case 'month':
          key = format(recordDate, 'yyyy-MM-dd');
          break;
        case 'year':
          key = format(recordDate, 'yyyy-MM');
          break;
        default:
          key = format(recordDate, 'yyyy-MM-dd');
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { date: key, inbound: 0, outbound: 0 });
      }

      const entry = dataMap.get(key);
      if (record.type.toLowerCase() === 'inbound') {
        entry.inbound += record.quantity;
      } else {
        entry.outbound += record.quantity;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [inOutData, dateRange, selectedPeriod]);

  const totalInbound = useMemo(() => 
    aggregatedData.reduce((sum, item) => sum + item.inbound, 0), 
    [aggregatedData]
  );

  const totalOutbound = useMemo(() => 
    aggregatedData.reduce((sum, item) => sum + item.outbound, 0), 
    [aggregatedData]
  );

  const quickDateButtons = [
    { label: '지난 7일', onClick: () => setDateRange({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: '지난 30일', onClick: () => setDateRange({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: '지난 3개월', onClick: () => setDateRange({ from: subMonths(new Date(), 3), to: new Date() }) },
    { label: '올해', onClick: () => setDateRange({ from: subYears(new Date(), 1), to: new Date() }) },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle>입출고 현황</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* 빠른 날짜 선택 버튼들 */}
            <div className="flex flex-wrap gap-1">
              {quickDateButtons.map((btn) => (
                <Button
                  key={btn.label}
                  variant="outline"
                  size="sm"
                  onClick={btn.onClick}
                  className="text-xs"
                >
                  {btn.label}
                </Button>
              ))}
            </div>

            {/* 날짜 범위 선택 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MM/dd')} - {format(dateRange.to, 'MM/dd')}
                      </>
                    ) : (
                      format(dateRange.from, 'MM/dd')
                    )
                  ) : (
                    '날짜 선택'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as 'week' | 'month' | 'year')}>
          <TabsList className="mb-4">
            <TabsTrigger value="week">주간</TabsTrigger>
            <TabsTrigger value="month">월간</TabsTrigger>
            <TabsTrigger value="year">연간</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedPeriod}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 입고</p>
                      <p className="text-2xl font-bold text-blue-600">{totalInbound.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 출고</p>
                      <p className="text-2xl font-bold text-red-600">{totalOutbound.toLocaleString()}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">순 증감</p>
                      <p className={`text-2xl font-bold ${totalInbound - totalOutbound >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(totalInbound - totalOutbound).toLocaleString()}
                      </p>
                    </div>
                    {totalInbound - totalOutbound >= 0 ? 
                      <TrendingUp className="h-8 w-8 text-green-600" /> : 
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {aggregatedData.length > 0 ? (
              <ChartContainer
                config={{
                  inbound: { label: '입고', color: '#3b82f6' },
                  outbound: { label: '출고', color: '#ef4444' },
                }}
                className="h-[400px] w-full"
              >
                <LineChart data={aggregatedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      if (selectedPeriod === 'year') {
                        return format(new Date(value + '-01'), 'yyyy-MM');
                      }
                      return format(new Date(value), 'MM/dd');
                    }}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="inbound"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="입고"
                  />
                  <Line
                    type="monotone"
                    dataKey="outbound"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                    name="출고"
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                선택한 기간에 데이터가 없습니다
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

export default InOutChart;