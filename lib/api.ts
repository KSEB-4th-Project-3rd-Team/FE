// lib/api.ts

import { Company } from '@/components/company/company-list';
import { Item } from '@/components/item/item-list';
import { InOutRecord, InOutRequest, InventoryItem } from '@/components/utils';
import { User } from '@/app/(main)/layout';
import { Schedule } from '@/app/(main)/schedule/page';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Something went wrong');
  }
  return response.json();
}

// --- Auth ---
export async function login(username: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<User>(response);
}

// --- Companies ---
export async function fetchCompanies(): Promise<Company[]> {
  const response = await fetch(`${API_BASE_URL}/companies`);
  return handleResponse<Company[]>(response);
}

// --- Items ---
export async function fetchItems(): Promise<Item[]> {
  const response = await fetch(`${API_BASE_URL}/items`);
  return handleResponse<Item[]>(response);
}

// --- InOut ---
export async function fetchInOutData(): Promise<InOutRecord[]> {
  const response = await fetch(`${API_BASE_URL}/inout/history`);
  return handleResponse<InOutRecord[]>(response);
}

export async function fetchInOutRequests(): Promise<InOutRequest[]> {
  const response = await fetch(`${API_BASE_URL}/inout/requests`);
  return handleResponse<InOutRequest[]>(response);
}

// --- Inventory ---
export async function fetchInventoryData(): Promise<InventoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/inventory`);
  return handleResponse<InventoryItem[]>(response);
}

// --- Schedules ---
export async function fetchSchedules(): Promise<Schedule[]> {
  const response = await fetch(`${API_BASE_URL}/schedules`);
  return handleResponse<Schedule[]>(response);
}

// --- Users ---
export async function fetchUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleResponse<User[]>(response);
}
