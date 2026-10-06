import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for throttling values
 * @param value - The value to throttle
 * @param limit - Time limit in milliseconds (default: 500ms)
 * @returns Throttled value
 */
export function useThrottle<T>(value: T, limit: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Custom hook for throttling callback functions
 * @param callback - The function to throttle
 * @param limit - Time limit in milliseconds (default: 500ms)
 * @returns Throttled callback function
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number = 500
): (...args: Parameters<T>) => void {
  const inThrottle = useRef(false);

  return (...args: Parameters<T>) => {
    if (!inThrottle.current) {
      callback(...args);
      inThrottle.current = true;
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    }
  };
}
