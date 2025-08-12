// 주문 상태 관리 시스템

export type OrderStatus = 'pending' | 'scheduled' | 'in_progress' | 'rejected' | 'completed' | 'cancelled';

export interface StatusConfig {
  label: string;
  color: 'yellow' | 'blue' | 'cyan' | 'red' | 'green' | 'gray';
  description: string;
  variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info';
  bgColor: string;
  textColor: string;
}

// 상태별 설정
export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: '승인대기',
    color: 'yellow',
    description: '관리자 승인 대기 중',
    variant: 'warning',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  scheduled: {
    label: '예약',
    color: 'blue', 
    description: '승인되어 작업 예약됨',
    variant: 'default',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  in_progress: {
    label: '진행중',
    color: 'cyan',
    description: '작업이 진행중입니다.',
    variant: 'info',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800'
  },
  rejected: {
    label: '거절',
    color: 'red',
    description: '관리자가 거절함',
    variant: 'destructive',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  completed: {
    label: '완료',
    color: 'green',
    description: '작업이 완료됨',
    variant: 'success',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  cancelled: {
    label: '취소',
    color: 'gray',
    description: '취소된 작업',
    variant: 'secondary',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  }
};

// 상태 전환 가능한 경우들
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['scheduled', 'rejected'],
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  rejected: [],
  completed: [],
  cancelled: []
};

// 상태 전환 가능 여부 확인
export const canTransitionTo = (currentStatus: OrderStatus, targetStatus: OrderStatus): boolean => {
  return STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
};

// 상태별 아이콘
export const getStatusIcon = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return '⏳'; // 승인대기
    case 'scheduled':
      return '📅'; // 예약
    case 'in_progress':
      return '🚚';
    case 'rejected':
      return '❌'; // 거절
    case 'completed':
      return '✅'; // 완료
    case 'cancelled':
      return '🚫'; // 취소
    default:
      return '❓';
  }
};

// 상태별 우선순위 (정렬용)
export const getStatusPriority = (status: OrderStatus): number => {
  switch (status) {
    case 'pending':
      return 1;
    case 'in_progress':
      return 2;
    case 'scheduled':
      return 3;
    case 'completed':
      return 4;
    case 'cancelled':
      return 5;
    case 'rejected':
      return 6;
    default:
      return 999;
  }
};

// 액션 가능한 상태인지 확인
export const isActionableStatus = (status: OrderStatus): boolean => {
  return ['pending', 'scheduled', 'in_progress'].includes(status);
};

// 최종 상태인지 확인
export const isFinalStatus = (status: OrderStatus): boolean => {
  return ['rejected', 'completed', 'cancelled'].includes(status);
};

// 상태 변경 로그 메시지 생성
export const getStatusChangeMessage = (
  fromStatus: OrderStatus, 
  toStatus: OrderStatus,
  userName: string = '관리자'
): string => {
  const fromLabel = ORDER_STATUS_CONFIG[fromStatus]?.label;
  const toLabel = ORDER_STATUS_CONFIG[toStatus]?.label;
  
  if (!fromLabel || !toLabel) return '상태 변경됨';

  switch (`${fromStatus}-${toStatus}`) {
    case 'pending-scheduled':
      return `${userName}님이 승인대기중인 작업을 승인하여 예약 상태로 변경했습니다.`;
    case 'pending-rejected':
      return `${userName}님이 승인대기중인 작업을 거절했습니다.`;
    case 'scheduled-in_progress':
      return `${userName}님이 예약된 작업을 시작하여 진행중 상태로 변경했습니다.`;
    case 'in_progress-completed':
      return `${userName}님이 진행중인 작업을 완료 처리했습니다.`;
    case 'scheduled-cancelled':
      return `${userName}님이 예약된 작업을 취소했습니다.`;
    case 'in_progress-cancelled':
      return `${userName}님이 진행중인 작업을 취소했습니다.`;
    default:
      return `${userName}님이 상태를 ${fromLabel}에서 ${toLabel}로 변경했습니다.`;
  }
};