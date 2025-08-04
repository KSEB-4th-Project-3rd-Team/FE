// lib/prefetch.ts - 성능 최적화를 위한 Prefetching 유틸리티
import { queryClient, queryKeys } from './react-query';
import { 
  fetchCompanies, 
  fetchItems, 
  fetchRawInventoryData, 
  fetchRawInOutData 
} from './api';

// 대시보드 진입 시 필요한 모든 데이터 미리 로딩
export async function prefetchDashboardData() {
  const promises = [
    // 기본 데이터들 병렬 로딩
    queryClient.prefetchQuery({
      queryKey: queryKeys.companies,
      queryFn: fetchCompanies,
      staleTime: 10 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.items,
      queryFn: fetchItems,
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.inventory,
      queryFn: fetchRawInventoryData,
      staleTime: 30 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.inOutData,
      queryFn: fetchRawInOutData,
      staleTime: 30 * 1000,
    }),
  ];

  try {
    await Promise.allSettled(promises);
    console.log('✅ Dashboard data prefetched successfully');
  } catch (error) {
    console.warn('⚠️ Some dashboard data failed to prefetch:', error);
  }
}

// 페이지별 전략적 prefetching
export const prefetchStrategies = {
  // 입고 등록 페이지 진입 시
  inboundRegistration: () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.items,
      queryFn: fetchItems,
      staleTime: 5 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: queryKeys.companies,
      queryFn: fetchCompanies,
      staleTime: 10 * 60 * 1000,
    });
  },

  // 출고 등록 페이지 진입 시
  outboundRegistration: () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.items,
      queryFn: fetchItems,
      staleTime: 5 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: queryKeys.companies,
      queryFn: fetchCompanies,  
      staleTime: 10 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: queryKeys.inventory,
      queryFn: fetchRawInventoryData,
      staleTime: 30 * 1000,
    });
  },

  // 재고 관리 페이지 진입 시
  inventory: () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.inventory,
      queryFn: fetchRawInventoryData,
      staleTime: 30 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: queryKeys.items,
      queryFn: fetchItems,
      staleTime: 5 * 60 * 1000,
    });
  },
};

// 중요 데이터 백그라운드 업데이트
export function startBackgroundSync() {
  // 재고 데이터는 30초마다 업데이트
  setInterval(() => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.inventory,
      exact: true 
    });
  }, 30 * 1000);

  // 입출고 데이터는 1분마다 업데이트
  setInterval(() => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.inOutData,
      exact: true 
    });
  }, 60 * 1000);
}

// 캐시 최적화: 오래된 데이터 정리
export function optimizeCache() {
  // 5분마다 실행
  setInterval(() => {
    // 사용하지 않는 쿼리 정리
    queryClient.getQueryCache().clear();
    
    // 메모리 사용량 체크
    const cacheSize = queryClient.getQueryCache().getAll().length;
    if (cacheSize > 50) {
      console.warn(`⚠️ Cache size is getting large: ${cacheSize} queries`);
      // 오래된 캐시 일부 제거
      queryClient.getQueryCache().clear();
    }
  }, 5 * 60 * 1000);
}