import { useCallback, useState } from 'react';

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (apiFunc: (...args: any[]) => Promise<T>, ...args: any[]) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await apiFunc(...args);
      setData(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    request,
    setData,
  };
}
