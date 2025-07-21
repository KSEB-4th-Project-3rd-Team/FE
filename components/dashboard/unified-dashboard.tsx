"use client"

import React, { useMemo, useState } from 'react';
import { format, startOfWeek, subDays, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { mockInventoryData, mockInOutData, InOutRecord } from '@/components/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, Line, XAxis, YAxis, CartesianGrid, BarChart, LineChart, Pie, PieChart, Cell } from 'recharts';
import { Package, CheckCircle, AlertTriangle, XCircle, Archive, Truck, Clock, CalendarCheck, TrendingUp, TrendingDown, Percent, CalendarIcon, Bot, Activity, AlertCircle, Building, DollarSign, ShoppingCart } from 'lucide-react';

// Helper function to format numbers with commas
const formatNumber = (num: number) => num.toLocaleString();

// --- Mock Data Section ---
type AmrStatus = "moving" | "charging" | "idle" | "error";
interface Amr { id: string; name: string; status: AmrStatus; battery: number; location: string; currentTask: string | null; }
const mockAmrData: Amr[] = [
  { id: "AMR-001", name: "Pioneer 1", status: "moving", battery: 82, location: "A-3", currentTask: "Order #1234" },
  { id: "AMR-002", name: "Pioneer 2", status: "charging", battery: 34, location: "Charging Bay 1", currentTask: null },
  { id: "AMR-003", name: "Scout 1", status: "idle", battery: 95, location: "Home Base", currentTask: null },
  { id: "AMR-004", name: "Pioneer 3", status: "moving", battery: 65, location: "B-1", currentTask: "Order #1235" },
  { id: "AMR-005", name: "Scout 2", status: "error", battery: 5, location: "C-4", currentTask: "Order #1236" },
];
const mockPriceData: Record<string, number> = {
    "SM-G998B": 1200000, "LG-17Z90P": 1800000, "SM-R190": 200000, "IPAD-AIR4": 900000, "AW-S8": 600000,
};

type MetricItem = {
    id: string;
    title: string;
    value: number | string;
    icon: React.ElementType;
    items: (typeof mockInventoryData[0] | InOutRecord)[];
};

const UnifiedDashboard = () => {
  const [activeInventoryDetail, setActiveInventoryDetail] = useState<string | null>(null);
  const [activeWorkDetail, setActiveWorkDetail] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: subMonths(new Date(), 11), to: new Date() });
  const [filterType, setFilterType] = useState<'monthly' | 'weekly' | 'daily' | 'custom'>('monthly');
  const [salesDateRange, setSalesDateRange] = useState<DateRange | undefined>({ from: subMonths(new Date(), 11), to: new Date() });
  const [salesFilterType, setSalesFilterType] = useState<'monthly' | 'weekly' | 'daily' | 'custom'>('monthly');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // 1. 재고 현황 분석
  const inventorySummary = useMemo(() => {
    const totalItems = mockInventoryData.length;
    const normalStockItems = mockInventoryData.filter(item => item.status === '정상');
    const lowStockItems = mockInventoryData.filter(item => item.status === '부족');
    const outOfStockItems = mockInventoryData.filter(item => item.quantity === 0);
    const totalQuantity = mockInventoryData.reduce((sum, item) => sum + item.quantity, 0);
    return { totalItems, normalStock: { count: normalStockItems.length, items: normalStockItems }, lowStock: { count: lowStockItems.length, items: lowStockItems }, outOfStock: { count: outOfStockItems.length, items: outOfStockItems }, totalQuantity };
  }, []);

  // 2. 오늘 작업 현황 분석
  const workStatusSummary = useMemo(() => {
    const completed = mockInOutData.filter(item => item.status === '완료');
    const inProgress = mockInOutData.filter(item => item.status === '진행 중');
    const pending = mockInOutData.filter(item => item.status === '예약');
    return { completed: { count: completed.length, items: completed }, inProgress: { count: inProgress.length, items: inProgress }, pending: { count: pending.length, items: pending } };
  }, []);

  // 3. 입출고 분석
  const inOutAnalysis = useMemo(() => {
    const filteredData = mockInOutData.filter(item => {
        const itemDate = new Date(item.date);
        if (!dateRange?.from || !dateRange?.to) return true;
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
    });

    const totalInbound = filteredData.filter(d => d.type === 'inbound').reduce((sum, item) => sum + item.quantity, 0);
    const totalOutbound = filteredData.filter(d => d.type === 'outbound').reduce((sum, item) => sum + item.quantity, 0);
    const completedCount = filteredData.filter(d => d.status === '완료').length;
    const completionRate = filteredData.length > 0 ? (completedCount / filteredData.length) * 100 : 0;

    const getGroupKey = (date: Date) => {
        if (filterType === 'monthly') return format(date, 'yyyy-MM');
        if (filterType === 'weekly') {
            const start = startOfWeek(date, { weekStartsOn: 1 });
            return `${format(start, 'yy/MM/dd')}`;
        }
        return format(date, 'yyyy-MM-dd');
    };
    
    const chartData = filteredData.reduce((acc, item) => {
        const key = getGroupKey(new Date(item.date));
        if (!acc[key]) { acc[key] = { date: key, inbound: 0, outbound: 0 }; }
        if (item.type === 'inbound') { acc[key].inbound += item.quantity; } 
        else { acc[key].outbound += item.quantity; }
        return acc;
    }, {} as Record<string, { date: string; inbound: number; outbound: number }>);

    return { totalInbound, totalOutbound, completionRate, chartData: Object.values(chartData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) };
  }, [dateRange, filterType]);

  // 4. AMR 성능 분석
  const amrAnalysis = useMemo(() => {
    const amrStatusKorean: { [key in AmrStatus]: string } = {
      moving: '이동 중',
      charging: '충전 중',
      idle: '대기 중',
      error: '오류',
    };
    const totalAmrs = mockAmrData.length;
    const activeAmrs = mockAmrData.filter(amr => amr.status === 'moving').length;
    const errorAmrs = mockAmrData.filter(amr => amr.status === 'error').length;
    const statusDistribution = mockAmrData.reduce((acc, amr) => { acc[amr.status] = (acc[amr.status] || 0) + 1; return acc; }, {} as Record<AmrStatus, number>);
    const chartData = Object.entries(statusDistribution).map(([name, value]) => ({
        name: name,
        displayName: amrStatusKorean[name as AmrStatus] || name,
        value,
        fill: `var(--color-${name})`
    }));
    return { totalAmrs, activeAmrs, errorAmrs, chartData };
  }, []);

  // 5. 매출 및 거래처 분석
  const salesAnalysis = useMemo(() => {
    const salesData = mockInOutData.filter(item => {
        const itemDate = new Date(item.date);
        if (!salesDateRange?.from || !salesDateRange?.to) return true;
        return item.type === 'outbound' && itemDate >= salesDateRange.from && itemDate <= salesDateRange.to;
    });

    const totalSalesAmount = salesData.reduce((sum, item) => sum + (item.quantity * (mockPriceData[item.sku] || 0)), 0);
    const totalSalesCount = salesData.length;

    const byCompany = salesData.reduce((acc, item) => {
        if (!acc[item.company]) { acc[item.company] = { name: item.company, count: 0, amount: 0, items: [] }; }
        acc[item.company].count += 1;
        acc[item.company].amount += item.quantity * (mockPriceData[item.sku] || 0);
        acc[item.company].items.push(item);
        return acc;
    }, {} as Record<string, { name: string; count: number; amount: number; items: InOutRecord[] }>);

    const allCompaniesSorted = Object.values(byCompany).sort((a, b) => b.count - a.count);
    const top5Companies = allCompaniesSorted.slice(0, 5);
    const otherCompanies = allCompaniesSorted.slice(5);

    const companyPieChartData = [...top5Companies];
    if (otherCompanies.length > 0) {
        const othersCount = otherCompanies.reduce((sum, company) => sum + company.count, 0);
        companyPieChartData.push({ name: '기타', count: othersCount, amount: 0, items: [] });
    }
    
    const getGroupKey = (date: Date) => {
        if (salesFilterType === 'monthly') return format(date, 'yyyy-MM');
        if (salesFilterType === 'weekly') {
            const start = startOfWeek(date, { weekStartsOn: 1 });
            return `${format(start, 'yy/MM/dd')}`;
        }
        return format(date, 'yyyy-MM-dd');
    };

    const salesTrend = salesData.reduce((acc, item) => {
        const key = getGroupKey(new Date(item.date));
        if (!acc[key]) { acc[key] = { date: key, amount: 0, count: 0 }; }
        acc[key].amount += item.quantity * (mockPriceData[item.sku] || 0);
        acc[key].count += 1;
        return acc;
    }, {} as Record<string, { date: string; amount: number; count: number }>);

    return {
        totalSalesAmount,
        totalSalesCount,
        companyPieChartData,
        allCompanies: Object.values(byCompany).sort((a, b) => b.amount - a.amount),
        salesTrend: Object.values(salesTrend).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        companyDetails: selectedCompany ? byCompany[selectedCompany]?.items || [] : []
    };
  }, [salesDateRange, salesFilterType, selectedCompany]);

  const handleFilterClick = (type: 'monthly' | 'weekly' | 'daily', setDate: (range: DateRange | undefined) => void, setType: (type: 'monthly' | 'weekly' | 'daily' | 'custom') => void) => {
    setType(type);
    const today = new Date();
    if (type === 'monthly') {
      setDate({ from: subMonths(today, 11), to: today });
    } else if (type === 'weekly') {
      setDate({ from: subMonths(today, 3), to: today });
    } else if (type === 'daily') {
      setDate({ from: subDays(today, 13), to: today });
    }
  };

  const inventoryMetrics: MetricItem[] = [
    { id: 'totalItems', title: '총 품목 수', value: inventorySummary.totalItems, icon: Package, items: mockInventoryData },
    { id: 'normalStock', title: '정상 재고', value: inventorySummary.normalStock.count, icon: CheckCircle, items: inventorySummary.normalStock.items },
    { id: 'lowStock', title: '부족 재고', value: inventorySummary.lowStock.count, icon: AlertTriangle, items: inventorySummary.lowStock.items },
    { id: 'outOfStock', title: '품절', value: inventorySummary.outOfStock.count, icon: XCircle, items: inventorySummary.outOfStock.items },
    { id: 'totalQuantity', title: '총 재고 수량', value: inventorySummary.totalQuantity, icon: Archive, items: [] },
  ];
  const workStatusMetrics: MetricItem[] = [
    { id: 'completed', title: '완료', value: workStatusSummary.completed.count, icon: CalendarCheck, items: workStatusSummary.completed.items },
    { id: 'inProgress', title: '진행 중', value: workStatusSummary.inProgress.count, icon: Truck, items: workStatusSummary.inProgress.items },
    { id: 'pending', title: '대기 중', value: workStatusSummary.pending.count, icon: Clock, items: workStatusSummary.pending.items },
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
      { id: 'totalCompanies', title: '거래처 수', value: salesAnalysis.allCompanies.length, icon: Building },
  ];

  const handleCardClick = (metricId: string, type: 'inventory' | 'work') => {
    if (type === 'inventory') { setActiveInventoryDetail(prev => (prev === metricId ? null : metricId)); setActiveWorkDetail(null); }
    else if (type === 'work') { setActiveWorkDetail(prev => (prev === metricId ? null : metricId)); setActiveInventoryDetail(null); }
  };

  const renderDetailTable = (activeDetail: string | null, metrics: MetricItem[], headers: { key: string; label: string; className?: string; render?: (value: any) => React.ReactNode }[], titlePrefix: string) => {
    if (!activeDetail) return null;
    const metric = metrics.find(m => m.id === activeDetail);
    if (!metric || !metric.items || metric.items.length === 0) return null;
    return (
      <Card className="mt-4">
        <CardHeader><CardTitle>{titlePrefix}: {metric.title} 상세 목록</CardTitle></CardHeader>
        <CardContent>
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>{headers.map(h => <TableHead key={h.key} className={h.className}>{h.label}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {metric.items.map((item) => (
                <TableRow key={(item as { id: number | string }).id}>
                  {headers.map(h => (
                    <TableCell key={h.key} className={`py-4 px-4 ${h.className}`}>
                      {h.render ? h.render((item as never)[h.key]) : (item as never)[h.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8"><h1 className="text-3xl font-bold text-gray-800">통합 대시보드</h1><p className="text-md text-gray-600 mt-1">전체 현황을 요약하고 분석합니다.</p></header>
      <Accordion type="multiple" defaultValue={['inventory', 'workStatus', 'inOutAnalysis', 'amrPerformance', 'salesManagement']} className="w-full space-y-4">
        
        <AccordionItem value="inventory" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="p-6 font-semibold text-lg">재고 현황</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {inventoryMetrics.map(({ id, title, value, icon: Icon }) => (
                <Card key={id} onClick={() => handleCardClick(id, 'inventory')} className={`transition-all hover:shadow-md hover:border-blue-500 ${activeInventoryDetail === id ? 'border-blue-500 shadow-md' : ''} ${id !== 'totalQuantity' ? 'cursor-pointer' : ''}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div></CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4">{renderDetailTable(activeInventoryDetail, inventoryMetrics as MetricItem[], [
                { key: 'name', label: '상품명', className: 'w-[30%] text-left' },
                { key: 'specification', label: '규격', className: 'w-[20%] text-left' },
                { key: 'quantity', label: '현재 수량', className: 'w-[15%] text-center' },
                { key: 'location', label: '위치', className: 'w-[20%] text-center' },
                { key: 'status', label: '상태', className: 'w-[15%] text-center' },
            ], '재고 현황')}</div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="workStatus" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="p-6 font-semibold text-lg">오늘의 작업 현황</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workStatusMetrics.map(({ id, title, value, icon: Icon }) => (
                <Card key={id} onClick={() => handleCardClick(id, 'work')} className={`transition-all hover:shadow-md hover:border-blue-500 cursor-pointer ${activeWorkDetail === id ? 'border-blue-500 shadow-md' : ''}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div></CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4">{renderDetailTable(activeWorkDetail, workStatusMetrics as MetricItem[], [
                { key: 'type', label: '유형', className: 'w-[10%] text-center', render: (type) => type === 'inbound' ? '입고' : '출고' },
                { key: 'productName', label: '상품명', className: 'w-[15%] text-left' },
                { key: 'quantity', label: '수량', className: 'w-[30%] text-center' },
                { key: 'company', label: '거래처', className: 'w-[15%] text-left' },
                { key: 'date', label: '날짜', className: 'w-[15%] text-center' },
                { key: 'status', label: '상태', className: 'w-[15%] text-center' },
            ], '작업 현황')}</div>
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
                    <div className="flex items-center gap-2">
                        <Button variant={filterType === 'daily' ? 'default' : 'outline'} onClick={() => handleFilterClick('daily', setDateRange, setFilterType)}>14일</Button>
                        <Button variant={filterType === 'weekly' ? 'default' : 'outline'} onClick={() => handleFilterClick('weekly', setDateRange, setFilterType)}>3개월</Button>
                        <Button variant={filterType === 'monthly' ? 'default' : 'outline'} onClick={() => handleFilterClick('monthly', setDateRange, setFilterType)}>12개월</Button>
                        <Popover><PopoverTrigger asChild><Button variant={"outline"} className={`w-[280px] justify-start text-left font-normal ${!dateRange && "text-muted-foreground"}`}><CalendarIcon className="mr-2 h-4 w-4" />{dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "yyyy-MM-dd")} - {format(dateRange.to, "yyyy-MM-dd")}</>) : (format(dateRange.from, "yyyy-MM-dd"))) : (<span>기간 선택</span>)}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="end"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={(range) => { setDateRange(range); setFilterType('custom'); }} numberOfMonths={2} /></PopoverContent></Popover>
                    </div>
                </div>
                <ChartContainer config={{ inbound: { label: "입고", color: "hsl(var(--chart-2))" }, outbound: { label: "출고", color: "hsl(var(--chart-1))" }, }} className="h-[300px] w-full">
                    <LineChart data={inOutAnalysis.chartData}><CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} /><YAxis /><ChartTooltip content={ChartTooltipContent} /><ChartLegend content={ChartLegendContent} /><Line type="monotone" dataKey="inbound" stroke="var(--color-inbound)" strokeWidth={2} dot={false} name="입고" /><Line type="monotone" dataKey="outbound" stroke="var(--color-outbound)" strokeWidth={2} dot={false} name="출고" /></LineChart>
                </ChartContainer>
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
                        <ChartContainer config={{
                            moving: { label: '이동 중', color: 'hsl(var(--chart-1))' },
                            charging: { label: '충전 중', color: 'hsl(var(--chart-2))' },
                            idle: { label: '대기 중', color: 'hsl(var(--chart-3))' },
                            error: { label: '오류', color: 'hsl(var(--chart-4))' }
                        }} className="h-full w-full">
                            <PieChart><ChartTooltip content={ChartTooltipContent} /><Pie data={amrAnalysis.chartData} dataKey="value" nameKey="displayName" innerRadius={60} outerRadius={80} paddingAngle={5}>{amrAnalysis.chartData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}</Pie><ChartLegend content={ChartLegendContent} /></PieChart>
                        </ChartContainer>
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
                    <div className="flex items-center gap-2">
                        <Button variant={salesFilterType === 'daily' ? 'default' : 'outline'} onClick={() => handleFilterClick('daily', setSalesDateRange, setSalesFilterType)}>14일</Button>
                        <Button variant={salesFilterType === 'weekly' ? 'default' : 'outline'} onClick={() => handleFilterClick('weekly', setSalesDateRange, setSalesFilterType)}>3개월</Button>
                        <Button variant={salesFilterType === 'monthly' ? 'default' : 'outline'} onClick={() => handleFilterClick('monthly', setSalesDateRange, setSalesFilterType)}>12개월</Button>
                        <Popover><PopoverTrigger asChild><Button variant={"outline"} className={`w-[280px] justify-start text-left font-normal ${!salesDateRange && "text-muted-foreground"}`}><CalendarIcon className="mr-2 h-4 w-4" />{salesDateRange?.from ? (salesDateRange.to ? (<>{format(salesDateRange.from, "yyyy-MM-dd")} - {format(salesDateRange.to, "yyyy-MM-dd")}</>) : (format(salesDateRange.from, "yyyy-MM-dd"))) : (<span>기간 선택</span>)}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="end"><Calendar initialFocus mode="range" defaultMonth={salesDateRange?.from} selected={salesDateRange} onSelect={(range) => { setSalesDateRange(range); setSalesFilterType('custom'); }} numberOfMonths={2} /></PopoverContent></Popover>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">매출 추이 (금액 및 건수)</h3>
                        <ChartContainer config={{ amount: { label: "판매 금액", color: "hsl(var(--chart-1))" }, count: { label: "판매 건수", color: "hsl(var(--chart-2))" } }} className="h-[300px] w-full">
                            <LineChart data={salesAnalysis.salesTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis yAxisId="left" label={{ value: '금액(원)', angle: -90, position: 'insideLeft' }} /><YAxis yAxisId="right" orientation="right" label={{ value: '건수', angle: -90, position: 'insideRight' }} /><ChartTooltip content={ChartTooltipContent} /><ChartLegend content={ChartLegendContent} /><Line yAxisId="left" type="monotone" dataKey="amount" stroke="var(--color-amount)" name="판매 금액" /><Line yAxisId="right" type="monotone" dataKey="count" stroke="var(--color-count)" name="판매 건수" /></LineChart>
                        </ChartContainer>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">거래처별 납품 비율 (건수)</h3>
                        <ChartContainer config={{ count: { label: "납품 건수" } }} className="h-[300px] w-full">
                            <PieChart>
                                <ChartTooltip content={ChartTooltipContent} />
                                <Pie data={salesAnalysis.companyPieChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                                    {salesAnalysis.companyPieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                                    ))}
                                </Pie>
                                <ChartLegend content={ChartLegendContent} />
                            </PieChart>
                        </ChartContainer>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">거래처별 상세</h3>
                    <Table>
                        <TableHeader><TableRow><TableHead>거래처명</TableHead><TableHead>납품 건수</TableHead><TableHead className="text-right">총 판매 금액</TableHead><TableHead></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {salesAnalysis.allCompanies.map(c => (
                                <React.Fragment key={c.name}>
                                    <TableRow className="cursor-pointer" onClick={() => setSelectedCompany(prev => prev === c.name ? null : c.name)}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell>{c.count}</TableCell>
                                        <TableCell className="text-right">₩{formatNumber(c.amount)}</TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">{selectedCompany === c.name ? '숨기기' : '상세 보기'}</Button></TableCell>
                                    </TableRow>
                                    {selectedCompany === c.name && (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <div className="p-4 bg-gray-50 rounded-md">
                                                    <h4 className="font-semibold mb-2">{c.name} 납품 내역</h4>
                                                    <Table>
                                                        <TableHeader><TableRow><TableHead>날짜</TableHead><TableHead>품목</TableHead><TableHead>수량</TableHead><TableHead className="text-right">금액</TableHead></TableRow></TableHeader>
                                                        <TableBody>
                                                            {c.items.map(item => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell>{item.date}</TableCell>
                                                                    <TableCell>{item.productName}</TableCell>
                                                                    <TableCell>{item.quantity}</TableCell>
                                                                    <TableCell className="text-right">₩{formatNumber(item.quantity * (mockPriceData[item.sku] || 0))}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default UnifiedDashboard;
