import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock Data Interfaces
export interface InOutRecord {
  id: number;
  type: "inbound" | "outbound";
  productName: string;
  sku: string;
  specification: string; // '규격'
  quantity: number;
  location: string; // '구역'
  company: string;
  status: "완료" | "진행 중" | "예약";
  destination: string;
  date: string;
  time: string;
}

export interface InOutRequest {
  id: string;
  type: "inbound" | "outbound";
  itemCode: string;
  itemName: string;
  quantity: number;
  companyCode: string;
  companyName: string;
  requestDate: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string;
  status: string;
  lastUpdate: string;
}

// Mock Data Arrays
export const mockInOutData: InOutRecord[] = [
  // From mockInOutHistoryData (status: "완료")
  {
    id: 1,
    type: "inbound",
    productName: "스마트폰 (갤럭시 S24)",
    sku: "SM-G998B",
    specification: "전자제품",
    quantity: 100,
    location: "창고1",
    company: "삼성전자",
    status: "완료",
    destination: "",
    date: "2024-07-10",
    time: "10:30",
  },
  {
    id: 2,
    type: "outbound",
    productName: "노트북 (LG 그램)",
    sku: "LG-17Z90P",
    specification: "전자제품",
    quantity: 50,
    location: "창고2",
    company: "LG전자",
    status: "완료",
    destination: "서울 강남점",
    date: "2024-07-10",
    time: "14:00",
  },
  {
    id: 3,
    type: "inbound",
    productName: "무선 이어폰 (버즈 프로)",
    sku: "SM-R190",
    specification: "악세서리",
    quantity: 200,
    location: "창고1",
    company: "삼성전자",
    status: "완료",
    destination: "",
    date: "2024-07-11",
    time: "09:00",
  },
  {
    id: 4,
    type: "outbound",
    productName: "태블릿 (아이패드 에어)",
    sku: "IPAD-AIR4",
    specification: "전자제품",
    quantity: 30,
    location: "창고3",
    company: "애플코리아",
    status: "완료",
    destination: "부산 해운대점",
    date: "2024-07-11",
    time: "11:00",
  },
  {
    id: 5,
    type: "inbound",
    productName: "스마트워치 (애플워치 S8)",
    sku: "AW-S8",
    specification: "악세서리",
    quantity: 70,
    location: "창고2",
    company: "애플코리아",
    status: "완료",
    destination: "",
    date: "2024-07-12",
    time: "16:00",
  },
  // From mockInOutStatusData
  {
    id: 6,
    type: "inbound",
    productName: "스마트폰 (갤럭시 S24)",
    sku: "SM-G998B",
    specification: "전자제품",
    quantity: 50,
    location: "창고1",
    company: "삼성전자",
    status: "예약",
    destination: "",
    date: "2024-07-16",
    time: "11:00",
  },
  {
    id: 7,
    type: "outbound",
    productName: "노트북 (LG 그램)",
    sku: "LG-17Z90P",
    specification: "전자제품",
    quantity: 20,
    location: "창고2",
    company: "LG전자",
    status: "진행 중",
    destination: "광주 서구점",
    date: "2024-07-15",
    time: "15:00",
  },
  {
    id: 8,
    type: "inbound",
    productName: "무선 이어폰 (버즈 프로)",
    sku: "SM-R190",
    specification: "악세서리",
    quantity: 100,
    location: "창고1",
    company: "삼성전자",
    status: "예약",
    destination: "",
    date: "2024-07-17",
    time: "09:30",
  },
  {
    id: 9,
    type: "outbound",
    productName: "태블릿 (아이패드 에어)",
    sku: "IPAD-AIR4",
    specification: "전자제품",
    quantity: 15,
    location: "창고3",
    company: "애플코리아",
    status: "예약",
    destination: "대구 수성점",
    date: "2024-07-16",
    time: "13:00",
  },
];

export const mockInOutRequests: InOutRequest[] = [
  {
    id: "req-001",
    type: "inbound",
    itemCode: "ITEM-001",
    itemName: "게이밍 마우스",
    quantity: 50,
    companyCode: "COMP-001",
    companyName: "로지텍",
    requestDate: "2024-07-15",
    notes: "신규 모델 입고 요청",
    status: "pending",
  },
  {
    id: "req-002",
    type: "outbound",
    itemCode: "ITEM-002",
    itemName: "기계식 키보드",
    quantity: 20,
    companyCode: "COMP-002",
    companyName: "앱코",
    requestDate: "2024-07-14",
    notes: "온라인 판매 출고 요청",
    status: "pending",
  },
  {
    id: "req-003",
    type: "inbound",
    itemCode: "ITEM-003",
    itemName: "웹캠",
    quantity: 30,
    companyCode: "COMP-001",
    companyName: "로지텍",
    requestDate: "2024-07-13",
    notes: "재고 보충",
    status: "approved",
  },
  {
    id: "req-004",
    type: "outbound",
    itemCode: "ITEM-004",
    itemName: "모니터",
    quantity: 10,
    companyCode: "COMP-003",
    companyName: "삼성디스플레이",
    requestDate: "2024-07-12",
    notes: "전시용품 출고",
    status: "rejected",
  },
];


export const mockInventoryData: InventoryItem[] = [
  {
    id: 1,
    name: "스마트폰 (갤럭시 S24)",
    sku: "SM-G998B",
    category: "전자제품",
    quantity: 150,
    location: "창고1",
    status: "정상",
    lastUpdate: "2024-07-15 10:30",
  },
  {
    id: 2,
    name: "노트북 (LG 그램)",
    sku: "LG-17Z90P",
    category: "전자제품",
    quantity: 75,
    location: "창고2",
    status: "정상",
    lastUpdate: "2024-07-15 14:00",
  },
  {
    id: 3,
    name: "무선 이어폰 (버즈 프로)",
    sku: "SM-R190",
    category: "악세서리",
    quantity: 25,
    location: "창고1",
    status: "부족",
    lastUpdate: "2024-07-15 09:00",
  },
  {
    id: 4,
    name: "태블릿 (아이패드 에어)",
    sku: "IPAD-AIR4",
    category: "전자제품",
    quantity: 10,
    location: "창고3",
    status: "위험",
    lastUpdate: "2024-07-15 11:00",
  },
  {
    id: 5,
    name: "스마트워치 (애플워치 S8)",
    sku: "AW-S8",
    category: "악세서리",
    quantity: 80,
    location: "창고2",
    status: "정상",
    lastUpdate: "2024-07-15 16:00",
  },
  {
    id: 6,
    name: "USB-C 케이블",
    sku: "CABLE-USBC-001",
    category: "케이블",
    quantity: 500,
    location: "창고4",
    status: "정상",
    lastUpdate: "2024-07-14 10:00",
  },
  {
    id: 7,
    name: "HDMI 케이블",
    sku: "CABLE-HDMI-001",
    category: "케이블",
    quantity: 120,
    location: "창고4",
    status: "정상",
    lastUpdate: "2024-07-14 11:00",
  },
  {
    id: 8,
    name: "무선 충전기",
    sku: "CHARGER-WIRELESS-001",
    category: "충전기",
    quantity: 40,
    location: "창고1",
    status: "부족",
    lastUpdate: "2024-07-15 08:00",
  },
  {
    id: 9,
    name: "보조 배터리",
    sku: "BATTERY-POWER-001",
    category: "배터리",
    quantity: 60,
    location: "창고2",
    status: "정상",
    lastUpdate: "2024-07-15 13:00",
  },
  {
    id: 10,
    name: "외장하드 1TB",
    sku: "HDD-EXT-1TB",
    category: "저장장치",
    quantity: 15,
    location: "창고3",
    status: "정상",
    lastUpdate: "2024-07-14 15:00",
  },
];
