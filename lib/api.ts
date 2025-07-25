// lib/api.ts

import { Company } from '@/components/company/company-list';
import { Item } from '@/components/item/item-list';
import { InOutRecord, InOutRequest, InventoryItem } from '@/components/utils';
import { User } from '@/app/(main)/layout';
import { Schedule } from '@/app/(main)/schedule/page';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://smart-wms-be.onrender.com', // Use root path
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  return response.data;
}

export async function logout() {
  await apiClient.post('/api/auth/logout');
}

// --- Companies ---
export async function fetchCompanies(): Promise<Company[]> {
  const response = await apiClient.get('/api/companies');
  return handleResponse(response);
}

export async function createCompany(companyData: Omit<Company, 'id'>): Promise<Company> {
  const response = await apiClient.post('/api/companies', companyData);
  return handleResponse(response);
}

export async function updateCompany(id: string, companyData: Partial<Company>): Promise<Company> {
  const response = await apiClient.put(`/api/companies/${Number(id)}`, companyData);
  return handleResponse(response);
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/api/companies/${Number(id)}`);
}


// --- Items ---
export async function fetchItems(): Promise<Item[]> {
  const response = await apiClient.get('/api/items');
  return handleResponse(response);
}

export async function createItem(itemData: Omit<Item, 'id'>): Promise<Item> {
  const response = await apiClient.post('/api/items', itemData);
  return handleResponse(response);
}

export async function updateItem(id: string, itemData: Partial<Item>): Promise<Item> {
  const response = await apiClient.put(`/api/items/${Number(id)}`, itemData);
  return handleResponse(response);
}

export async function deleteItem(id: string): Promise<void> {
  await apiClient.delete(`/api/items/${Number(id)}`);
}


// --- InOut ---
export async function fetchInOutData(): Promise<InOutRecord[]> {
  const response = await apiClient.get('/api/inout/orders');
  return handleResponse(response);
}

export async function fetchInOutRequests(): Promise<InOutRequest[]> {
  const response = await apiClient.get('/api/inout/orders');
  return handleResponse(response);
}

export async function createInboundOrder(orderData: Omit<InOutRequest, 'id' | 'status' | 'createdAt'>): Promise<InOutRequest> {
  const response = await apiClient.post('/api/inout/orders', { ...orderData, type: 'INBOUND' });
  return handleResponse(response);
}

export async function createOutboundOrder(orderData: Omit<InOutRequest, 'id' | 'status' | 'createdAt'>): Promise<InOutRequest> {
  const response = await apiClient.post('/api/inout/orders', { ...orderData, type: 'OUTBOUND' });
  return handleResponse(response);
}

export async function updateInOutRecord(id: string, recordData: Partial<InOutRecord>): Promise<InOutRecord> {
  const response = await apiClient.put(`/api/inout/orders/${Number(id)}/status`, recordData);
  return handleResponse(response);
}


// --- Inventory ---
export async function fetchInventoryData(): Promise<InventoryItem[]> {
  const response = await apiClient.get('/api/inventory');
  return handleResponse(response);
}

// --- Schedules ---
export async function fetchSchedules(startDate?: string, endDate?: string): Promise<Schedule[]> {
  const params: { start_date?: string; end_date?: string } = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await apiClient.get('/api/schedules', { params });
  return handleResponse(response);
}

// --- Users ---
export async function fetchUsers(): Promise<User[]> {
    const response = await apiClient.get('/api/users');
    return handleResponse(response);
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const response = await apiClient.post('/api/users', userData);
  return handleResponse(response);
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  const response = await apiClient.put(`/api/users/${Number(id)}`, userData);
  return handleResponse(response);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/api/users/${Number(id)}`);
}
