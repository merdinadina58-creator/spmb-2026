import { useEffect, useState } from "react";

/**
 * A hook that debounces a value by the specified delay.
 *
 * @param value - The value to debounce (generic, supports string, number, etc.)
 * @param delay - The debounce delay in milliseconds (default: 300)
 * @returns The debounced value, which only updates after the delay has elapsed
 *
 * @example
 * const debouncedSearch = useDebounce(search, 300)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
