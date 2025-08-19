"use client"

import { createContext, useContext, ReactNode } from 'react';
import {
  useCompanies,
  useItems,
  useUsers,
  useInventoryData,
  useInOutData,
  useSchedules,
  useDashboardSummary,
} from '@/lib/queries';

interface QueryDataContextType {
  // 기본 데이터
  companies: ReturnType<typeof useCompanies>;
  items: ReturnType<typeof useItems>;
  users: ReturnType<typeof useUsers>;
  
  // 조합된 데이터
  inventoryData: ReturnType<typeof useInventoryData>;
  inOutData: ReturnType<typeof useInOutData>;
  
  // 스케줄 및 대시보드
  schedules: ReturnType<typeof useSchedules>;
  dashboardSummary: ReturnType<typeof useDashboardSummary>;
  
  // 전체 로딩 상태
  isLoading: boolean;
  hasError: boolean;
}

const QueryDataContext = createContext<QueryDataContextType | undefined>(undefined);

export function QueryDataProvider({ children }: { children: ReactNode }) {
  // 모든 쿼리 훅들 호출
  const companies = useCompanies();
  const items = useItems();
  const users = useUsers();
  const inventoryData = useInventoryData();
  const inOutData = useInOutData();
  const schedules = useSchedules();
  const dashboardSummary = useDashboardSummary();

  // 전체 로딩 상태 계산
  const isLoading = [
    companies.isLoading,
    items.isLoading,
    inventoryData.isLoading,
    inOutData.isLoading,
  ].some(Boolean);

  // 전체 에러 상태 계산
  const hasError = [
    companies.isError,
    items.isError,
    inventoryData.isError,
    inOutData.isError,
  ].some(Boolean);

  const value: QueryDataContextType = {
    companies,
    items,
    users,
    inventoryData,
    inOutData,
    schedules,
    dashboardSummary,
    isLoading,
    hasError,
  };

  return (
    <QueryDataContext.Provider value={value}>
      {children}
    </QueryDataContext.Provider>
  );
}

// 커스텀 훅
export function useQueryData(): QueryDataContextType {
  const context = useContext(QueryDataContext);
  if (context === undefined) {
    throw new Error('useQueryData must be used within a QueryDataProvider');
  }
  return context;
}

// 개별 데이터 접근용 편의 훅들
export function useQueryCompanies() {
  const { companies } = useQueryData();
  return companies;
}

export function useQueryItems() {
  const { items } = useQueryData();
  return items;
}

export function useQueryInventory() {
  const { inventoryData } = useQueryData();
  return inventoryData;
}

export function useQueryInOut() {
  const { inOutData } = useQueryData();
  return inOutData;
}