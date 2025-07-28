
"use client"

export type DashboardSummary = {
    inventorySummary: {
        totalItems: number;
        normalStockItems: number;
        lowStockItems: number;
        outOfStockItems: number;
        totalQuantity: number;
    };
    workStatusSummary: {
        completedToday: number;
        inProgressToday: number;
        pendingToday: number;
    };
    inOutAnalysis: {
        totalInbound: number;
        totalOutbound: number;
        completionRate: number;
        chartData: { name: string; value: number }[];
    };
    amrAnalysis: {
        totalAmrs: number;
        activeAmrs: number;
        errorAmrs: number;
        statusDistribution: { name: string; value: number }[];
    };
    salesAnalysis: {
        totalSalesAmount: number;
        totalSalesCount: number;
        companySalesDistribution: { name: string; value: number }[];
        salesTrend: { name: string; value: number }[];
    };
};

import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, subDays, subMonths, addMonths, startOfMonth, isSameMonth, subYears } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { InOutRecord, InventoryItem } from '@/components/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Line, XAxis, YAxis, CartesianGrid, LineChart, Pie, PieChart, Cell, Sector } from 'recharts';
import { Package, CheckCircle, AlertTriangle, XCircle, Archive, Truck, Clock, CalendarCheck, TrendingUp, TrendingDown, Percent, CalendarIcon, Bot, Activity, AlertCircle, Building, DollarSign, ShoppingCart } from 'lucide-react';
import { CustomPagination } from '@/components/ui/custom-pagination';

import { useData } from '@/contexts/data-context';

// Helper function to format numbers with commas
const formatNumber = (num: number) => num.toLocaleString();


// --- Data-related Types ---
type AmrStatus = "moving" | "charging" | "idle" | "error";
interface Amr { id: string; name: string; status: AmrStatus; battery: number; location: string; currentTask: string | null; }

type MetricItem = {
    id: string;
    title: string;
    value: number | string;
    icon: React.ElementType;
    items: (InventoryItem | InOutRecord)[];
};

export function UnifiedDashboard() {
  const { dashboardSummary, loading, error } = useData();
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [selectedCompany, setSelectedCompany] = React.useState<string | null>(null)
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null)
  const [isMobile, setIsMobile] = React.useState(false)
  const [activeInventoryDetail, setActiveInventoryDetail] = useState<string | null>(null);
  const [activeWorkDetail, setActiveWorkDetail] = useState<string | null>(null);
  const [workCurrentPage, setWorkCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [fromMonth, setFromMonth] = useState(startOfMonth(subMonths(new Date(), 1)));
  const [toMonth, setToMonth] = useState(startOfMonth(new Date()));
  const [salesDateRange, setSalesDateRange] = useState<DateRange | undefined>(undefined);
  const [salesFilterType, setSalesFilterType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [salesFromMonth, setSalesFromMonth] = useState(startOfMonth(subMonths(new Date(), 1)));
  const [salesToMonth, setSalesToMonth] = useState(startOfMonth(new Date()));
  const [activePieIndex, setActivePieIndex] = useState(0);

  useEffect(() => {
    const today = new Date();
    setDateRange({ from: subDays(today, 29), to: today });
    setSalesDateRange({ from: subDays(today, 29), to: today });
  }, []);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={-12} textAnchor="middle" fill={fill} className="text-lg font-semibold">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <text x={cx} y={cy} dy={12} textAnchor="middle" fill="#333" className="text-md">
          {`납품 건수: ${value}`}
        </text>
        <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999" className="text-sm">
          {`(점유율: ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error loading dashboard data: {error}</div>;
  }

  // Ensure dashboardSummary is not null before destructuring
  const {
    inventorySummary = { totalItems: 0, normalStockItems: 0, lowStockItems: 0, outOfStockItems: 0, totalQuantity: 0 },
    workStatusSummary = { completedToday: 0, inProgressToday: 0, pendingToday: 0 },
    inOutAnalysis = { totalInbound: 0, totalOutbound: 0, completionRate: 0, chartData: [] },
    amrAnalysis = { totalAmrs: 0, activeAmrs: 0, errorAmrs: 0, statusDistribution: [] },
    salesAnalysis = { totalSalesAmount: 0, totalSalesCount: 0, companySalesDistribution: [], salesTrend: [] },
  } = dashboardSummary || {};

  const inventoryMetrics: MetricItem[] = [
    { id: 'totalItems', title: '총 품목 수', value: inventorySummary.totalItems, icon: Package, items: [] },
    { id: 'normalStock', title: '정상 재고', value: inventorySummary.normalStockItems, icon: CheckCircle, items: [] },
    { id: 'lowStock', title: '부족 재고', value: inventorySummary.lowStockItems, icon: AlertTriangle, items: [] },
    { id: 'outOfStock', title: '품절', value: inventorySummary.outOfStockItems, icon: XCircle, items: [] },
    { id: 'totalQuantity', title: '총 재고 수량', value: inventorySummary.totalQuantity, icon: Archive, items: [] },
  ];
  const workStatusMetrics: MetricItem[] = [
    { id: 'completed', title: '완료', value: workStatusSummary.completedToday, icon: CalendarCheck, items: [] },
    { id: 'inProgress', title: '진행 중', value: workStatusSummary.inProgressToday, icon: Truck, items: [] },
    { id: 'pending', title: '대기 중', value: workStatusSummary.pendingToday, icon: Clock, items: [] },
  ];
  const inOutMetrics = [
      { id: 'totalInbound', title: '총 입고', value: inOutAnalysis.totalInbound, icon: TrendingUp },
      { id: 'totalOutbound', title: '총 출고', value: inOutAnalysis.totalOutbound, icon: TrendingDown },
      { id: 'completionRate', title: '완료율', value: `${inOutAnalysis.completionRate.toFixed(1)}%`, icon: Percent },
  ];
  const amrMetrics = [
      { id: 'totalAmrs', title: '총 AMR 수', value: amrAnalysis.totalAmrs, icon: Bot },
      { id: 'activeAmrs', title: '가동 중', value: amrAnalysis.activeAmrs, icon: Activity },
      { id: 'errorAmrs', title: '오류 발생', value: amrAnalysis.errorAmrs, icon: AlertCircle },
  ];
  const salesMetrics = [
      { id: 'totalSalesAmount', title: '총 판매 금액', value: `₩${formatNumber(salesAnalysis.totalSalesAmount)}`, icon: DollarSign },
      { id: 'totalSalesCount', title: '총 판매 건수', value: formatNumber(salesAnalysis.totalSalesCount), icon: ShoppingCart },
      { id: 'totalCompanies', title: '거래처 수', value: salesAnalysis.companySalesDistribution.length, icon: Building },
  ];

  // ... (The rest of the component remains the same, but it will now use the destructured summary data)

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8"><h1 className="text-3xl font-bold text-gray-800">통합 대시보드</h1><p className="text-md text-gray-600 mt-1">전체 현황을 요약하고 분석합니다.</p></header>
      <Accordion type="multiple" defaultValue={['inventory', 'workStatus', 'inOutAnalysis', 'amrPerformance', 'salesManagement']} className="w-full space-y-4">
        
        <AccordionItem value="inventory" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="p-6 font-semibold text-lg">재고 현황</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {inventoryMetrics.map(({ id, title, value, icon: Icon }) => (
                <Card key={id} className={`transition-all hover:shadow-md hover:border-blue-500`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div></CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="workStatus" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="p-6 font-semibold text-lg">오늘의 작업 현황</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workStatusMetrics.map(({ id, title, value, icon: Icon }) => (
                <Card key={id} className={`transition-all hover:shadow-md hover:border-blue-500`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div></CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="inOutAnalysis" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="p-6 font-semibold text-lg">입출고 분석</AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
                        {inOutMetrics.map(({ id, title, value, icon: Icon }) => (
                            <Card key={id} className="flex-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div></CardContent></Card>
                        ))}
                    </div>
                </div>
                <div className="h-[300px] w-full">
                  {inOutAnalysis.chartData.length > 0 ? (
                    <ChartContainer config={{ inbound: { label: "입고", color: "hsl(var(--chart-2))" }, outbound: { label: "출고", color: "hsl(var(--chart-1))" }, }} className="h-full w-full">
                        <LineChart data={inOutAnalysis.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} /><YAxis /><ChartTooltip content={ChartTooltipContent} /><ChartLegend content={ChartLegendContent} /><Line type="monotone" dataKey="value" stroke="var(--color-inbound)" strokeWidth={2} dot={false} name="입고" /><Line type="monotone" dataKey="value" stroke="var(--color-outbound)" strokeWidth={2} dot={false} name="출고" /></LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-500">
                      분석할 데이터가 없습니다.
                    </div>
                  )}
                </div>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amrPerformance" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="p-6 font-semibold text-lg">AMR 성능</AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {amrMetrics.map(({ id, title, value, icon: Icon }) => (
                            <Card key={id}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>
                        ))}
                    </div>
                    <div className="h-[200px]">
                        {amrAnalysis.statusDistribution.length > 0 ? (
                          <ChartContainer config={{
                              moving: { label: '이동 중', color: 'hsl(var(--chart-1))' },
                              charging: { label: '충전 중', color: 'hsl(var(--chart-2))' },
                              idle: { label: '대기 중', color: 'hsl(var(--chart-3))' },
                              error: { label: '오류', color: 'hsl(var(--chart-4))' }
                          }} className="h-full w-full">
                              <PieChart><ChartTooltip content={ChartTooltipContent} /><Pie data={amrAnalysis.statusDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>{amrAnalysis.statusDistribution.map((entry) => (<Cell key={`cell-${entry.name}`} fill={`var(--color-${entry.name})`} />))}</Pie><ChartLegend content={ChartLegendContent} /></PieChart>
                          </ChartContainer>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500">
                            데이터가 없습니다.
                          </div>
                        )}
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="salesManagement" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="p-6 font-semibold text-lg">매출 및 거래처 관리</AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
                        {salesMetrics.map(({ id, title, value, icon: Icon }) => (
                            <Card key={id} className="flex-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>
                        ))}
                    </div>
                </div>
                <Tabs defaultValue="salesTrend" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="salesTrend">매출 추이</TabsTrigger>
                    <TabsTrigger value="companyRatio">거래처별 납품 비율</TabsTrigger>
                  </TabsList>
                  <TabsContent value="salesTrend">
                    <Card>
                      <CardHeader>
                        <CardTitle>매출 추이 (금액 및 건수)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {salesAnalysis.salesTrend.length > 0 ? (
                          <ChartContainer config={{ amount: { label: "판매 금액", color: "hsl(var(--chart-1))" }, count: { label: "판매 건수", color: "hsl(var(--chart-2))" } }} className="h-[300px] w-full">
                              <LineChart data={salesAnalysis.salesTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis yAxisId="left" label={{ value: '금액(만 원)', angle: -90, position: 'insideLeft' }} /><YAxis yAxisId="right" orientation="right" label={{ value: '건수', angle: -90, position: 'insideRight' }} allowDecimals={false} /><ChartTooltip content={ChartTooltipContent} /><ChartLegend content={ChartLegendContent} /><Line yAxisId="left" type="monotone" dataKey="value" stroke="var(--color-amount)" name="판매 금액" /><Line yAxisId="right" type="monotone" dataKey="value" stroke="var(--color-count)" name="판매 건수" /></LineChart>
                          </ChartContainer>
                        ) : (
                          <div className="h-[300px] w-full flex items-center justify-center text-gray-500">
                            데이터가 없습니다.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="companyRatio">
                    <Card>
                      <CardHeader>
                        <CardTitle>거래처별 납품 비율 (건수)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {salesAnalysis.companySalesDistribution.length > 0 ? (
                          <ChartContainer config={{ count: { label: "납품 건수" } }} className="h-[300px] w-full">
                              <PieChart>
                                  <Pie
                                      activeIndex={activePieIndex}
                                      activeShape={renderActiveShape}
                                      data={salesAnalysis.companySalesDistribution}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={80}
                                      outerRadius={110}
                                      dataKey="value"
                                      onMouseEnter={onPieEnter}
                                  >
                                      {salesAnalysis.companySalesDistribution.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                                      ))}
                                  </Pie>
                              </PieChart>
                          </ChartContainer>
                        ) : (
                          <div className="h-[300px] w-full flex items-center justify-center text-gray-500">
                            데이터가 없습니다.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default UnifiedDashboard;
