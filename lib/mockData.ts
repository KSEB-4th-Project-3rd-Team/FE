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
  
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    
    const dayOfWeek = currentDate.getDay(); // 0 = 일요일, 6 = 토요일
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // 기본 수요량 (14개 단위로 0~98개 사이)
    const baseRandomValue = generateSeededRandom(itemName, i);
    const baseDemand = Math.floor(baseRandomValue * 7) * 14; // 0, 14, 28, 42, 56, 70, 84, 98
    
    // 평일/주말 조정
    let adjustedDemand = baseDemand;
    if (isWeekend) {
      adjustedDemand = Math.floor(baseDemand * 0.6 / 14) * 14; // 주말은 60%로 감소, 14개 단위 유지
    }
    
    forecast.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      demand: adjustedDemand,
      displayDate: format(currentDate, 'MM-dd')
    });
  }
  
  return forecast;
};

export const getLeadTimeForItem = (itemName: string) => {
  const hash = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const leadTimes = [2, 3, 4, 5, 7, 10]; // 현실적인 리드타임 옵션들
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