import { useState, useEffect, useCallback } from 'react';

type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
  skip?: boolean;
}

/**
 * Хук для работы с API запросами
 * @param apiFunc - Асинхронная функция для вызова API
 * @param deps - Массив зависимостей для повторного вызова API
 * @param options - Дополнительные опции
 */
function useApi<T, P extends any[] = []>(
  apiFunc: (...args: P) => Promise<T>,
  deps: React.DependencyList = [],
  options: UseApiOptions<T> = {}
) {
  const { onSuccess, onError, initialData, skip = false } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<ApiStatus>('idle');

  const execute = useCallback(
    async (...args: P) => {
      setStatus('loading');
      setError(null);
      
      try {
        const result = await apiFunc(...args);
        setData(result);
        setStatus('success');
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setStatus('error');
        onError?.(error);
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiFunc]
  );

  useEffect(() => {
    if (skip) return;
    
    execute(...([] as unknown as P));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip]);

  return {
    data,
    error,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle',
    execute,
  };
}

export default useApi; 