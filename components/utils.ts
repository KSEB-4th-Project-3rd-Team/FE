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
  individualCode: string; // 개별코드
  specification: string; // '규격'
  quantity: number;
  location: string; // '구역'
  company: string;
  companyCode: string;
  status: "완료" | "진행 중" | "예약";
  destination: string;
  date: string;
  time: string;
  notes: string;
}

export interface InOutRequest {
  id: string;
  type: "inbound" | "outbound";
  itemCode: string;
  itemName: string;
  specification: string;
  quantity: number;
  companyCode: string;
  companyName: string;
  scheduledDateTime: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  specification: string;
  quantity: number;
  inboundScheduled: number;
  outboundScheduled: number;
  location: string;
  status: string;
  lastUpdate: string;
}

// Mock Data Arrays
const generateRandomData = () => {
  const data: InOutRecord[] = [];
  const productDetails = [
    { productName: "스마트폰 (갤럭시 S24)", sku: "SM-G998B", specification: "전자제품", company: "삼성전자", companyCode: "COMP-003" },
    { productName: "노트북 (LG 그램)", sku: "LG-17Z90P", specification: "전자제품", company: "LG전자", companyCode: "COMP-004" },
    { productName: "무선 이어폰 (버즈 프로)", sku: "SM-R190", specification: "악세서리", company: "삼성전자", companyCode: "COMP-003" },
    { productName: "태블릿 (아이패드 에어)", sku: "IPAD-AIR4", specification: "전자제품", company: "애플코리아", companyCode: "COMP-005" },
    { productName: "스마트워치 (애플워치 S8)", sku: "AW-S8", specification: "악세서리", company: "애플코리아", companyCode: "COMP-005" },
    { productName: "스마트폰 (갤럭시 S24)", sku: "SM-G998B", specification: "전자제품", company: "하이마트", companyCode: "COMP-006" },
    { productName: "무선 이어폰 (버즈 프로)", sku: "SM-R190", specification: "악세서리", company: "전자랜드", companyCode: "COMP-007" },
    { productName: "노트북 (LG 그램)", sku: "LG-17Z90P", specification: "전자제품", company: "이마트", companyCode: "COMP-008" },
  ];
  const locations = ["창고1", "창고2", "창고3"];
  const statuses: ("완료" | "진행 중" | "예약")[] = ["완료", "완료", "완료", "완료", "진행 중", "예약"];

  let id = 1;
  const today = new Date("2025-07-15T00:00:00.000Z");

  for (let i = 0; i < 12; i++) { // Last 12 months
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    
    const numberOfEntries = Math.floor(Math.random() * 15) + 5; // 5 to 20 entries per month

    for (let j = 0; j < numberOfEntries; j++) {
      const day = Math.floor(Math.random() * 28) + 1;
      date.setDate(day);
      
      const product = productDetails[Math.floor(Math.random() * productDetails.length)];
      const type = Math.random() > 0.4 ? "outbound" : "inbound";
      
      data.push({
        id: id++,
        type: type,
        productName: product.productName,
        sku: product.sku,
        individualCode: `P${String(id).padStart(3, '0')}-${String(j).padStart(3, '0')}`,
        specification: product.specification,
        quantity: Math.floor(Math.random() * 100) + 1,
        location: locations[Math.floor(Math.random() * locations.length)],
        company: product.company,
        companyCode: product.companyCode,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        destination: type === "outbound" ? `지점-${id % 10}` : "",
        date: date.toISOString().split('T')[0],
        time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        notes: ""
      });
    }
  }
  return data;
};

export const mockInOutData: InOutRecord[] = generateRandomData();


export const mockInOutRequests: InOutRequest[] = [
  { id: "req-001", type: "inbound", itemCode: "ITEM-001", itemName: "게이밍 마우스", specification: "G-Pro-Wireless", quantity: 50, companyCode: "COMP-001", companyName: "로지텍", scheduledDateTime: "2025-07-20T10:00:00", notes: "신규 모델 입고 요청", status: "pending", },
  { id: "req-002", type: "outbound", itemCode: "ITEM-002", itemName: "기계식 키보드", specification: "K70-RGB-MK.2", quantity: 20, companyCode: "COMP-002", companyName: "커세어", scheduledDateTime: "2025-07-21T14:30:00", notes: "온라인 판매 출고 요청", status: "pending", },
  { id: "req-003", type: "inbound", itemCode: "ITEM-003", itemName: "웹캠", specification: "C922-Pro-Stream", quantity: 30, companyCode: "COMP-001", companyName: "로지텍", scheduledDateTime: "2025-07-22T09:00:00", notes: "재고 보충", status: "approved", },
  { id: "req-004", type: "outbound", itemCode: "ITEM-004", itemName: "모니터", specification: "Odyssey-G7", quantity: 10, companyCode: "COMP-003", companyName: "삼성디스플레이", scheduledDateTime: "2025-07-23T11:00:00", notes: "전시용품 출고", status: "rejected", },
  // Added for pagination test
  { id: "req-005", type: "inbound", itemCode: "ITEM-005", itemName: "마이크", specification: "Yeti", quantity: 15, companyCode: "COMP-001", companyName: "로지텍", scheduledDateTime: "2025-07-24T10:00:00", notes: "", status: "pending", },
  { id: "req-006", type: "outbound", itemCode: "ITEM-006", itemName: "헤드셋", specification: "Astro A50", quantity: 5, companyCode: "COMP-001", companyName: "로지텍", scheduledDateTime: "2025-07-24T11:00:00", notes: "", status: "pending", },
  { id: "req-007", type: "inbound", itemCode: "ITEM-007", itemName: "스피커", specification: "Z906", quantity: 2, companyCode: "COMP-001", companyName: "로지텍", scheduledDateTime: "2025-07-25T10:00:00", notes: "", status: "pending", },
  { id: "req-008", type: "outbound", itemCode: "ITEM-008", itemName: "레이싱 휠", specification: "G29", quantity: 3, companyCode: "COMP-001", companyName: "로지텍", scheduledDateTime: "2025-07-25T14:00:00", notes: "", status: "pending", },
  { id: "req-009", type: "inbound", itemCode: "ITEM-009", itemName: "그래픽카드", specification: "RTX 4090", quantity: 10, companyCode: "COMP-006", companyName: "NVIDIA", scheduledDateTime: "2025-07-26T09:00:00", notes: "", status: "approved", },
  { id: "req-010", type: "outbound", itemCode: "ITEM-010", itemName: "CPU", specification: "Intel i9", quantity: 10, companyCode: "COMP-007", companyName: "Intel", scheduledDateTime: "2025-07-26T11:00:00", notes: "", status: "rejected", },
  { id: "req-011", type: "inbound", itemCode: "ITEM-011", itemName: "RAM", specification: "DDR5 32GB", quantity: 50, companyCode: "COMP-003", companyName: "하이닉스", scheduledDateTime: "2025-07-27T13:00:00", notes: "", status: "approved", },
  { id: "req-012", type: "outbound", itemCode: "ITEM-012", itemName: "SSD", specification: "Samsung 980 Pro", quantity: 25, companyCode: "COMP-001", companyName: "삼성전자", scheduledDateTime: "2025-07-27T15:00:00", notes: "", status: "rejected", },
  { id: "req-013", type: "inbound", itemCode: "ITEM-013", itemName: "파워서플라이", specification: "Corsair 850W", quantity: 20, companyCode: "COMP-002", companyName: "커세어", scheduledDateTime: "2025-07-28T10:00:00", notes: "", status: "approved", },
];


export const mockInventoryData: InventoryItem[] = [
  {
    id: 1,
    name: "스마트폰 (갤럭시 S24)",
    sku: "SM-G998B",
    specification: "전자제품",
    quantity: 150,
    inboundScheduled: 50,
    outboundScheduled: 20,
    location: "창고1",
    status: "정상",
    lastUpdate: "2025-07-15 10:30",
  },
  {
    id: 2,
    name: "노트북 (LG 그램)",
    sku: "LG-17Z90P",
    specification: "전자제품",
    quantity: 75,
    inboundScheduled: 0,
    outboundScheduled: 10,
    location: "창고2",
    status: "정상",
    lastUpdate: "2025-07-15 14:00",
  },
  {
    id: 3,
    name: "무선 이어폰 (버즈 프로)",
    sku: "SM-R190",
    specification: "악세서리",
    quantity: 25,
    inboundScheduled: 100,
    outboundScheduled: 30,
    location: "창고1",
    status: "부족",
    lastUpdate: "2025-07-15 09:00",
  },
  {
    id: 4,
    name: "태블릿 (아이패드 에어)",
    sku: "IPAD-AIR4",
    specification: "전자제품",
    quantity: 10,
    inboundScheduled: 20,
    outboundScheduled: 5,
    location: "창고3",
    status: "위험",
    lastUpdate: "2025-07-15 11:00",
  },
  {
    id: 5,
    name: "스마트워치 (애플워치 S8)",
    sku: "AW-S8",
    specification: "악세서리",
    quantity: 80,
    inboundScheduled: 0,
    outboundScheduled: 0,
    location: "창고2",
    status: "정상",
    lastUpdate: "2025-07-15 16:00",
  },
  {
    id: 6,
    name: "USB-C 케이블",
    sku: "CABLE-USBC-001",
    specification: "케이블",
    quantity: 500,
    inboundScheduled: 200,
    outboundScheduled: 100,
    location: "창고4",
    status: "정상",
    lastUpdate: "2025-07-14 10:00",
  },
  {
    id: 7,
    name: "HDMI 케이블",
    sku: "CABLE-HDMI-001",
    specification: "케이블",
    quantity: 120,
    inboundScheduled: 50,
    outboundScheduled: 60,
    location: "창고4",
    status: "정상",
    lastUpdate: "2025-07-14 11:00",
  },
  {
    id: 8,
    name: "무선 충전기",
    sku: "CHARGER-WIRELESS-001",
    specification: "충전기",
    quantity: 40,
    inboundScheduled: 50,
    outboundScheduled: 10,
    location: "창고1",
    status: "부족",
    lastUpdate: "2025-07-15 08:00",
  },
  {
    id: 9,
    name: "보조 배터리",
    sku: "BATTERY-POWER-001",
    specification: "배터리",
    quantity: 60,
    inboundScheduled: 0,
    outboundScheduled: 20,
    location: "창고2",
    status: "정상",
    lastUpdate: "2025-07-15 13:00",
  },
  {
    id: 10,
    name: "외장하드 1TB",
    sku: "HDD-EXT-1TB",
    specification: "저장장치",
    quantity: 15,
    inboundScheduled: 30,
    outboundScheduled: 5,
    location: "창고3",
    status: "정상",
    lastUpdate: "2025-07-14 15:00",
  },
];