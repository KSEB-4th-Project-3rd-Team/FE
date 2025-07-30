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
import { DashboardSummary } from '@/components/dashboard/unified-dashboard';

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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: FC<{ children: ReactNode }> = ({ children }) => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        companies, items, inOutData, inOutRequests, inventoryData,
        schedules, users, dashboardSummary
      ] = await Promise.all([
        fetchCompanies(),
        fetchItems(),
        fetchInOutData(),
        fetchInOutRequests(),
        fetchInventoryData(),
        (() => {
          const today = new Date();
          const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          const formatDateTime = (date: Date) => {
            return date.toISOString();
          };
          return fetchSchedules(startDate.toISOString(), new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString());
        })(),
        fetchUsers(),
        fetchDashboardSummary(),
      ]);
      setData({ companies, items, inOutData, inOutRequests, inventoryData, schedules, users, dashboardSummary });
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(`Failed to load initial data: ${err.message}. Is the backend server running?`);
      } else {
        setError("Failed to load initial data. An unknown error occurred. Is the backend server running?");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const reloadData = useCallback(async (dataType?: keyof DataStates) => {
    // For now, we'll just reload all data.
    // This can be optimized later to refetch only specific data types.
    await loadAllData();
  }, [loadAllData]);

  return (
    <DataContext.Provider value={{ ...data, loading, error, reloadData }}>
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
