import { useEffect, useState } from 'react';

/**
 * Delays a rapidly changing value — a search box, typically — so consumers
 * fire one request per pause instead of one per keystroke.
 *
 * Replaces the `lodash.debounce` dependency; nothing else needed it.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
