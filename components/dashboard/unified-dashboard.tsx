"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, subDays, subMonths, addMonths, startOfMonth, isSameMonth, subYears } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Line, XAxis, YAxis, CartesianGrid, LineChart, Pie, PieChart, Cell, Sector } from 'recharts';
import { Package, CheckCircle, AlertTriangle, XCircle, Archive, Truck, Clock, CalendarCheck, TrendingUp, TrendingDown, Percent, CalendarIcon, Bot, Activity, AlertCircle, Building, DollarSign, ShoppingCart, Timer, CalendarDays, X } from 'lucide-react';
import { CustomPagination } from '@/components/ui/custom-pagination';
import { InOutRecord, InventoryItem } from '../utils';
import { Item } from '../item/item-list';
import { useDashboardAll } from '@/lib/queries';
import { ORDER_STATUS_CONFIG, type OrderStatus } from '@/lib/order-status';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnyPie = Pie as any;

// Helper function to format numbers with commas
const formatNumber = (num: number) => num.toLocaleString();

// --- Mock Data Section (AMR only, as it's not in the backend) ---
type AmrStatus = "moving" | "charging" | "idle" | "error";
interface Amr { id: string; name: string; status: AmrStatus; battery: number; location: string; currentTask: string | null; }
const mockAmrData: Amr[] = [
  { id: "AMR-001", name: "Pioneer 1", status: "moving", battery: 82, location: "A-3", currentTask: "Order #1234" },
  { id: "AMR-002", name: "Pioneer 2", status: "charging", battery: 34, location: "Charging Bay 1", currentTask: null },
  { id: "AMR-003", name: "Scout 1", status: "idle", battery: 95, location: "Home Base", currentTask: null },
  { id: "AMR-004", name: "Pioneer 3", status: "moving", battery: 65, location: "B-1", currentTask: "Order #1235" },
  { id: "AMR-005", name: "Scout 2", status: "error", battery: 5, location: "C-4", currentTask: "Order #1236" },
];

type MetricItem = {
    id: string;
    title: string;
    value: number | string;
    icon: React.ElementType;
    items: (InventoryItem | InOutRecord)[];
    textColor?: string;
    iconColor?: string;
};

interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: {
    name: string;
  };
  percent: number;
  value: number;
}

export function UnifiedDashboard() {
  // 🚀 통합 API 호출로 5개 API → 1개 API (75% 성능 향상)
  const { data: dashboardData, isLoading, error } = useDashboardAll();
  
  // 통합 데이터에서 개별 데이터 추출 및 변환
  const inventoryData = useMemo((): InventoryItem[] => {
    if (!dashboardData?.inventory || !dashboardData?.items) return [];
    
    return dashboardData.inventory.map((backendItem, index) => {
      const item = dashboardData.items.find(i => i.itemId === backendItem.itemId);
      
      let status = '정상';
      if (backendItem.quantity <= 0) {
        status = '위험';
      } else if (backendItem.quantity <= 10) {
        status = '부족';
      }

      return {
        id: index + 1,
        name: backendItem.itemName,
        sku: item?.itemCode || `SKU-${backendItem.itemId}`,
        specification: item?.spec || 'N/A',
        quantity: backendItem.quantity,
        inboundScheduled: 0, // 예정된 입고 수량 (필요시 계산 로직 추가)
        outboundScheduled: 0, // 예정된 출고 수량 (필요시 계산 로직 추가)
        location: backendItem.locationCode,
        status,
        lastUpdate: new Date(backendItem.lastUpdated).toLocaleString('ko-KR')
      };
    });
  }, [dashboardData]);

  const inOutData = useMemo((): InOutRecord[] => {
    if (!dashboardData?.orders) return [];

    // 모든 상태의 데이터를 포함 (COMPLETED뿐만 아니라 모든 상태)
    return dashboardData.orders.flatMap(record => {
      return record.items.map((item, itemIndex) => {
        const dateTime = record.createdAt || record.updatedAt || new Date().toISOString();
        const date = dateTime.split('T')[0];
        const time = dateTime.split('T')[1]?.substring(0, 8) || '00:00:00';
        
        // 새로운 상태 매핑
        let status: OrderStatus = 'pending';
        switch (record.status) {
          case 'PENDING':
            status = 'pending';
            break;
          case 'SCHEDULED':
            status = 'scheduled';
            break;
          case 'COMPLETED':
            status = 'completed';
            break;
          case 'REJECTED':
            status = 'rejected';
            break;
          case 'CANCELLED':
            status = 'cancelled';
            break;
          default:
            status = 'pending';
        }
        
        return {
          id: `${record.orderId}-${itemIndex}`,
          type: record.type?.toLowerCase() || 'inbound',
          productName: item.itemName || 'N/A',
          sku: item.itemCode || 'N/A',
          individualCode: `ORDER-${record.orderId}-${item.itemId}`,
          specification: item.specification || 'N/A',
          quantity: item.requestedQuantity || 0,
          location: 'A-01',
          company: record.companyName || 'N/A',
          companyCode: record.companyCode || 'N/A',
          status: status as any, // OrderStatus를 기존 타입으로 캐스팅
          destination: '-',
          date,
          time,
          notes: '-'
        };
      });
    });
  }, [dashboardData]);

  const items = useMemo((): Item[] => {
    if (!dashboardData?.items) return [];
    
    return dashboardData.items.map(item => ({
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
  }, [dashboardData]);

  // 🎯 새로운 상태별 통계 계산
  const orderStatistics = useMemo(() => {
    if (!dashboardData?.orders) return {
      pending: 0,
      scheduled: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
      total: 0,
      todayCompleted: 0,
      todayTotal: 0
    };

    const today = format(new Date(), 'yyyy-MM-dd');
    
    const stats = dashboardData.orders.reduce((acc, record) => {
      const orderDate = record.createdAt ? format(new Date(record.createdAt), 'yyyy-MM-dd') : '';
      const isToday = orderDate === today;
      
      // 전체 통계
      switch (record.status) {
        case 'PENDING':
          acc.pending++;
          break;
        case 'SCHEDULED':
          acc.scheduled++;
          break;
        case 'COMPLETED':
          acc.completed++;
          if (isToday) acc.todayCompleted++;
          break;
        case 'REJECTED':
          acc.rejected++;
          break;
        case 'CANCELLED':
          acc.cancelled++;
          break;
      }
      
      acc.total++;
      if (isToday) acc.todayTotal++;
      
      return acc;
    }, {
      pending: 0,
      scheduled: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
      total: 0,
      todayCompleted: 0,
      todayTotal: 0
    });

    return stats;
  }, [dashboardData]);

  const loading = isLoading;
  const errorMessage = error ? 'Failed to load dashboard data' : null;

  const [selectedCompany, setSelectedCompany] = React.useState<string | null>(null)
  const [activeInventoryDetail, setActiveInventoryDetail] = useState<string | null>(null);
  const [activeWorkDetail, setActiveWorkDetail] = useState<string | null>(null);
  const [workCurrentPage, setWorkCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [fromMonth, setFromMonth] = useState(startOfMonth(subMonths(new Date(), 1)));
  const [toMonth, setToMonth] = useState(startOfMonth(new Date()));
  const [salesDateRange, setSalesDateRange] = useState<DateRange | undefined>(undefined);
  const [salesFilterType, setSalesFilterType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [salesFromMonth, setSalesFromMonth] = useState(startOfMonth(subMonths(new Date(), 1)));
  const [salesToMonth, setSalesToMonth] = useState(startOfMonth(new Date()));
  const [activePieIndex, setActivePieIndex] = useState(0);

  useEffect(() => {
    const today = new Date();
    const oneWeekAgo = subDays(today, 6);
    setDateRange({ from: oneWeekAgo, to: today });
    setSalesDateRange({ from: oneWeekAgo, to: today });
  }, []);

  const itemPriceMap = useMemo(() => {
    return items.reduce((map, item) => {
      map[item.itemCode] = item.unitPriceOut;
      return map;
    }, {} as Record<string, number>);
  }, [items, dashboardData]);

  const onPieEnter = (_: unknown, index: number) => {
    setActivePieIndex(index);
  };

  const renderActiveShape = (props: ActiveShapeProps) => {
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
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
        <text x={cx} y={cy} dy={12} textAnchor="middle" fill="#333" className="text-md">{`납품 건수: ${value}`}</text>
        <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999" className="text-sm">{`(점유율: ${(percent * 100).toFixed(2)}%)`}</text>
      </g>
    );
  };

  useEffect(() => {
    const from = dateRange?.from ? startOfMonth(dateRange.from) : startOfMonth(subMonths(new Date(), 1));
    let to = dateRange?.to ? startOfMonth(dateRange.to) : startOfMonth(new Date());
    if (isSameMonth(from, to)) { to = addMonths(from, 1); }
    setFromMonth(from);
    setToMonth(to);
  }, [dateRange]);

  useEffect(() => {
    const from = salesDateRange?.from ? startOfMonth(salesDateRange.from) : startOfMonth(subMonths(new Date(), 1));
    let to = salesDateRange?.to ? startOfMonth(salesDateRange.to) : startOfMonth(new Date());
    if (isSameMonth(from, to)) { to = addMonths(from, 1); }
    setSalesFromMonth(from);
    setSalesToMonth(to);
  }, [salesDateRange]);

  const inventorySummary = useMemo(() => {
    const totalItems = inventoryData.length;
    const normalStockItems = inventoryData.filter(item => item.status === '정상');
    const lowStockItems = inventoryData.filter(item => item.status === '부족');
    const outOfStockItems = inventoryData.filter(item => item.quantity === 0);
    const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
    return { totalItems, normalStock: { count: normalStockItems.length, items: normalStockItems }, lowStock: { count: lowStockItems.length, items: lowStockItems }, outOfStock: { count: outOfStockItems.length, items: outOfStockItems }, totalQuantity };
  }, [inventoryData]);

  const inOutAnalysis = useMemo(() => {
    const filteredData = inOutData.filter(item => {
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
        if (filterType === 'weekly') return format(startOfWeek(date, { weekStartsOn: 0 }), 'yy/MM/dd');
        return format(date, 'yyyy-MM-dd');
    };
    const chartData = filteredData.reduce((acc, item) => {
        const key = getGroupKey(new Date(item.date));
        if (!acc[key]) { acc[key] = { date: key, inbound: 0, outbound: 0 }; }
        if (item.type === 'inbound') { acc[key].inbound += item.quantity; } 
        else { acc[key].outbound += item.quantity; }
        return acc;
    }, {} as Record<string, { date: string; inbound: number; outbound: number }>);
    const getSortableDate = (dateString: string) => dateString.includes('/') ? new Date(`20${dateString}`) : new Date(dateString);
    return { totalInbound, totalOutbound, completionRate, chartData: Object.values(chartData).sort((a, b) => getSortableDate(a.date).getTime() - getSortableDate(b.date).getTime()) };
  }, [inOutData, dateRange, filterType]);

  const amrAnalysis = useMemo(() => {
    const amrStatusKorean: { [key in AmrStatus]: string } = { moving: '이동 중', charging: '충전 중', idle: '대기 중', error: '오류' };
    const totalAmrs = mockAmrData.length;
    const activeAmrs = mockAmrData.filter(amr => amr.status === 'moving').length;
    const errorAmrs = mockAmrData.filter(amr => amr.status === 'error').length;
    const statusDistribution = mockAmrData.reduce((acc, amr) => { acc[amr.status] = (acc[amr.status] || 0) + 1; return acc; }, {} as Record<AmrStatus, number>);
    const chartData = Object.entries(statusDistribution).map(([name, value]) => ({ name, displayName: amrStatusKorean[name as AmrStatus] || name, value, fill: `var(--color-${name})` }));
    return { totalAmrs, activeAmrs, errorAmrs, chartData };
  }, []);

  const salesAnalysis = useMemo(() => {
    const salesData = inOutData.filter(item => {
        const itemDate = new Date(item.date);
        if (!salesDateRange?.from || !salesDateRange?.to) return true;
        return item.type === 'outbound' && itemDate >= salesDateRange.from && itemDate <= salesDateRange.to;
    });
    const totalSalesAmount = salesData.reduce((sum, item) => sum + (item.quantity * (itemPriceMap[item.sku] || 0)), 0);
    const totalSalesCount = salesData.length;
    const byCompany = salesData.reduce((acc, item) => {
        if (!acc[item.company]) { acc[item.company] = { name: item.company, count: 0, amount: 0, items: [] }; }
        acc[item.company].count += 1;
        acc[item.company].amount += item.quantity * (itemPriceMap[item.sku] || 0);
        acc[item.company].items.push(item);
        acc[item.company].items.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
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
        if (salesFilterType === 'weekly') return format(startOfWeek(date, { weekStartsOn: 0 }), 'yy/MM/dd');
        return format(date, 'yyyy-MM-dd');
    };
    const salesTrend = salesData.reduce((acc, item) => {
        const key = getGroupKey(new Date(item.date));
        if (!acc[key]) { acc[key] = { date: key, amount: 0, count: 0 }; }
        acc[key].amount += (item.quantity * (itemPriceMap[item.sku] || 0)) / 10000; // Convert to 만원
        acc[key].count += 1;
        return acc;
    }, {} as Record<string, { date: string; amount: number; count: number }>);
    const getSortableDate = (dateString: string) => dateString.includes('/') ? new Date(`20${dateString}`) : new Date(dateString);
    return { totalSalesAmount, totalSalesCount, companyPieChartData, allCompanies: Object.values(byCompany).sort((a, b) => b.amount - a.amount), salesTrend: Object.values(salesTrend).sort((a, b) => getSortableDate(a.date).getTime() - getSortableDate(b.date).getTime()), companyDetails: selectedCompany ? byCompany[selectedCompany]?.items || [] : [] };
  }, [inOutData, salesDateRange, salesFilterType, selectedCompany, itemPriceMap, dashboardData]);

  const handleFilterClick = (type: 'daily' | 'weekly' | 'monthly', setDate: (range: DateRange | undefined) => void, setType: (type: 'daily' | 'weekly' | 'monthly' | 'custom') => void) => {
    setType(type);
    const today = new Date();
    if (type === 'daily') setDate({ from: subDays(today, 6), to: today });
    else if (type === 'weekly') setDate({ from: subMonths(today, 3), to: today });
    else if (type === 'monthly') setDate({ from: subYears(today, 1), to: today });
  };

  const xAxisTickFormatter = (tick: string) => (filterType === 'daily' && /\d{4}-\d{2}-\d{2}/.test(tick)) ? format(new Date(tick), 'MM-dd') : tick;
  const salesXAxisTickFormatter = (tick: string) => (salesFilterType === 'daily' && /\d{4}-\d{2}-\d{2}/.test(tick)) ? format(new Date(tick), 'MM-dd') : tick;

  const inventoryMetrics: MetricItem[] = [
    { id: 'totalItems', title: '총 품목 수', value: inventorySummary.totalItems, icon: Package, items: inventoryData, textColor: 'text-blue-600', iconColor: 'text-blue-400' },
    { id: 'normalStock', title: '정상 재고', value: inventorySummary.normalStock.count, icon: CheckCircle, items: inventorySummary.normalStock.items, textColor: 'text-green-600', iconColor: 'text-green-400' },
    { id: 'lowStock', title: '부족 재고', value: inventorySummary.lowStock.count, icon: AlertTriangle, items: inventorySummary.lowStock.items, textColor: 'text-yellow-600', iconColor: 'text-yellow-400' },
    { id: 'outOfStock', title: '품절', value: inventorySummary.outOfStock.count, icon: XCircle, items: inventorySummary.outOfStock.items, textColor: 'text-red-600', iconColor: 'text-red-400' },
    { id: 'totalQuantity', title: '총 재고 수량', value: inventorySummary.totalQuantity, icon: Archive, items: [], textColor: 'text-gray-600', iconColor: 'text-gray-400' },
  ];

  const todayOrderStatusItems = useMemo(() => {
    if (!inOutData) return {} as Record<OrderStatus, InOutRecord[]>;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todaysItems = inOutData.filter(item => item.date === todayStr);
    
    return {
      pending: todaysItems.filter(i => i.status === 'pending'),
      scheduled: todaysItems.filter(i => i.status === 'scheduled'),
      completed: todaysItems.filter(i => i.status === 'completed'),
      rejected: todaysItems.filter(i => i.status === 'rejected'),
      cancelled: todaysItems.filter(i => i.status === 'cancelled'),
    };
  }, [inOutData]);

  const orderStatusMetrics: MetricItem[] = [
    { id: 'pending', title: '대기중', value: (todayOrderStatusItems.pending || []).length, icon: Timer, items: todayOrderStatusItems.pending || [] },
    { id: 'scheduled', title: '예약', value: (todayOrderStatusItems.scheduled || []).length, icon: CalendarDays, items: todayOrderStatusItems.scheduled || [] },
    { id: 'completed', title: '완료', value: (todayOrderStatusItems.completed || []).length, icon: CheckCircle, items: todayOrderStatusItems.completed || [] },
    { id: 'rejected', title: '거절', value: (todayOrderStatusItems.rejected || []).length, icon: X, items: todayOrderStatusItems.rejected || [] },
    { id: 'cancelled', title: '취소', value: (todayOrderStatusItems.cancelled || []).length, icon: XCircle, items: todayOrderStatusItems.cancelled || [] },
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
    if (type === 'inventory') {
      setActiveInventoryDetail(prev => (prev === metricId ? null : metricId));
      setActiveWorkDetail(null);
    } else if (type === 'work') {
      setActiveWorkDetail(prev => (prev === metricId ? null : metricId));
      setWorkCurrentPage(1);
      setActiveInventoryDetail(null);
    }
  };

  const renderDetailTable = (
    activeDetail: string | null, 
    metrics: MetricItem[], 
    headers: { key: string; label: string; className?: string; render?: (item: InOutRecord | InventoryItem) => React.ReactNode }[], 
    titlePrefix: string,
    currentPage?: number,
    setCurrentPage?: (page: number) => void
  ) => {
    if (!activeDetail) return null;
    const metric = metrics.find(m => m.id === activeDetail);
    if (!metric || !metric.items || metric.items.length === 0) {
        return (
            <Card className="mt-4">
                <CardHeader><CardTitle>{titlePrefix}: {metric?.title} 상세 목록</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>오늘 해당하는 내역이 없습니다.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }
    const itemsPerPage = 10;
    const paginatedItems = currentPage && setCurrentPage ? metric.items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : metric.items;
    const totalPages = currentPage && setCurrentPage ? Math.ceil(metric.items.length / itemsPerPage) : 1;
    return (
      <Card className="mt-4">
        <CardHeader><CardTitle>{titlePrefix}: {metric.title} 상세 목록</CardTitle></CardHeader>
        <CardContent>
          <Table className="table-fixed w-full">
            <TableHeader><TableRow>{headers.map(h => <TableHead key={h.key} className={h.className}>{h.label}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={(item as { id: number | string }).id}>
                  {headers.map(h => (<TableCell key={h.key} className={`py-4 px-4 ${h.className}`}>{h.render ? h.render(item) : (item as any)[h.key]}</TableCell>))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {currentPage && setCurrentPage && totalPages > 1 && (<div className="flex items-center justify-end space-x-2 py-4"><CustomPagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} /></div>)}
        </CardContent>
      </Card>
    );
  };

  if (loading) return <div className="p-8 text-center">대시보드 데이터를 불러오는 중입니다...</div>;
  if (errorMessage) return <div className="p-8 text-center text-red-600">데이터 로딩 실패: {errorMessage}</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8"><h1 className="text-3xl font-bold text-gray-800">통합 대시보드</h1><p className="text-md text-gray-600 mt-1">전체 현황을 요약하고 분석합니다.</p></header>
      <Accordion type="multiple" defaultValue={['inventory', 'orderStatus', 'inOutAnalysis', 'amrPerformance', 'salesManagement']} className="w-full space-y-4">
        
        <AccordionItem value="inventory" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="p-6 font-semibold text-lg">재고 현황</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {inventoryMetrics.map(({ id, title, value, icon: Icon, textColor, iconColor }) => (
                <Card key={id} onClick={() => handleCardClick(id, 'inventory')} className={`transition-all hover:shadow-md ${id !== 'totalQuantity' ? 'cursor-pointer' : ''} ${activeInventoryDetail === id ? 'shadow-md' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${textColor || 'text-gray-600'}`}>{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? formatNumber(value) : value}</p>
                      </div>
                      <Icon className={`h-6 w-6 ${iconColor || 'text-gray-400'}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4">{renderDetailTable(activeInventoryDetail, inventoryMetrics, [
                { key: 'name', label: '상품명', className: 'w-[30%] text-left' },
                { key: 'specification', label: '규격', className: 'w-[15%] text-left' },
                { key: 'quantity', label: '현재 수량', className: 'w-[15%] text-center' },
                { key: 'location', label: '구역', className: 'w-[20%] text-center' },
                { key: 'status', label: '상태', className: 'w-[15%] text-center' },
            ], '재고 현황')}</div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="orderStatus" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="p-6 font-semibold text-lg">📋 오늘의 입출고 현황</AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {orderStatusMetrics.map(({ id, title, value, icon: Icon }) => {
                const config = ORDER_STATUS_CONFIG[id as OrderStatus];
                return (
                  <Card key={id} onClick={() => handleCardClick(id, 'work')} className={`cursor-pointer hover:bg-gray-50 transition-colors ${activeWorkDetail === id ? 'shadow-md bg-gray-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${config ? config.textColor : 'text-gray-600'}`}>{title}</p>
                          <p className="text-2xl font-bold text-gray-900">{formatNumber(value as number)}</p>
                        </div>
                        <Icon className={`h-6 w-6 ${config ? config.textColor : 'text-gray-400'}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {renderDetailTable(
              activeWorkDetail,
              orderStatusMetrics,
              [
                { key: 'type', label: '유형', className: 'w-[10%]', render: (item) => <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${(item as InOutRecord).type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>{(item as InOutRecord).type === "inbound" ? "입고" : "출고"}</span> },
                { key: 'productName', label: '상품명', className: 'w-[20%]' },
                { key: 'quantity', label: '수량', className: 'w-[30%] text-center' },
                { key: 'company', label: '거래처', className: 'w-[20%]' },
                { key: 'status', label: '상태', className: 'w-[15%] text-center', render: (item) => {
                    const status = (item as InOutRecord).status as OrderStatus;
                    const config = ORDER_STATUS_CONFIG[status];
                    if (!config) return <span>{status}</span>;
                    return <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.bgColor} ${config.textColor}`}>{config.label}</span>
                }},
                { key: 'time', label: '요청 시간', className: 'w-[15%] text-center' },
              ],
              '오늘의 입출고 상세',
              workCurrentPage,
              setWorkCurrentPage
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="inOutAnalysis" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="p-6 font-semibold text-lg">입출고 분석</AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
                        {inOutMetrics.map(({ id, title, value, icon: Icon }) => (<Card key={id} className="flex-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div></CardContent></Card>))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant={filterType === 'daily' ? 'default' : 'outline'} onClick={() => handleFilterClick('daily', setDateRange, setFilterType)}>1주</Button>
                        <Button variant={filterType === 'weekly' ? 'default' : 'outline'} onClick={() => handleFilterClick('weekly', setDateRange, setFilterType)}>3개월</Button>
                        <Button variant={filterType === 'monthly' ? 'default' : 'outline'} onClick={() => handleFilterClick('monthly', setDateRange, setFilterType)}>1년</Button>
                        <Popover>
                            <PopoverTrigger asChild><Button variant={"outline"} className={`w-[280px] justify-start text-left font-normal ${!dateRange && "text-muted-foreground"}`}><CalendarIcon className="mr-2 h-4 w-4" />{dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "yyyy-MM-dd")} - {format(dateRange.to, "yyyy-MM-dd")}</>) : (format(dateRange.from, "yyyy-MM-dd"))) : (<span>기간 선택</span>)}</Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end"><Calendar initialFocus mode="range" selected={dateRange} onSelect={(range) => { setDateRange(range); setFilterType('custom'); }} /></PopoverContent>
                        </Popover>
                    </div>
                </div>
                <ChartContainer config={{ inbound: { label: "입고", color: "hsl(var(--chart-2))" }, outbound: { label: "출고", color: "hsl(var(--chart-1))" }, }} className="h-[300px] w-full">
                    <LineChart data={inOutAnalysis.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={xAxisTickFormatter} /><YAxis />
                        <ChartTooltip content={ChartTooltipContent as any} /><ChartLegend content={ChartLegendContent as any} />
                        <Line type="monotone" dataKey="inbound" stroke="var(--color-inbound)" strokeWidth={2} dot={false} name="입고" />
                        <Line type="monotone" dataKey="outbound" stroke="var(--color-outbound)" strokeWidth={2} dot={false} name="출고" />
                    </LineChart>
                </ChartContainer>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amrPerformance" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="p-6 font-semibold text-lg">AMR 성능</AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{amrMetrics.map(({ id, title, value, icon: Icon }) => (<Card key={id}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>))}</div>
                    <div className="h-[200px]">
                        <ChartContainer config={{ moving: { label: '이동 중', color: 'hsl(var(--chart-1))' }, charging: { label: '충전 중', color: 'hsl(var(--chart-2))' }, idle: { label: '대기 중', color: 'hsl(var(--chart-3))' }, error: { label: '오류', color: 'hsl(var(--chart-4))' } }} className="h-full w-full">
                            <PieChart>
                                <ChartTooltip content={ChartTooltipContent as any} />
                                <Pie data={amrAnalysis.chartData} dataKey="value" nameKey="displayName" innerRadius={60} outerRadius={80} paddingAngle={5}>{amrAnalysis.chartData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}</Pie>
                                <ChartLegend content={ChartLegendContent as any} />
                            </PieChart>
                        </ChartContainer>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="salesManagement" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="p-6 font-semibold text-lg">매출 및 거래처 관리</AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">{salesMetrics.map(({ id, title, value, icon: Icon }) => (<Card key={id} className="flex-1"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>))}</div>
                    <div className="flex items-center gap-2">
                        <Button variant={salesFilterType === 'daily' ? 'default' : 'outline'} onClick={() => handleFilterClick('daily', setSalesDateRange, setSalesFilterType)}>1주</Button>
                        <Button variant={salesFilterType === 'weekly' ? 'default' : 'outline'} onClick={() => handleFilterClick('weekly', setSalesDateRange, setSalesFilterType)}>3개월</Button>
                        <Button variant={salesFilterType === 'monthly' ? 'default' : 'outline'} onClick={() => handleFilterClick('monthly', setSalesDateRange, setSalesFilterType)}>1년</Button>
                        <Popover>
                            <PopoverTrigger asChild><Button variant={"outline"} className={`w-[280px] justify-start text-left font-normal ${!salesDateRange && "text-muted-foreground"}`}><CalendarIcon className="mr-2 h-4 w-4" />{salesDateRange?.from ? (salesDateRange.to ? (<>{format(salesDateRange.from, "yyyy-MM-dd")} - {format(salesDateRange.to, "yyyy-MM-dd")}</>) : (format(salesDateRange.from, "yyyy-MM-dd"))) : (<span>기간 선택</span>)}</Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end"><Calendar initialFocus mode="range" selected={salesDateRange} onSelect={(range) => { setSalesDateRange(range); setSalesFilterType('custom'); }} /></PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Tabs defaultValue="salesTrend" className="w-full">
                  <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="salesTrend">매출 추이</TabsTrigger><TabsTrigger value="companyRatio">거래처별 납품 비율</TabsTrigger></TabsList>
                  <TabsContent value="salesTrend">
                    <Card><CardHeader><CardTitle>매출 추이 (금액 및 건수)</CardTitle></CardHeader><CardContent>
                        <ChartContainer config={{ amount: { label: "판매 금액", color: "hsl(var(--chart-1))" }, count: { label: "판매 건수", color: "hsl(var(--chart-2))" } }} className="h-[300px] w-full">
                            <LineChart data={salesAnalysis.salesTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tickFormatter={salesXAxisTickFormatter} />
                                <YAxis yAxisId="left" label={{ value: '금액(만 원)', angle: -90, position: 'insideLeft' }} /><YAxis yAxisId="right" orientation="right" label={{ value: '건수', angle: -90, position: 'insideRight' }} allowDecimals={false} />
                                <ChartTooltip content={ChartTooltipContent as any} /><ChartLegend content={ChartLegendContent as any} />
                                <Line yAxisId="left" type="monotone" dataKey="amount" stroke="var(--color-amount)" name="판매 금액" />
                                <Line yAxisId="right" type="monotone" dataKey="count" stroke="var(--color-count)" name="판매 건수" />
                            </LineChart>
                        </ChartContainer>
                    </CardContent></Card>
                  </TabsContent>
                  <TabsContent value="companyRatio">
                    <Card><CardHeader><CardTitle>거래처별 납품 비율 (건수)</CardTitle></CardHeader><CardContent>
                        <ChartContainer config={{ count: { label: "납품 건수" } }} className="h-[300px] w-full">
                            <PieChart>
                                <AnyPie activeIndex={activePieIndex} activeShape={renderActiveShape as any} data={salesAnalysis.companyPieChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} dataKey="count" onMouseEnter={onPieEnter}>
                                    {salesAnalysis.companyPieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.name === '기타' ? '#6B7280' : `hsl(var(--chart-${index + 1}))`} />))}
                                </AnyPie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent></Card>
                  </TabsContent>
                </Tabs>
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">거래처별 상세</h3>
                    <Table className="table-fixed w-full">
                        <TableHeader><TableRow><TableHead className="w-[25%]">거래처명</TableHead><TableHead className="w-[35%] text-center">납품 건수</TableHead><TableHead className="w-[25%] text-left">총 판매 금액</TableHead><TableHead className="w-[10%]"></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {salesAnalysis.allCompanies.map(c => (
                                <React.Fragment key={c.name}>
                                    <TableRow className="cursor-pointer" onClick={() => setSelectedCompany(prev => prev === c.name ? null : c.name)}>
                                        <TableCell className="font-medium truncate">{c.name}</TableCell><TableCell className="text-center">{c.count}</TableCell>
                                        <TableCell className="text-left">₩{formatNumber(c.amount)}</TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">{selectedCompany === c.name ? '숨기기' : '상세 보기'}</Button></TableCell>
                                    </TableRow>
                                    {selectedCompany === c.name && (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <div className="p-4 bg-gray-50 rounded-md">
                                                    <h4 className="font-semibold mb-2">{c.name} 납품 내역</h4>
                                                    <Table className="table-fixed w-full">
                                                        <TableHeader><TableRow><TableHead className="w-[10%]">유형</TableHead><TableHead className="w-[20%]">품목</TableHead><TableHead className="w-[48%] text-center">수량</TableHead><TableHead className="w-[32%] text-left">금액</TableHead><TableHead className="w-[10%] text-center">일시</TableHead></TableRow></TableHeader>
                                                        <TableBody>
                                                            {c.items.map(item => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell>{item.type === 'inbound' ? '입고' : '출고'}</TableCell>
                                                                    <TableCell>{item.productName}</TableCell>
                                                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                                                    <TableCell className="text-left">₩{formatNumber(item.quantity * (itemPriceMap[item.sku] || 0))}</TableCell>
                                                                    <TableCell className="text-center"><div>{item.date}</div><div className="text-xs text-gray-500">{item.time}</div></TableCell>
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