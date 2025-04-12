import { useState, useCallback } from "react";

/**
 * useAsyncAction
 * Utility hook to handle async actions with loading and error state.
 *
 * @returns [execute, loading, error, setError]
 * - execute: (fn: (...args) => Promise<T>) => (...args) => Promise<T>
 * - loading: boolean
 * - error: string | null
 * - setError: (err: string | null) => void
 */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function execute<T extends (...args: any[]) => Promise<any>>(fn: T) {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setLoading(false);
        return result;
      } catch (e: any) {
        setError(e.message || "Unknown error");
        setLoading(false);
        throw e;
      }
    };
  }

  return [execute, loading, error, setError] as const;
}