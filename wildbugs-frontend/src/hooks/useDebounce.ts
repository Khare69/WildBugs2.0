import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapidly changing values (such as search keystrokes).
 * Includes instant dispatch on empty / reset triggers to eliminate filter latency (SEC-04).
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Instant update when value is cleared or reset to prevent filter latency
    if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
      setDebouncedValue(value);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export default useDebounce;
