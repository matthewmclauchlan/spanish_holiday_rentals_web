// /app/lib/useAppwrite.ts
import { useEffect, useState, useCallback } from "react";

interface UseAppwriteOptions<T, P extends Record<string, unknown>> {
  fn: (params: P) => Promise<T>;
  params?: P;
  skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (newParams: P) => Promise<void>;
}

export const useAppwrite = <T, P extends Record<string, unknown>>({
  fn,
  params = {} as P,
  skip = false,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (fetchParams: P) => {
      console.log("useAppwrite: fetching data with params:", fetchParams);
      setLoading(true);
      setError(null);
      try {
        const result = await fn(fetchParams);
        console.log("useAppwrite: received result:", result);
        setData(result);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("useAppwrite: Error:", errorMessage);
        alert(`Error: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  // Use JSON.stringify to create a stable dependency value
  const paramsString = JSON.stringify(params);

  useEffect(() => {
    console.log("useAppwrite effect running with paramsString:", paramsString);
    if (!skip) {
      // Here, we parse back to an object. If the parent doesn't memoize params,
      // using the stringified version helps prevent the effect from re-running.
      fetchData(JSON.parse(paramsString));
    }
  }, [skip, paramsString, fetchData]);

  const refetch = useCallback(async (newParams: P) => {
    console.log("useAppwrite: refetch called with params:", newParams);
    await fetchData(newParams);
  }, [fetchData]);

  return { data, loading, error, refetch };
};
