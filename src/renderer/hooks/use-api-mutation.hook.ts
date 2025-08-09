import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import type { IPCResponse } from "@/shared/utils/create-ipc-handler";
import { getRendererLogger } from "@/shared/services/logger/renderer";

const logger = getRendererLogger("use-api-mutation");

export interface ApiMutationOptions<TReturn> {
  /** Success toast message */
  successMessage?: string;
  /** Error toast message (fallback if API doesn't provide one) */
  errorMessage?: string;
  /** Whether to invalidate router data on success (default: true) */
  invalidateRouter?: boolean;
  /** Custom success handler */
  onSuccess?: (data: TReturn) => void;
  /** Custom error handler */
  onError?: (error: string) => void;
}

/**
 * Generic hook for API mutations with automatic success/error handling
 *
 * Automatically handles:
 * - IpcResponse success/error checking
 * - Toast notifications for user feedback
 * - Router data invalidation
 * - Type-safe mutation args and return values
 *
 * @param mutationFn - Function that returns a Promise<IpcResponse<T>>
 * @param options - Configuration for success/error handling
 * @returns TanStack Query mutation with enhanced error handling
 *
 * @example
 * ```typescript
 * const createAgent = useApiMutation(
 *   (data: CreateAgentInput) => window.api.agent.create(data),
 *   {
 *     successMessage: "Agent created successfully",
 *     errorMessage: "Failed to create agent",
 *     onSuccess: (agent) => { // handle success },
 *   }
 * );
 *
 * // Usage
 * createAgent.mutate(formData);
 * ```
 */
export function useApiMutation<TArgs, TReturn>(
  mutationFn: (args: TArgs) => Promise<IPCResponse<TReturn>>,
  options: ApiMutationOptions<TReturn> = {},
): UseMutationResult<IPCResponse<TReturn>, Error, TArgs> {
  const router = useRouter();

  return useMutation({
    mutationFn,
    onSuccess: (response) => {
      if (response.success) {
        // Success handling
        logger.info("API mutation succeeded", { 
          hasSuccessMessage: !!options.successMessage,
          invalidateRouter: options.invalidateRouter !== false 
        });
        
        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        if (options.invalidateRouter !== false) {
          router.invalidate();
        }

        if (options.onSuccess) {
          options.onSuccess(response.data);
        }
      } else {
        // API returned error
        const errorMsg =
          response.error || options.errorMessage || "Operation failed";
        
        logger.error("API mutation failed", { 
          error: response.error,
          fallbackMessage: options.errorMessage 
        });
        
        toast.error(errorMsg);

        if (options.onError) {
          options.onError(errorMsg);
        }
      }
    },
    onError: (error) => {
      // Network/system errors (IPC communication failure)
      logger.error("API mutation network error", { 
        error: error.message,
        fallbackMessage: options.errorMessage 
      });
      
      const errorMsg = options.errorMessage || "An unexpected error occurred";
      toast.error(errorMsg);

      if (options.onError) {
        options.onError(errorMsg);
      }
    },
  });
}
