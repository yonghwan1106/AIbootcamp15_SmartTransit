import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';

interface UseApiCallOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  errorMessage?: string;
  successMessage?: string;
}

interface UseApiCallReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  reset: () => void;
}

export const useApiCall = <T>(
  apiFunction: () => Promise<{ data: T }>,
  dependencies: any[] = [],
  options: UseApiCallOptions<T> = {}
): UseApiCallReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const {
    immediate = false,
    onSuccess,
    onError,
    errorMessage,
    successMessage
  } = options;

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction();
      setData(response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(err.message || 'Unknown error');
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
      
      if (errorMessage) {
        toast.error('오류 발생', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, errorMessage, successMessage, toast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [...dependencies, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

// 특정 API 호출을 위한 편의 훅들
export const useStations = (params?: { line_id?: string; station_type?: 'subway' | 'bus' }) => {
  const { stationApi } = require('../services/api');
  
  return useApiCall(
    () => stationApi.getAll(params),
    [params],
    {
      immediate: true,
      errorMessage: '역 정보를 불러올 수 없습니다.'
    }
  );
};

export const useCongestion = (stationId: string) => {
  const { congestionApi } = require('../services/api');
  
  return useApiCall(
    () => congestionApi.getRealtime(stationId),
    [stationId],
    {
      errorMessage: '혼잡도 정보를 불러올 수 없습니다.'
    }
  );
};

export const usePrediction = (stationId: string, options?: { target_time?: string; duration_hours?: number }) => {
  const { predictionApi } = require('../services/api');
  
  return useApiCall(
    () => predictionApi.getPrediction(stationId, options),
    [stationId, options],
    {
      errorMessage: '예측 정보를 불러올 수 없습니다.'
    }
  );
};

export default useApiCall;