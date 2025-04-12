import { useEffect, useRef, useCallback } from 'react';

export interface UsePollingOptions {
  interval: number;
  immediate?: boolean;
  enabled?: boolean;
}

export function usePolling(
  callback: () => Promise<void> | void,
  { interval, immediate = true, enabled = true }: UsePollingOptions
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    if (immediate) callback();
    intervalRef.current = setInterval(callback, interval);
  }, [callback, interval, immediate]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      start();
    }
    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return { start, stop };
}