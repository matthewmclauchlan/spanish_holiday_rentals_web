// /hooks/useDebounce.ts
import { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';

/**
 * useDebounce Hook
 * Delays updating the debounced value until after the specified delay has elapsed
 * since the last time it was invoked.
 *
 * @param value The value to debounce
 * @param delay The debounce delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    console.log("useDebounce: value changed", value);
    // Create a debounced function
    const handler = debounce(() => {
      console.log("useDebounce: updating debounced value", value);
      setDebouncedValue(value);
    }, delay);

    // Invoke the debounced function
    handler();

    // Cleanup: cancel the debounce if value changes or component unmounts.
    return () => {
      console.log("useDebounce: cancelling debounce for value", value);
      handler.cancel();
    };
  }, [value, delay]);

  return debouncedValue;
}
