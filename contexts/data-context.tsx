"use client"

import { createContext, useContext, useState, useEffect, ReactNode, FC, useCallback } from 'react';
import { Company } from '@/components/company/company-list';
import { Item } from '@/components/item/item-list';
import { InOutRecord, InOutRequest, InventoryItem } from '@/components/utils';
import { Schedule } from '@/lib/api';
import { User } from '@/app/(main)/layout';
import { 
  fetchCompanies, fetchItems, fetchInOutData, fetchInOutRequests, 
  fetchInventoryData, fetchSchedules, fetchUsers, fetchDashboardSummary 
} from '@/lib/api';
// import { DashboardSummary } from '@/components/dashboard/unified-dashboard';
type DashboardSummary = any;

interface DataContextType {
  companies: Company[];
  items: Item[];
  inOutData: InOutRecord[];
  inOutRequests: InOutRequest[];
  inventoryData: InventoryItem[];
  schedules: Schedule[];
  users: User[];
  dashboardSummary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  reloadData: (dataType?: keyof DataStates) => void;
}

interface DataStates {
  companies: Company[];
  items: Item[];
  inOutData: InOutRecord[];
  inOutRequests: InOutRequest[];
  inventoryData: InventoryItem[];
  schedules: Schedule[];
  users: User[];
  dashboardSummary: DashboardSummary | null;
}

import { useRouter } from 'next/navigation';

// ... (imports and interface definitions remain the same)

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [data, setData] = useState<DataStates>({
    companies: [],
    items: [],
    inOutData: [],
    inOutRequests: [],
    inventoryData: [],
    schedules: [],
    users: [],
    dashboardSummary: null,
  });
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        companiesData,
        itemsData,
        inOutDataResult,
        inOutRequestsData,
        inventoryDataResult,
        schedulesData,
        usersData,
        dashboardSummaryData
      ] = await Promise.all([
        fetchCompanies().catch(() => []),
        fetchItems().catch(() => []),
        fetchInOutData().catch(() => []),
        fetchInOutRequests().catch(() => []),
        fetchInventoryData().catch(() => []),
        fetchSchedules().catch(() => []),
        fetchUsers().catch(() => []),
        fetchDashboardSummary().catch(() => null)
      ]);

      setData({
        companies: companiesData,
        items: itemsData,
        inOutData: inOutDataResult,
        inOutRequests: inOutRequestsData,
        inventoryData: inventoryDataResult,
        schedules: schedulesData,
        users: usersData,
        dashboardSummary: dashboardSummaryData,
      });
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const reloadData = useCallback(async (dataType?: keyof DataStates) => {
    // Force reload by calling loadAllData
    await loadAllData();
    
    // Also force router refresh to ensure SSR data is updated
    router.refresh();
  }, [loadAllData, router]);

  return (
    <DataContext.Provider value={{ ...data, loading, error, reloadData: reloadData as any }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
