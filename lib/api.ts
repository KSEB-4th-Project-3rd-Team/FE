// lib/api.ts

import { Company } from '@/components/company/company-list';
import { Item } from '@/components/item/item-list';
import { InOutRecord, InOutRequest, InventoryItem } from '@/components/utils';
import { User } from '@/app/(main)/layout';
import { Schedule } from '@/app/(main)/schedule/page';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use((config) => {
  // In a real app, you would get the token from localStorage or a state management library
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
export async function login(username: string, password: string): Promise<{ user: User; token: string }> {
  const response = await apiClient.post('/auth/login', { username, password });
  const { token, ...user } = response.data;
  if (typeof window !== 'undefined' && token) {
    localStorage.setItem('authToken', token);
  }
  return { user, token };
}

export async function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
  // Optionally, call a backend endpoint to invalidate the token
  // await apiClient.post('/auth/logout');
}


// --- Companies ---
export async function fetchCompanies(): Promise<Company[]> {
  const response = await apiClient.get('/companies');
  return handleResponse(response);
}

export async function createCompany(companyData: Omit<Company, 'id'>): Promise<Company> {
  const response = await apiClient.post('/companies', companyData);
  return handleResponse(response);
}

export async function updateCompany(id: string, companyData: Partial<Company>): Promise<Company> {
  const response = await apiClient.put(`/companies/${id}`, companyData);
  return handleResponse(response);
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/companies/${id}`);
}


// --- Items ---
export async function fetchItems(): Promise<Item[]> {
  const response = await apiClient.get('/items');
  return handleResponse(response);
}

export async function createItem(itemData: Omit<Item, 'id'>): Promise<Item> {
  const response = await apiClient.post('/items', itemData);
  return handleResponse(response);
}

export async function updateItem(id: string, itemData: Partial<Item>): Promise<Item> {
  const response = await apiClient.put(`/items/${id}`, itemData);
  return handleResponse(response);
}

export async function deleteItem(id: string): Promise<void> {
  await apiClient.delete(`/items/${id}`);
}


// --- InOut ---
export async function fetchInOutData(): Promise<InOutRecord[]> {
  const response = await apiClient.get('/inout/history');
  return handleResponse(response);
}

export async function fetchInOutRequests(): Promise<InOutRequest[]> {
  const response = await apiClient.get('/inout/requests');
  return handleResponse(response);
}

export async function createInboundOrder(orderData: Omit<InOutRequest, 'id' | 'status' | 'createdAt'>): Promise<InOutRequest> {
  const response = await apiClient.post('/inout/inbound', orderData);
  return handleResponse(response);
}

export async function createOutboundOrder(orderData: Omit<InOutRequest, 'id' | 'status' | 'createdAt'>): Promise<InOutRequest> {
  const response = await apiClient.post('/inout/outbound', orderData);
  return handleResponse(response);
}

export async function updateInOutRecord(id: string, recordData: Partial<InOutRecord>): Promise<InOutRecord> {
  const response = await apiClient.put(`/inout/history/${id}`, recordData);
  return handleResponse(response);
}


// --- Inventory ---
export async function fetchInventoryData(): Promise<InventoryItem[]> {
  const response = await apiClient.get('/inventory');
  return handleResponse(response);
}

// --- Schedules ---
export async function fetchSchedules(): Promise<Schedule[]> {
  const response = await apiClient.get('/schedules');
  return handleResponse(response);
}

// --- Users ---
export async function fetchUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return handleResponse(response);
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const response = await apiClient.post('/users', userData);
  return handleResponse(response);
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  const response = await apiClient.put(`/users/${id}`, userData);
  return handleResponse(response);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
