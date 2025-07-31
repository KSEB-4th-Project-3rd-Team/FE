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
  const [loading, setLoading] = useState(false); // Set initial loading to false
  const [error, setError] = useState<string | null>(null);

  // loadAllData is no longer needed for initial load, pages handle their own data.
  const loadAllData = useCallback(async () => {
    // This function is now empty as pages fetch their own data.
    // We keep it to avoid breaking dependencies, but it does nothing.
    setLoading(false);
    return Promise.resolve();
  }, []);

  useEffect(() => {
    // No initial data load needed from context
    setLoading(false);
  }, []);

  const reloadData = useCallback(() => {
    // Use router.refresh() to re-run Server Component data fetching
    router.refresh();
  }, [router]);

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
