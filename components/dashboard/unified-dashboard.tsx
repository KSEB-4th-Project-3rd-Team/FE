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
import { Package, CheckCircle, AlertTriangle, XCircle, Archive, Truck, Clock, CalendarCheck, TrendingUp, TrendingDown, Percent, CalendarIcon, Bot, Activity, AlertCircle, Building, DollarSign, ShoppingCart, Timer, CalendarDays, X, Brain, Search } from 'lucide-react';
import { CustomPagination } from '@/components/ui/custom-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { InOutRecord, InventoryItem } from '../utils';
import { Item } from '../item/item-list';
import { useDashboardAll } from '@/lib/queries';
import { ORDER_STATUS_CONFIG, type OrderStatus } from '@/lib/order-status';
import { mockAmrData, type Amr, type AmrStatus, generateSeededRandom, generateDemandForecast, getLeadTimeForItem, calculatePredictedOrderDate } from '@/lib/mockData';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnyPie = Pie as any;

const formatNumber = (num: number) => num.toLocaleString();

const getInventoryCardBorder = (id: string) => {
  switch (id) {
    case 'totalItems': return 'border-l-blue-500';
    case 'lowStock': return 'border-l-yellow-500';
    case 'outOfStock': return 'border-l-red-500';
    case 'totalQuantity': return 'border-l-green-500';
    default: return 'border-l-gray-500';
  }
};

const getIconBackground = (id: string) => {
  switch (id) {
    case 'totalItems': return 'bg-blue-100';
    case 'lowStock': return 'bg-yellow-100';
    case 'outOfStock': return 'bg-red-100';
    case 'totalQuantity': return 'bg-green-100';
    default: return 'bg-gray-100';
  }
};

// --- Mock Data Section (AMR only, as it's not in the backend) ---
// AMR 목업 데이터는 @/lib/mockData에서 import

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
  const { data: dashboardData, isLoading, error } = useDashboardAll();
  
  // 통합 데이터에서 개별 데이터 추출 및 변환
  const inventoryData = useMemo((): InventoryItem[] => {
    if (!dashboardData?.inventory || !dashboardData?.items) return [];
    
    // 예정 수량 계산 (SCHEDULED 상태인 주문들)
    const scheduledInbound = dashboardData.orders
      .filter(order => order.status === 'SCHEDULED' && order.type === 'INBOUND')
      .reduce((acc, order) => {
        order.items.forEach(item => {
          acc[item.itemId] = (acc[item.itemId] || 0) + item.requestedQuantity;
        });
        return acc;
      }, {} as Record<number, number>);

    const scheduledOutbound = dashboardData.orders
      .filter(order => order.status === 'SCHEDULED' && order.type === 'OUTBOUND')
      .reduce((acc, order) => {
        order.items.forEach(item => {
          acc[item.itemId] = (acc[item.itemId] || 0) + item.requestedQuantity;
        });
        return acc;
      }, {} as Record<number, number>);
    
    return dashboardData.inventory.map((backendItem, index) => {
      const item = dashboardData.items.find(i => i.itemId === backendItem.itemId);
      
      // 현재 수량 (백엔드에서 이미 완료된 주문만 반영된 수량)
      const currentQuantity = backendItem.quantity;
      
      // 예정 수량
      const inboundScheduled = scheduledInbound[backendItem.itemId] || 0;
      const outboundScheduled = scheduledOutbound[backendItem.itemId] || 0;
      
      let status = '정상';
      if (currentQuantity <= 0) {
        status = '위험';
      } else if (currentQuantity <= 10) {
        status = '부족';
      }

      return {
        id: index + 1,
        name: backendItem.itemName,
        sku: item?.itemCode || `SKU-${backendItem.itemId}`,
        specification: item?.spec || 'N/A',
        quantity: currentQuantity, // 현재 실제 재고 수량
        inboundScheduled, // 입고 예정 수량
        outboundScheduled, // 출고 예정 수량
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
        
        // 백엔드 상태 그대로 사용
        const status = record.status;
        
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
  const [selectedItemForDemand, setSelectedItemForDemand] = useState<string>('');
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const oneWeekAgo = subDays(today, 6);
    setDateRange({ from: oneWeekAgo, to: today });
    setSalesDateRange({ from: oneWeekAgo, to: today });
  }, []);

  // 첫 번째 품목을 기본값으로 설정
  useEffect(() => {
    if (inventoryData.length > 0 && !selectedItemForDemand) {
      setSelectedItemForDemand(inventoryData[0].name);
    }
  }, [inventoryData, selectedItemForDemand]);

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
    const filteredByDate = inOutData.filter(item => {
        const itemDate = new Date(item.date);
        if (!dateRange?.from || !dateRange?.to) return true;
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
    });

    // 'completed' 상태의 데이터만 필터링하여 입출고 분석에 사용 (소문자로 안전하게 비교)
    const completedData = filteredByDate.filter(d => (d.status || '').toLowerCase() === 'completed');

    const totalInbound = completedData.filter(d => d.type === 'inbound').reduce((sum, item) => sum + item.quantity, 0);
    const totalOutbound = completedData.filter(d => d.type === 'outbound').reduce((sum, item) => sum + item.quantity, 0);
    
    // 전체 데이터 대비 완료된 데이터의 비율 계산
    const completedCount = completedData.length;
    const completionRate = filteredByDate.length > 0 ? (completedCount / filteredByDate.length) * 100 : 0;
    
    const getGroupKey = (date: Date) => {
        if (filterType === 'monthly') return format(date, 'yyyy-MM');
        if (filterType === 'weekly') return format(startOfWeek(date, { weekStartsOn: 0 }), 'yy/MM/dd');
        return format(date, 'yyyy-MM-dd');
    };
    
    const chartData = completedData.reduce((acc, item) => {
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
    const allStatuses: AmrStatus[] = ['moving', 'charging', 'idle', 'error'];
    const totalAmrs = mockAmrData.length;
    const activeAmrs = mockAmrData.filter(amr => amr.status === 'moving').length;
    const errorAmrs = mockAmrData.filter(amr => amr.status === 'error').length;
    const statusDistribution = allStatuses.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<AmrStatus, number>);
    mockAmrData.forEach(amr => {
      if (statusDistribution.hasOwnProperty(amr.status)) {
        statusDistribution[amr.status]++;
      }
    });
    const chartData = Object.entries(statusDistribution).map(([name, value]) => ({ name, displayName: amrStatusKorean[name as AmrStatus] || name, value, fill: `var(--color-${name})` }));
    return { totalAmrs, activeAmrs, errorAmrs, chartData };
  }, []);

  // AI 수요 예측 분석
  const demandAnalysis = useMemo(() => {
    if (!selectedItemForDemand || inventoryData.length === 0) {
      return {
        currentStock: 0,
        leadTime: 0,
        predictedOrderDate: '',
        demandForecast: []
      };
    }

    const selectedItem = inventoryData.find(item => item.name === selectedItemForDemand);
    const currentStock = selectedItem?.quantity || 0;
    const leadTime = getLeadTimeForItem(selectedItemForDemand);
    const forecast = generateDemandForecast(selectedItemForDemand);
    const predictedOrderDate = calculatePredictedOrderDate(currentStock, forecast, leadTime);

    return {
      currentStock,
      leadTime,
      predictedOrderDate,
      demandForecast: forecast
    };
  }, [selectedItemForDemand, inventoryData]);

  // 품목 필터링
  const filteredItems = useMemo(() => {
    if (!itemSearchQuery) return inventoryData;
    return inventoryData.filter(item => 
      item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
    );
  }, [inventoryData, itemSearchQuery]);

  const salesAnalysis = useMemo(() => {
    const salesData = inOutData.filter(item => {
        const itemDate = new Date(item.date);
        if (!salesDateRange?.from || !salesDateRange?.to) return true;
        const status = item.status.toLowerCase();
        return item.type === 'outbound' && status === 'completed' && itemDate >= salesDateRange.from && itemDate <= salesDateRange.to;
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
        acc[key].amount += Math.round((item.quantity * (itemPriceMap[item.sku] || 0)) / 10000); // Convert to 만원 and round
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
      pending: todaysItems.filter(i => i.status === 'PENDING' || i.status === 'pending'),
      scheduled: todaysItems.filter(i => i.status === 'SCHEDULED' || i.status === 'scheduled'),
      completed: todaysItems.filter(i => i.status === 'COMPLETED' || i.status === 'completed'),
      rejected: todaysItems.filter(i => i.status === 'REJECTED' || i.status === 'rejected'),
      cancelled: todaysItems.filter(i => i.status === 'CANCELLED' || i.status === 'cancelled'),
    };
  }, [inOutData]);

  const orderStatusMetrics: MetricItem[] = [
    { id: 'pending', title: '승인대기', value: (todayOrderStatusItems.pending || []).length, icon: Timer, items: todayOrderStatusItems.pending || [] },
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

  if (loading) return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">대시보드 로딩 중...</h3>
        <p className="text-gray-500">📊 실시간 데이터를 가져오고 있습니다</p>
        <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto mt-4">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
  
  if (errorMessage) return (
    <div className="p-8 bg-gradient-to-br from-red-50 via-white to-orange-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">데이터 로딩 실패</h3>
        <p className="text-red-600 mb-4">⚠️ {errorMessage}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          새로고침
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-blue-600">통합 대시보드</h1>
            <p className="text-lg text-gray-600 mt-1">전체 현황을 실시간으로 모니터링합니다</p>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full"></div>
      </header>
      <Accordion type="multiple" defaultValue={['orderStatus', 'aiDemandForecast', 'inOutAnalysis', 'inventory', 'amrPerformance', 'salesManagement']} className="w-full space-y-4">
        
        <AccordionItem value="orderStatus" className="border-2 border-green-100 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
          <AccordionTrigger className="p-6 font-bold text-xl text-green-700 hover:text-green-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-green-600" />
              </div>
              오늘의 입출고 현황
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {orderStatusMetrics.map(({ id, title, value, icon: Icon }) => {
                const config = ORDER_STATUS_CONFIG[id as OrderStatus];
                return (
                  <Card key={id} onClick={() => handleCardClick(id, 'work')} className={`cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border-l-4 ${config ? config.bgColor.replace('bg-', 'border-l-') : 'border-l-gray-500'} ${activeWorkDetail === id ? 'shadow-lg scale-105' : ''}`}>
                    <CardContent className="p-6 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold uppercase tracking-wider ${config ? config.textColor : 'text-gray-600'}`}>{title}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(value as number)}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${config ? config.bgColor : 'bg-gray-100'}`}>
                          <Icon className={`h-6 w-6 ${config ? config.textColor : 'text-gray-400'}`} />
                        </div>
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

        <AccordionItem value="aiDemandForecast" className="border-2 border-teal-100 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
          <AccordionTrigger className="p-6 font-bold text-xl text-teal-700 hover:text-teal-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-teal-600" />
              </div>
              AI 수요 예측
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="space-y-6">
              {/* 품목 선택 */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-teal-700 whitespace-nowrap">품목 선택:</label>
                <div className="flex-1 max-w-md">
                  <Select value={selectedItemForDemand} onValueChange={setSelectedItemForDemand}>
                    <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="품목을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <div className="p-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="품목명 검색..."
                            value={itemSearchQuery}
                            onChange={(e) => setItemSearchQuery(e.target.value)}
                            className="pl-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredItems.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 상단 네모 박스 3개 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-teal-500 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 bg-gradient-to-br from-white to-teal-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">현재고</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(demandAnalysis.currentStock)}개</p>
                      </div>
                      <div className="p-3 rounded-xl bg-teal-100">
                        <Package className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-teal-500 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 bg-gradient-to-br from-white to-teal-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">이전 리드타임</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{demandAnalysis.leadTime}일</p>
                      </div>
                      <div className="p-3 rounded-xl bg-teal-100">
                        <Clock className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-teal-500 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-teal-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">예측 주문일</p>
                        <p className="text-lg font-bold text-gray-900 mt-2">{demandAnalysis.predictedOrderDate}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-teal-100">
                        <CalendarCheck className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 수요 예측 그래프 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-teal-700">30일 일일 수요 예측</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer 
                    config={{ 
                      demand: { 
                        label: "예측 수요량", 
                        color: "hsl(var(--teal-600))" 
                      } 
                    }} 
                    className="h-[300px] w-full"
                  >
                    <LineChart 
                      data={demandAnalysis.demandForecast} 
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="displayDate" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8} 
                      />
                      <YAxis label={{ value: '수량(개)', angle: -90, position: 'insideLeft' }} />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{`날짜: ${label}`}</p>
                                <p className="text-teal-600">{`예측 수요: ${payload[0].value}개`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="demand" 
                        stroke="#0d9488" 
                        strokeWidth={2} 
                        dot={{ fill: '#0d9488', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#0d9488' }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="inOutAnalysis" className="border-2 border-purple-100 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <AccordionTrigger className="p-6 font-bold text-xl text-purple-700 hover:text-purple-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                입출고 분석
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
                        {inOutMetrics.map(({ id, title, value, icon: Icon }, index) => {
                          const colors = [
                            { iconBg: 'bg-slate-100', iconColor: 'text-slate-600', titleColor: 'text-slate-700' },
                            { iconBg: 'bg-slate-100', iconColor: 'text-slate-600', titleColor: 'text-slate-700' },
                            { iconBg: 'bg-slate-100', iconColor: 'text-slate-600', titleColor: 'text-slate-700' }
                          ];
                          const color = colors[index % colors.length];
                          
                          const iconColors = ['text-emerald-600', 'text-rose-600', 'text-blue-600'];
                          const iconColor = iconColors[index % iconColors.length];
                          
                          return (
                            <Card key={id} className="flex-1 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium tracking-wide text-slate-700">{title}</CardTitle>
                                <div className="p-2.5 rounded-full bg-slate-100">
                                  <Icon className={`h-4 w-4 ${iconColor}`} />
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="text-2xl font-bold text-slate-900 mb-1">{typeof value === 'number' ? formatNumber(value) : value}</div>
                              </CardContent>
                            </Card>
                          );
                        })}
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

        <AccordionItem value="inventory" className="border-2 border-blue-100 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
          <AccordionTrigger className="p-6 font-bold text-xl text-blue-700 hover:text-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              재고 현황
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {inventoryMetrics.map(({ id, title, value, icon: Icon, textColor, iconColor }) => (
                <Card key={id} onClick={() => handleCardClick(id, 'inventory')} className={`transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4 ${getInventoryCardBorder(id)} ${id !== 'totalQuantity' ? 'cursor-pointer' : ''} ${activeInventoryDetail === id ? 'shadow-lg scale-105' : ''}`}>
                  <CardContent className="p-6 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold uppercase tracking-wider ${textColor || 'text-gray-600'}`}>{title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{typeof value === 'number' ? formatNumber(value) : value}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${getIconBackground(id)}`}>
                        <Icon className={`h-6 w-6 ${iconColor || 'text-gray-400'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4">{renderDetailTable(activeInventoryDetail, inventoryMetrics, [
                { key: 'name', label: '상품명', className: 'w-[20%] text-left' },
                { key: 'specification', label: '규격', className: 'w-[15%] text-left' },
                { key: 'quantity', label: '현재 수량', className: 'w-[12%] text-center' },
                { 
                  key: 'inboundScheduled', 
                  label: '입고 예정', 
                  className: 'w-[12%] text-center',
                  render: (item) => {
                    const scheduled = (item as InventoryItem).inboundScheduled;
                    return scheduled > 0 ? (
                      <span className="text-blue-600 font-medium">+{scheduled}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    );
                  }
                },
                { 
                  key: 'outboundScheduled', 
                  label: '출고 예정', 
                  className: 'w-[12%] text-center',
                  render: (item) => {
                    const scheduled = (item as InventoryItem).outboundScheduled;
                    return scheduled > 0 ? (
                      <span className="text-red-600 font-medium">-{scheduled}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    );
                  }
                },
                { key: 'location', label: '구역', className: 'w-[15%] text-center' },
                { key: 'status', label: '상태', className: 'w-[12%] text-center' },
            ], '재고 현황')}</div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amrPerformance" className="border-2 border-orange-100 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <AccordionTrigger className="p-6 font-bold text-xl text-orange-700 hover:text-orange-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-orange-600" />
                </div>
                AMR 성능
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {amrMetrics.map(({ id, title, value, icon: Icon }, index) => {
                        const iconColors = ['text-amber-600', 'text-green-600', 'text-red-600'];
                        const iconColor = iconColors[index % iconColors.length];
                        
                        return (
                          <Card key={id} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                              <CardTitle className="text-sm font-medium tracking-wide text-slate-700">{title}</CardTitle>
                              <div className="p-2.5 rounded-full bg-slate-100">
                                <Icon className={`h-4 w-4 ${iconColor}`} />
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
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

        <AccordionItem value="salesManagement" className="border-2 border-indigo-100 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <AccordionTrigger className="p-6 font-bold text-xl text-indigo-700 hover:text-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
                매출 및 거래처 관리
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
                      {salesMetrics.map(({ id, title, value, icon: Icon }, index) => {
                        const iconColors = ['text-indigo-600', 'text-purple-600', 'text-teal-600'];
                        const iconColor = iconColors[index % iconColors.length];
                        
                        return (
                          <Card key={id} className="flex-1 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                              <CardTitle className="text-sm font-medium tracking-wide text-slate-700">{title}</CardTitle>
                              <div className="p-2.5 rounded-full bg-slate-100">
                                <Icon className={`h-4 w-4 ${iconColor}`} />
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
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