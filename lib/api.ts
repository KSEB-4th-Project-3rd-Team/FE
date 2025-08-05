// lib/api.ts

import { Company } from '@/components/company/company-list';
import { Item } from '@/components/item/item-list';
import { InOutRecord, InOutRequest, InventoryItem } from '@/components/utils';
import { User } from '@/app/(main)/layout';

// --- Types ---
// 타입을 한 곳에서 관리하여 재사용성을 높입니다.

// Response-specific types
export interface ItemResponse {
  itemId: number;
  itemName: string;
  itemCode: string;
  itemGroup: string;
  spec: string;
  unit: string;
  unitPriceIn: number;
  unitPriceOut: number;
  createdAt: string;
}

export interface UserResponse {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  lastLogin: string;
  joinedAt: string;
}

export interface InOutOrderItemResponse {
  itemId: number;
  itemCode: string;
  itemName: string;
  specification: string;
  requestedQuantity: number;
  actualQuantity: number | null;
}

export interface InOutOrderResponse {
  orderId: number;
  type: 'INBOUND' | 'OUTBOUND';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  companyId: number;
  companyCode: string;
  companyName: string;
  items: InOutOrderItemResponse[];
  expectedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryResponse {
  itemId: number;
  itemName: string;
  locationCode: string;
  quantity: number;
  lastUpdated: string;
}

export interface ScheduleResponse {
  scheduleId: number;
  title: string;
  startTime: string;
  endTime: string;
  type: "INBOUND" | "OUTBOUND" | "INVENTORY_CHECK" | "MEETING" | "ETC";
}

export interface DashboardSummaryResponse {
  totalItems: number;
  totalInventory: number;
  inboundPending: number;
  outboundPending: number;
}

// The main dashboard data structure
export interface DashboardData {
  items: ItemResponse[];
  users: UserResponse[];
  orders: InOutOrderResponse[];
  inventory: InventoryResponse[];
  schedules: ScheduleResponse[];
  summary: DashboardSummaryResponse;
  totalLoadTime: number;
}


// import { Schedule } from '@/app/(main)/schedule/page';
// import { DashboardSummary } from '@/components/dashboard/unified-dashboard'; // Import DashboardSummary type
type DashboardSummary = any;
import axios from 'axios';

// --- Dashboard ---
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get('/api/dashboard/summary');
  return handleResponse(response);
}

/*
export async function fetchDashboardAll(): Promise<DashboardData> {
  const response = await apiClient.get('/api/dashboard/all');
  return handleResponse(response);
}
*/

export const api = {
  post: async (url: string, data: any) => {
    const response = await apiClient.post(url, data);
    return response.data;
  },
  get: async (url: string) => {
    const response = await apiClient.get(url);
    return response.data;
  }
};

const apiClient = axios.create({
  baseURL: 'https://smart-wms-be.onrender.com', // Use root path
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to include the token and prevent caching
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add timestamp to prevent caching
  if (config.params) {
    config.params._t = Date.now();
  } else {
    config.params = { _t: Date.now() };
  }
  
  return config;
});


// Helper function to handle API responses
async function handleResponse<T>(response: { data: T }): Promise<T> {
  return response.data;
}

// --- Auth ---
export async function login(username: string, password: string): Promise<{ user: User; message: string }> {
  const response = await apiClient.post('/api/auth/login', { username, password });
  const backendData = response.data;
  
  return {
    message: backendData.message,
    user: {
      id: backendData.user.user_id,
      username: backendData.user.username,
      email: backendData.user.email,
      fullName: backendData.user.full_name,
      role: backendData.user.role,
      status: 'ACTIVE',
      lastLogin: new Date().toLocaleString('ko-KR'),
      createdAt: backendData.user.joinedAt ? new Date(backendData.user.joinedAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR')
    }
  };
}

export async function signup(userData: { username: string; password: string; fullName: string; email: string }): Promise<User> {
  const response = await apiClient.post('/api/users', {
    username: userData.username,
    password: userData.password,
    fullName: userData.fullName,
    email: userData.email,
    role: 'USER'
  });
  const backendUser = await handleResponse(response);
  
  return {
    id: backendUser.userId,
    username: backendUser.username,
    email: backendUser.email,
    fullName: backendUser.fullName,
    role: backendUser.role,
    status: backendUser.status,
    lastLogin: backendUser.lastLogin ? new Date(backendUser.lastLogin).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) : '접속 기록 없음',
    createdAt: backendUser.joinedAt ? new Date(backendUser.joinedAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR')
  };
}

export async function checkSession(): Promise<{ user: User }> {
  const response = await apiClient.get('/api/auth/me');
  const backendData = response.data;
  
  return {
    user: {
      id: backendData.user_id,
      username: backendData.username,
      email: backendData.email,
      fullName: backendData.full_name,
      role: backendData.role,
      status: 'ACTIVE',
      lastLogin: new Date().toLocaleString('ko-KR'),
      createdAt: backendData.joinedAt ? new Date(backendData.joinedAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR')
    }
  };
}

export async function logout() {
  await apiClient.post('/api/auth/logout');
}

// --- Companies ---
export async function fetchCompanies(): Promise<Company[]> {
  const response = await apiClient.get('/api/companies');
  return handleResponse(response);
}

export async function createCompany(companyData: Omit<Company, 'companyId'>): Promise<Company> {
  const response = await apiClient.post('/api/companies', companyData);
  return handleResponse(response);
}

export async function updateCompany(id: string, companyData: Partial<Company>): Promise<Company> {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new Error("Invalid company ID provided for update.");
  }
  const response = await apiClient.put(`/api/companies/${numericId}`, companyData);
  return handleResponse(response);
}

export async function deleteCompany(id: string): Promise<void> {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new Error("Invalid company ID provided for delete.");
  }
  await apiClient.delete(`/api/companies/${numericId}`);
}


// --- Items ---
export async function fetchItems(): Promise<Item[]> {
  const response = await apiClient.get('/api/items');
  return handleResponse(response);
}

export async function createItem(itemData: Omit<Item, 'itemId'>): Promise<Item> {
  const response = await apiClient.post('/api/items', itemData);
  return handleResponse(response);
}

export async function updateItem(id: string, itemData: Partial<Item>): Promise<Item> {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new Error("Invalid item ID provided for update.");
  }
  const response = await apiClient.put(`/api/items/${numericId}`, itemData);
  return handleResponse(response);
}

export async function deleteItem(id: string | number): Promise<void> {
  const numericId = Number(id);
  if (isNaN(numericId) || numericId <= 0) {
    throw new Error(`Invalid item ID provided for delete: ${id}`);
  }
  await apiClient.delete(`/api/items/${numericId}`);
}


// --- InOut ---
// 원시 API 데이터만 반환 (중복 호출 제거)
export async function fetchRawInOutData(): Promise<any[]> {
  const response = await apiClient.get('/api/inout/orders');
  return handleResponse(response);
}

// 기존 함수는 호환성 유지를 위해 유지하되, 단순화
export async function fetchInOutData(): Promise<InOutRecord[]> {
  // 원시 데이터만 가져오기 (중복 호출 제거!)
  const allData = await fetchRawInOutData();
  
  // Filter for completed records only
  const completedData = allData.filter(record => record.status === 'COMPLETED');
  
  // Transform data to match InOutRecord interface (프론트에서 조합)
  const transformedData = completedData.flatMap(record => {
    return record.items.map((item, itemIndex) => {
      const dateTime = record.createdAt || record.updatedAt || new Date().toISOString();
      const date = dateTime.split('T')[0];
      const time = dateTime.split('T')[1]?.substring(0, 8) || '00:00:00';
      
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
        status: record.status === 'COMPLETED' ? '완료' : '진행 중',
        destination: 'N/A',
        date: date,
        time: time,
        notes: 'N/A'
      };
    });
  });
  
  return transformedData;
}

export async function fetchInOutRequests(): Promise<InOutRequest[]> {
  // 원시 데이터 재사용 (중복 호출 제거!)
  const allData = await fetchRawInOutData();
  // Filter for pending requests only
  return allData.filter(record => record.status === 'PENDING');
}

export interface InOutOrderItem {
  itemId: number;
  quantity: number;
}

export interface InOutOrderRequest {
  type: 'INBOUND' | 'OUTBOUND';
  companyId: number;
  expectedDate: string; // ISO format YYYY-MM-DD
  items: InOutOrderItem[];
}

export async function createInboundOrder(orderData: { itemId: number; quantity: number; companyId?: number; expectedDate?: string; notes?: string }): Promise<any> {
  const requestData: InOutOrderRequest = {
    type: 'INBOUND',
    companyId: orderData.companyId || 1, // Default company if not provided
    expectedDate: orderData.expectedDate || new Date().toISOString().split('T')[0],
    items: [{
      itemId: orderData.itemId,
      quantity: orderData.quantity
    }]
  };
  
  // Create the order
  const response = await apiClient.post('/api/inout/orders', requestData);
  const result = await handleResponse(response);
  
  // Immediately approve the order to move it to completed status
  if (result.orderId) {
    try {
      await apiClient.put(`/api/inout/orders/${result.orderId}/status`, {
        status: 'COMPLETED'
      });
    } catch (error) {
      console.warn('Failed to auto-approve inbound order:', error);
    }
  }
  
  return result;
}

export async function createOutboundOrder(orderData: { itemId: number; quantity: number; companyId?: number; expectedDate?: string; notes?: string }): Promise<any> {
  const requestData: InOutOrderRequest = {
    type: 'OUTBOUND',
    companyId: orderData.companyId || 1, // Default company if not provided
    expectedDate: orderData.expectedDate || new Date().toISOString().split('T')[0],
    items: [{
      itemId: orderData.itemId,
      quantity: orderData.quantity
    }]
  };
  
  // Create the order
  const response = await apiClient.post('/api/inout/orders', requestData);
  const result = await handleResponse(response);
  
  // Immediately approve the order to move it to completed status
  if (result.orderId) {
    try {
      await apiClient.put(`/api/inout/orders/${result.orderId}/status`, {
        status: 'COMPLETED'
      });
    } catch (error) {
      console.warn('Failed to auto-approve outbound order:', error);
    }
  }
  
  return result;
}

export async function updateInOutRecord(id: string, recordData: Partial<InOutRecord>): Promise<InOutRecord> {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new Error("Invalid InOut record ID provided for update.");
  }
  const response = await apiClient.put(`/api/inout/orders/${numericId}/status`, recordData);
  return handleResponse(response);
}


// --- Inventory ---
export interface BackendInventoryResponse {
  itemId: number;
  itemName: string;
  locationCode: string;
  quantity: number;
  lastUpdated: string;
}

// 원시 재고 데이터만 반환 (중복 호출 제거)
export async function fetchRawInventoryData(): Promise<BackendInventoryResponse[]> {
  const response = await apiClient.get('/api/inventory');
  return handleResponse(response);
}

// 기존 함수는 호환성 유지하되 중복 호출 제거
export async function fetchInventoryData(): Promise<InventoryItem[]> {
  const backendData = await fetchRawInventoryData();
  
  // If no inventory data exists, return empty array
  if (!backendData || backendData.length === 0) {
    console.log('No inventory data found in backend');
    return [];
  }
  
  // 기본 변환만 수행 (상세 정보는 React Query에서 조합)
  const transformedData: InventoryItem[] = backendData.map((backendItem, index) => {
    // Determine status based on quantity
    let status = '정상';
    if (backendItem.quantity <= 0) {
      status = '위험';
    } else if (backendItem.quantity <= 10) {
      status = '부족';
    }
    
    return {
      id: index + 1,
      name: backendItem.itemName,
      sku: `SKU-${backendItem.itemId}`, // 기본값만 사용
      specification: 'N/A', // 기본값, React Query에서 조합
      quantity: backendItem.quantity,
      inboundScheduled: 0, // React Query에서 계산
      outboundScheduled: 0, // React Query에서 계산
      location: backendItem.locationCode,
      status: status,
      lastUpdate: new Date(backendItem.lastUpdated).toLocaleString('ko-KR')
    };
  });
  
  return transformedData;
}

// --- Schedules ---
export interface Schedule {
  scheduleId: number;
  title: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  type: "INBOUND" | "OUTBOUND" | "INVENTORY_CHECK" | "MEETING" | "ETC";
}

export interface CreateScheduleRequest {
  title: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  type: "INBOUND" | "OUTBOUND" | "INVENTORY_CHECK" | "MEETING" | "ETC";
}

export async function fetchSchedules(startDate?: string, endDate?: string): Promise<Schedule[]> {
  const params: { start_date?: string; end_date?: string } = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await apiClient.get('/api/schedules', { params });
  return handleResponse(response);
}

export async function createSchedule(scheduleData: CreateScheduleRequest): Promise<Schedule> {
  const response = await apiClient.post('/api/schedules', scheduleData);
  return handleResponse(response);
}

export async function deleteSchedule(id: string | number): Promise<void> {
  const numericId = Number(id);
  if (isNaN(numericId) || numericId <= 0) {
    throw new Error(`Invalid schedule ID provided for delete: ${id}`);
  }
  await apiClient.delete(`/api/schedules/${numericId}`);
}

// --- Users ---
export async function fetchUsers(): Promise<User[]> {
    const response = await apiClient.get('/api/users');
    const backendUsers = await handleResponse(response);
    
    return backendUsers.map((user: any) => ({
        id: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : '접속 기록 없음',
        createdAt: user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR')
    }));
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const response = await apiClient.post('/api/users', {
    username: userData.username,
    email: userData.email,
    fullName: userData.fullName,
    password: 'defaultPassword123',
    role: userData.role
  });
  const backendUser = await handleResponse(response);
  
  return {
    id: backendUser.userId,
    username: backendUser.username,
    email: backendUser.email,
    fullName: backendUser.fullName,
    role: backendUser.role,
    status: backendUser.status,
    lastLogin: backendUser.lastLogin ? new Date(backendUser.lastLogin).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) : '접속 기록 없음',
    createdAt: backendUser.joinedAt ? new Date(backendUser.joinedAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR')
  };
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new Error("Invalid user ID provided for update.");
  }
  
  const updateData: any = {};
  if (userData.username) updateData.username = userData.username;
  if (userData.email) updateData.email = userData.email;
  if (userData.fullName) updateData.fullName = userData.fullName;
  if (userData.role) updateData.role = userData.role;
  if (userData.status) updateData.status = userData.status;
  
  const response = await apiClient.put(`/api/users/${numericId}`, updateData);
  const backendUser = await handleResponse(response);
  
  return {
    id: backendUser.userId,
    username: backendUser.username,
    email: backendUser.email,
    fullName: backendUser.fullName,
    role: backendUser.role,
    status: backendUser.status,
    lastLogin: backendUser.lastLogin ? new Date(backendUser.lastLogin).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) : '접속 기록 없음',
    createdAt: backendUser.joinedAt ? new Date(backendUser.joinedAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR')
  };
}

export async function deleteUser(id: string): Promise<void> {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new Error("Invalid user ID provided for delete.");
  }
  await apiClient.delete(`/api/users/${numericId}`);
}

