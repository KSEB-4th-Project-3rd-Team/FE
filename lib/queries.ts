// lib/queries.ts - React Query 훅들
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './react-query';
import {
  fetchCompanies,
  fetchItems,
  fetchRawInOutData,
  fetchRawInventoryData,
  fetchSchedules,
  fetchUsers,
  fetchDashboardSummary,
  fetchDashboardAll, // 통합 대시보드 API
  createCompany,
  createItem,
  createInboundOrder,
  createOutboundOrder,
  updateCompany,
  updateItem,
  deleteCompany,
  deleteItem,
  approveInboundOrder,
  declineInboundOrder,
  DashboardData, // 통합 API 타입
} from './api';
import { useMemo } from 'react';
import type { Company } from '@/components/company/company-list';
import type { Item } from '@/components/item/item-list';
import type { InOutRecord, InventoryItem } from '@/components/utils';

// ===== 🚀 통합 대시보드 Query 훅 (5 API → 1 API) =====
// 75% 성능 향상을 위한 통합 API 사용

export function useDashboardAll() {
  return useQuery({
    queryKey: ['dashboard-all'], // 전용 키
    queryFn: fetchDashboardAll,
    staleTime: 0, // 데이터를 항상 '오래된' 상태로 간주하여 포커스 시 새로고침
    refetchOnWindowFocus: true, // 창에 포커스가 돌아왔을 때 자동 새로고침 (기본값)
    gcTime: 5 * 60 * 1000, // 5분 가비지 컬렉션
    retry: 2, // 실패시 2회 재시도
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// 통합 API에서 개별 데이터 추출하는 편의 훅들
export function useDashboardItems() {
  const { data, ...rest } = useDashboardAll();
  return {
    data: data?.items || [],
    ...rest
  };
}

export function useDashboardInventory() {
  const { data, ...rest } = useDashboardAll();
  return {
    data: data?.inventory || [],
    ...rest
  };
}

export function useDashboardInOutData() {
  const { data, ...rest } = useDashboardAll();
  return {
    data: data?.orders || [],
    ...rest
  };
}

export function useDashboardUsers() {
  const { data, ...rest } = useDashboardAll();
  return {
    data: data?.users || [],
    ...rest
  };
}

export function useDashboardSchedules() {
  const { data, ...rest } = useDashboardAll();
  return {
    data: data?.schedules || [],
    ...rest
  };
}

// ===== 기본 데이터 Query 훅들 =====

export function useCompanies() {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: fetchCompanies,
    staleTime: 10 * 60 * 1000, // 10분 캐시 (거의 안 바뀜)
  });
}

export function useItems() {
  return useQuery({
    queryKey: queryKeys.items,
    queryFn: fetchItems,
    staleTime: 5 * 60 * 1000, // 5분 캐시 (가끔 바뀜)
  });
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: fetchUsers,
    staleTime: 10 * 60 * 1000, // 10분 캐시
  });
}

// ===== 입출고 관련 Query 훅들 =====

export function useRawInOutData() {
  return useQuery({
    queryKey: queryKeys.inOutData,
    queryFn: fetchRawInOutData,
    staleTime: 30 * 1000, // 30초 캐시 (자주 바뀜)
  });
}


// ===== 재고 관련 Query 훅들 =====

export function useRawInventoryData() {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: fetchRawInventoryData,
    staleTime: 30 * 1000, // 30초 캐시 (자주 바뀜)
  });
}

// ===== 조합된 데이터 훅들 =====

// 완전한 재고 데이터 (품목 정보 포함)
export function useInventoryData() {
  const { data: rawInventory, ...inventoryQuery } = useRawInventoryData();
  const { data: items } = useItems();
  const { data: inOutData } = useInOutData();

  const enrichedInventory = useMemo((): InventoryItem[] => {
    if (!rawInventory || !items) return [];

    return rawInventory.map((backendItem, index) => {
      const item = items.find(i => i.itemId === backendItem.itemId);
      
      // Calculate scheduled quantities from pending/in-progress inout data
      const inboundScheduled = inOutData
        ?.filter(record => 
          record.type === 'inbound' && 
          record.sku === item?.itemCode &&
          (record.status === '예약' || record.status === '진행 중')
        )
        .reduce((sum, record) => sum + record.quantity, 0) || 0;
      
      const outboundScheduled = inOutData
        ?.filter(record => 
          record.type === 'outbound' && 
          record.sku === item?.itemCode &&
          (record.status === '예약' || record.status === '진행 중')
        )
        .reduce((sum, record) => sum + record.quantity, 0) || 0;

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
        sku: item?.itemCode || `SKU-${backendItem.itemId}`,
        specification: item?.spec || 'N/A',
        quantity: backendItem.quantity,
        inboundScheduled,
        outboundScheduled,
        location: backendItem.locationCode,
        status,
        lastUpdate: new Date(backendItem.lastUpdated).toLocaleString('ko-KR')
      };
    });
  }, [rawInventory, items, inOutData]);

  return {
    data: enrichedInventory,
    ...inventoryQuery
  };
}

// 완전한 입출고 데이터 (품목, 거래처 정보 포함)
export function useInOutData() {
  const { data: rawInOut, ...inOutQuery } = useRawInOutData();
  const { data: items } = useItems();
  const { data: companies } = useCompanies();

  const enrichedInOut = useMemo((): InOutRecord[] => {
    if (!rawInOut) return [];

    // 모든 상태의 데이터 포함 (CANCELLED 제외)
    const allData = rawInOut.filter(record => record.status !== 'CANCELLED');
    
    return allData.flatMap(record => {
      return record.items.map((item, itemIndex) => {
        const dateTime = record.createdAt || record.updatedAt || new Date().toISOString();
        const date = dateTime.split('T')[0];
        const time = dateTime.split('T')[1]?.substring(0, 8) || '00:00:00';
        
        // 실제 품목 정보와 매핑
        const actualItem = items?.find(i => i.itemId === item.itemId);
        // 실제 거래처 정보와 매핑  
        const actualCompany = companies?.find(c => c.companyId === record.companyId);
        
        return {
          id: `${record.orderId}-${itemIndex}`,
          type: record.type?.toLowerCase() || 'inbound',
          productName: actualItem?.itemName || item.itemName || 'N/A',
          sku: actualItem?.itemCode || item.itemCode || 'N/A',
          individualCode: `ORDER-${record.orderId}-${item.itemId}`,
          specification: actualItem?.spec || item.specification || 'N/A',
          quantity: item.requestedQuantity || 0,
          location: 'A-01',
          company: actualCompany?.companyName || record.companyName || 'N/A',
          companyCode: actualCompany?.companyCode || record.companyCode || 'N/A',
          status: record.status === 'COMPLETED' ? '완료' : 
                  record.status === 'PENDING' ? '예약' : '진행 중',
          date,
          time,
          notes: record.notes || '-'
        };
      });
    });
  }, [rawInOut, items, companies]);

  return {
    data: enrichedInOut,
    ...inOutQuery
  };
}

// ===== 스케줄 관련 =====

export function useSchedules(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.schedules(params),
    queryFn: () => fetchSchedules(params?.startDate, params?.endDate),
    staleTime: 2 * 60 * 1000, // 2분 캐시
  });
}

// ===== 대시보드 관련 =====

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboardSummary,
    staleTime: 60 * 1000, // 1분 캐시
  });
}

// ===== Mutation 훅들 =====

export function useCreateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
      queryClient.invalidateQueries({ queryKey: ['dashboard-all'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: ['dashboard-all'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCreateInboundOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createInboundOrder,
    onSuccess: () => {
      // 성공 시 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['dashboard-all'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.inOutData });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCreateOutboundOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOutboundOrder,
    onSuccess: () => {
      // 성공 시 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['dashboard-all'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.inOutData });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useApproveInboundOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: approveInboundOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-all'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.inOutData });
    },
  });
}

export function useDeclineInboundOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: declineInboundOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-all'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.inOutData });
    },
  });
}
