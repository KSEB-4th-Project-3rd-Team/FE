import { format } from 'date-fns';

// AMR 목업 데이터
export type AmrStatus = "moving" | "charging" | "idle" | "error";

export interface Amr {
  id: string;
  name: string;
  status: AmrStatus;
  battery: number;
  location: string;
  currentTask: string | null;
}

export const mockAmrData: Amr[] = [
  { id: "AMR-001", name: "Pioneer 1", status: "moving", battery: 82, location: "A-3", currentTask: "Order #1234" },
  { id: "AMR-002", name: "Pioneer 2", status: "moving", battery: 91, location: "B-1", currentTask: "Order #1235" },
  { id: "AMR-003", name: "Scout 1", status: "moving", battery: 76, location: "C-2", currentTask: "Order #1236" },
  { id: "AMR-004", name: "Pioneer 3", status: "moving", battery: 65, location: "D-4", currentTask: "Order #1237" },
  { id: "AMR-005", name: "Scout 2", status: "moving", battery: 88, location: "A-1", currentTask: "Order #1238" },
  { id: "AMR-006", name: "Trailblazer 1", status: "moving", battery: 79, location: "B-3", currentTask: "Order #1239" },
  { id: "AMR-007", name: "Trailblazer 2", status: "moving", battery: 95, location: "C-4", currentTask: "Order #1240" },
  { id: "AMR-008", name: "Explorer 1", status: "moving", battery: 85, location: "D-1", currentTask: "Order #1241" },
];

// AI 수요 예측 관련 유틸리티 함수들
export const generateSeededRandom = (seed: string, index: number) => {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const x = Math.sin(hash + index) * 10000;
  return x - Math.floor(x);
};

export const generateDemandForecast = (itemName: string) => {
  const today = new Date();
  const forecast = [];
  
  // 품목별 패턴에 따른 14개 단위 수요 생성
  const pattern = getConsumptionPattern(itemName);
  const demandData = generateRealisticDemand(itemName, pattern);
  
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    
    forecast.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      demand: demandData[i], // 이미 14개 단위로 생성된 수요량
      displayDate: format(currentDate, 'MM-dd')
    });
  }
  
  return forecast;
};

export const getLeadTimeForItem = (itemName: string) => {
  const hash = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const leadTimes = [2, 3, 4]; // 일반적인 리드타임 2-4일
  return leadTimes[hash % leadTimes.length];
};

export const calculatePredictedOrderDate = (currentStock: number, forecast: any[], leadTime: number) => {
  let runningStock = currentStock;
  
  for (let i = 0; i < forecast.length; i++) {
    runningStock -= forecast[i].demand;
    if (runningStock <= 0) {
      // 재고가 떨어지는 날짜에서 리드타임을 뺀 날짜가 주문해야 할 날짜
      const orderDayIndex = Math.max(1, i - leadTime); // 최소 1일 후로 설정
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() + orderDayIndex);
      return format(orderDate, 'yyyy-MM-dd');
    }
  }
  
  return "30일 이내 주문 불필요";
};

// 리드타임을 고려한 종합적인 재고 예측 데이터 생성
export interface InventoryForecastData {
  date: string;
  displayDate: string;
  demand: number; // 실제 출고된 수량
  plannedDemand?: number; // 원래 계획된 수요량
  stockLevel: number; // 예상 재고량
  isOrderDate: boolean; // 주문일 여부
  isArrivalDate: boolean; // 도착일 여부
  orderQuantity?: number; // 주문 수량
  leadTimeStart?: string; // 리드타임 시작일
  leadTimeEnd?: string; // 리드타임 종료일
}

// 품목별 소모 패턴 정의
type ConsumptionPattern = 'fast' | 'slow' | 'irregular';

const getConsumptionPattern = (itemName: string): ConsumptionPattern => {
  const hash = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const patterns: ConsumptionPattern[] = ['fast', 'slow', 'irregular'];
  return patterns[hash % patterns.length];
};

// 패턴별 현실적인 수요 데이터 생성 (14개 단위)
const generateRealisticDemand = (itemName: string, pattern: ConsumptionPattern): number[] => {
  const demands: number[] = [];
  
  switch (pattern) {
    case 'fast': // 빠른 소모품 (포장재 등)
      for (let i = 0; i < 30; i++) {
        const baseValue = generateSeededRandom(itemName, i);
        // 평일 56-84개(4-6세트), 주말 28-42개(2-3세트)
        const isWeekend = (i % 7 === 0 || i % 7 === 6);
        const sets = isWeekend 
          ? Math.floor(2 + baseValue * 2) // 2-3세트
          : Math.floor(4 + baseValue * 3); // 4-6세트
        const dailyDemand = sets * 14;
        demands.push(dailyDemand);
      }
      break;
      
    case 'slow': // 느린 소모품 (부품 등)
      for (let i = 0; i < 30; i++) {
        const baseValue = generateSeededRandom(itemName, i);
        // 꾸준히 14-28개(1-2세트)
        const sets = Math.floor(1 + baseValue * 2); // 1-2세트
        const dailyDemand = sets * 14;
        demands.push(dailyDemand);
      }
      break;
      
    case 'irregular': // 불규칙 소모품 (계절상품 등)
      for (let i = 0; i < 30; i++) {
        const baseValue = generateSeededRandom(itemName, i);
        // 대부분 0-14개(0-1세트), 가끔 56-98개(4-7세트)
        const isHighDemand = baseValue > 0.8;
        const sets = isHighDemand 
          ? Math.floor(4 + baseValue * 4) // 4-7세트
          : Math.floor(baseValue * 2); // 0-1세트
        const dailyDemand = sets * 14;
        demands.push(dailyDemand);
      }
      break;
  }
  
  return demands;
};

export const generateInventoryForecast = (itemName: string, currentStock: number, leadTime: number): InventoryForecastData[] => {
  const today = new Date();
  const forecast: InventoryForecastData[] = [];
  
  // 품목별 소모 패턴에 따른 현실적인 수요 생성
  const pattern = getConsumptionPattern(itemName);
  const demandData = generateRealisticDemand(itemName, pattern);
  
  // 안전재고 개념 제거 - 자연스러운 재고 변화
  
  let runningStock = currentStock;
  const orderEvents: { orderDate: number; arrivalDate: number; quantity: number }[] = [];
  
  // 첫날 미리 주문 설정 (안전장치)
  const initialOrderQuantity = Math.ceil(demandData.slice(0, 15).reduce((sum, d) => sum + d, 0) / 14) * 14;
  orderEvents.push({
    orderDate: 0,
    arrivalDate: leadTime,
    quantity: initialOrderQuantity
  });
  
  // 절대 품절되지 않도록 하는 주문 계획 수립
  for (let day = 0; day < 25; day++) { // 30일 중 마지막 5일은 주문 계획에서 제외
    // 현재 재고 계산 (도착 예정 물량 포함)
    let currentStock = runningStock;
    
    // 오늘 도착하는 주문이 있다면 먼저 추가
    const todayArrival = orderEvents.find(order => order.arrivalDate === day);
    if (todayArrival) {
      currentStock += todayArrival.quantity;
    }
    
    // 리드타임 기간 동안 예정된 도착 물량 계산
    let upcomingArrivals = 0;
    for (let arrivalDay = day + 1; arrivalDay <= day + leadTime && arrivalDay < 30; arrivalDay++) {
      const arrival = orderEvents.find(order => order.arrivalDate === arrivalDay);
      if (arrival) {
        upcomingArrivals += arrival.quantity;
      }
    }
    
    // 리드타임 + 여유분 기간 동안의 예상 출고량 계산 (더 넉넉하게)
    const safePeriod = leadTime + 7; // 리드타임 + 1주 여유분
    const safePeriodDemand = demandData.slice(day, Math.min(day + safePeriod, 30))
      .reduce((sum, d) => sum + d, 0);
    
    // 7일치 수요량 계산
    const sevenDaysDemand = demandData.slice(day, Math.min(day + 7, 30))
      .reduce((sum, d) => sum + d, 0);
    
    // 현재 재고 + 도착 예정량이 7일치 수요량보다 적을 때만 주문
    const totalAvailable = currentStock + upcomingArrivals;
    
    if (totalAvailable < sevenDaysDemand) {
      // 오늘 주문 (리드타임 후 도착)
      const orderDay = day;
      const arrivalDay = day + leadTime;
      
      if (arrivalDay < 30) {
        // 이미 오늘 주문이 있는지 확인
        const existingOrder = orderEvents.find(order => order.orderDate === orderDay);
        
        if (!existingOrder) {
          // 부족한 만큼 + 넉넉한 여유분(한 달치) 주문
          const shortfall = safePeriodDemand * 1.2 - totalAvailable;
          const bufferAmount = demandData.slice(day, Math.min(day + 30, 30))
            .reduce((sum, d) => sum + d, 0);
          
          // 주문량 = 부족분 + 버퍼, 14개 단위로 올림
          const rawOrderQuantity = Math.max(shortfall, bufferAmount * 0.8);
          const orderQuantity = Math.ceil(rawOrderQuantity / 14) * 14;
          
          // 최소 주문량 (2주치)
          const minOrderQuantity = Math.ceil(demandData.slice(day, Math.min(day + 14, 30))
            .reduce((sum, d) => sum + d, 0) / 14) * 14;
          const finalOrderQuantity = Math.max(orderQuantity, minOrderQuantity);
          
          orderEvents.push({
            orderDate: orderDay,
            arrivalDate: arrivalDay,
            quantity: finalOrderQuantity
          });
        }
      }
    }
    
    // 현재 날짜의 실제 재고 변화 시뮬레이션
    if (todayArrival) {
      runningStock += todayArrival.quantity;
    }
    runningStock = Math.max(0, runningStock - demandData[day]);
  }
  
  // 최종 예측 데이터 생성
  runningStock = currentStock;
  
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    
    // 도착 처리
    const arrivalEvent = orderEvents.find(event => event.arrivalDate === i);
    if (arrivalEvent) {
      runningStock += arrivalEvent.quantity;
    }
    
    // 출고 처리 (최소 재고량 유지)
    const plannedDemand = demandData[i];
    const minStockLevel = 28; // 최소 재고량 (2세트)
    const maxAvailableForDemand = Math.max(0, runningStock - minStockLevel); // 출고 가능한 최대량
    const actualDemand = Math.min(plannedDemand, maxAvailableForDemand); // 최소 재고를 고려한 실제 출고량
    
    runningStock = runningStock - actualDemand; // 실제 출고된 만큼만 차감
    
    const orderEvent = orderEvents.find(event => event.orderDate === i);
    
    forecast.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      displayDate: format(currentDate, 'MM-dd'),
      demand: actualDemand,
      plannedDemand: plannedDemand,
      stockLevel: runningStock,
      isOrderDate: !!orderEvent,
      isArrivalDate: !!arrivalEvent,
      orderQuantity: orderEvent?.quantity,
      leadTimeStart: orderEvent ? format(currentDate, 'MM-dd') : undefined,
      leadTimeEnd: orderEvent ? format(new Date(currentDate.getTime() + leadTime * 24 * 60 * 60 * 1000), 'MM-dd') : undefined
    });
  }
  
  return forecast;
};

// 주문 이벤트 정보 추출
export const getOrderEvents = (forecast: InventoryForecastData[]) => {
  const events: { orderDate: string; arrivalDate: string; orderQuantity: number; leadTime: number }[] = [];
  
  forecast.forEach((day, index) => {
    if (day.isOrderDate && day.orderQuantity) {
      const arrivalDay = forecast.find(f => f.isArrivalDate && 
        Math.abs(new Date(f.date).getTime() - new Date(day.date).getTime()) / (1000 * 60 * 60 * 24) <= 10
      );
      
      if (arrivalDay) {
        const leadTimeDays = Math.abs(
          (new Date(arrivalDay.date).getTime() - new Date(day.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        events.push({
          orderDate: day.displayDate,
          arrivalDate: arrivalDay.displayDate,
          orderQuantity: day.orderQuantity,
          leadTime: leadTimeDays
        });
      }
    }
  });
  
  return events;
};