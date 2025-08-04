// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 5분 캐시 (데이터 변경 빈도가 낮음)
      staleTime: 5 * 60 * 1000,
      // 30분 가비지 컬렉션 시간 (메모리 효율성)
      gcTime: 30 * 60 * 1000,
      // 스마트 에러 재시도
      retry: (failureCount, error: any) => {
        // 인증 에러시 재시도 안함
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // 서버 에러시 재시도 안함
        if (error?.response?.status >= 500) {
          return false;
        }
        // 네트워크 에러시만 최대 2번 재시도
        return failureCount < 2;
      },
      // 성능 최적화: 불필요한 refetch 방지
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: 'always',
      // 백그라운드 자동 업데이트 비활성화 (성능 최적화)
      refetchInterval: false,
      refetchIntervalInBackground: false,
    },
    mutations: {
      // mutation은 재시도하지 않음 (데이터 무결성)
      retry: false,
    },
  },
});

// Query Keys 관리
export const queryKeys = {
  // 기본 데이터
  companies: ['companies'] as const,
  items: ['items'] as const,
  users: ['users'] as const,
  
  // 입출고 관련
  inOutData: ['inOutData'] as const,
  inOutRequests: ['inOutRequests'] as const,
  
  // 재고 관련
  inventory: ['inventory'] as const,
  
  // 스케줄 관련
  schedules: (params?: { startDate?: string; endDate?: string }) => 
    ['schedules', params] as const,
  
  // 대시보드 관련
  dashboard: ['dashboard'] as const,
} as const;