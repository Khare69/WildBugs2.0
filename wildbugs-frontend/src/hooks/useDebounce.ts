import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapidly changing values (such as search keystrokes).
 * Includes instant dispatch on empty / reset triggers to eliminate filter latency (SEC-04).
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Instant dispatch (0ms) when value is cleared or reset to prevent filter latency without synchronous effect setState
    const delay =
      value === '' || value === null || (Array.isArray(value) && value.length === 0)
        ? 0
        : delayMs;

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export default useDebounce;
