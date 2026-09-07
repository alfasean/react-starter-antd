import { QueryClient } from '@tanstack/react-query';

/**
 * Refetching on focus and reconnect fires constantly on data-entry screens and
 * surprises users mid-form, so both are off. Raise `staleTime` per query where
 * a screen genuinely needs fresher data.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});
