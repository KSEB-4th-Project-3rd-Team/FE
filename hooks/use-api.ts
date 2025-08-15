// hooks/use-api.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = '작업이 완료되었습니다.'
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw error;
    }
  }, [showSuccessToast, showErrorToast, successMessage]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

function getErrorMessage(error: any): string {
  const status = error?.response?.status;
  
  if (status === 401) {
    return '인증이 필요합니다. 다시 로그인해주세요.';
  } else if (status === 403) {
    return '권한이 없습니다.';
  } else if (status === 404) {
    return '요청한 리소스를 찾을 수 없습니다.';
  } else if (status === 422) {
    return '입력값이 올바르지 않습니다.';
  } else if (status >= 500) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return '네트워크 연결을 확인해주세요.';
  }
  
  return error?.response?.data?.message || error?.message || '알 수 없는 오류가 발생했습니다.';
}