import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Data Interfaces
export interface InOutRecord {
  id: string;
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

