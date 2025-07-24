import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import type { IpcResponse } from "../../main/types";

export interface ApiMutationOptions<_TArgs, TReturn> {
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
 *   (data: CreateAgentInput) => window.api.agents.create(data),
 *   {
 *     successMessage: "Agent created successfully",
 *     errorMessage: "Failed to create agent",
 *     onSuccess: () => router.navigate({ to: "/agents" }),
 *   }
 * );
 *
 * // Usage
 * createAgent.mutate(formData);
 * ```
 */
export function useApiMutation<TArgs, TReturn>(
  mutationFn: (args: TArgs) => Promise<IpcResponse<TReturn>>,
  options: ApiMutationOptions<TArgs, TReturn> = {},
): UseMutationResult<IpcResponse<TReturn>, Error, TArgs> {
  const router = useRouter();

  return useMutation({
    mutationFn,
    onSuccess: (response) => {
      if (response.success) {
        // Success handling
        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        if (options.invalidateRouter !== false) {
          router.invalidate();
        }

        if (options.onSuccess && response.data !== undefined) {
          options.onSuccess(response.data);
        }
      } else {
        // API returned error
        const errorMsg =
          response.error || options.errorMessage || "Operation failed";
        toast.error(errorMsg);

        if (options.onError) {
          options.onError(errorMsg);
        }
      }
    },
    onError: (_error) => {
      // Network/system errors (IPC communication failure)
      const errorMsg = options.errorMessage || "An unexpected error occurred";
      toast.error(errorMsg);

      if (options.onError) {
        options.onError(errorMsg);
      }
    },
  });
}

/**
 * Specialized hook for simple CRUD operations with predefined messages
 *
 * @param operation - Type of CRUD operation
 * @param mutationFn - Function that performs the operation
 * @param entityName - Human-readable entity name for messages
 * @returns Configured mutation with standard CRUD messages
 *
 * @example
 * ```typescript
 * const deleteAgent = useCrudMutation(
 *   "delete",
 *   (id: string) => window.api.agents.delete(id),
 *   "Agent"
 * );
 *
 * // Results in:
 * // Success: "Agent deleted successfully"
 * // Error: "Failed to delete agent"
 * ```
 */
export function useCrudMutation<TEntity, TArgs = unknown>(
  operation: "create" | "update" | "delete",
  mutationFn: (args: TArgs) => Promise<IpcResponse<TEntity | void>>,
  entityName: string,
) {
  const messages = {
    create: {
      success: `${entityName} created successfully`,
      error: `Failed to create ${entityName.toLowerCase()}`,
    },
    update: {
      success: `${entityName} updated successfully`,
      error: `Failed to update ${entityName.toLowerCase()}`,
    },
    delete: {
      success: `${entityName} deleted successfully`,
      error: `Failed to delete ${entityName.toLowerCase()}`,
    },
  };

  return useApiMutation(mutationFn, {
    successMessage: messages[operation].success,
    errorMessage: messages[operation].error,
    invalidateRouter: true,
  });
}

/**
 * Hook for mutations that require custom TanStack Query options
 * Use this when you need to override default query client behavior
 *
 * @param mutationFn - Function that returns a Promise<IpcResponse<T>>
 * @param apiOptions - API mutation options (toast, callbacks)
 * @param queryOptions - Additional TanStack Query mutation options
 * @returns Enhanced mutation with both API and query customization
 *
 * @example
 * ```typescript
 * const updateAgent = useAdvancedApiMutation(
 *   (data: UpdateAgentInput) => window.api.agents.update(data.id, data),
 *   {
 *     successMessage: "Agent updated successfully",
 *     onSuccess: (agent) => updateLocalCache(agent),
 *   },
 *   {
 *     retry: 3,
 *     retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
 *   }
 * );
 * ```
 */
export function useAdvancedApiMutation<TArgs, TReturn>(
  mutationFn: (args: TArgs) => Promise<IpcResponse<TReturn>>,
  apiOptions: ApiMutationOptions<TArgs, TReturn> = {},
  queryOptions: Partial<
    UseMutationOptions<IpcResponse<TReturn>, Error, TArgs>
  > = {},
): UseMutationResult<IpcResponse<TReturn>, Error, TArgs> {
  const router = useRouter();

  return useMutation({
    mutationFn,
    onSuccess: (response, ...args) => {
      // Run our API success handling first
      if (response.success) {
        if (apiOptions.successMessage) {
          toast.success(apiOptions.successMessage);
        }

        if (apiOptions.invalidateRouter !== false) {
          router.invalidate();
        }

        if (apiOptions.onSuccess && response.data !== undefined) {
          apiOptions.onSuccess(response.data);
        }
      } else {
        const errorMsg =
          response.error || apiOptions.errorMessage || "Operation failed";
        toast.error(errorMsg);

        if (apiOptions.onError) {
          apiOptions.onError(errorMsg);
        }
      }

      // Then run custom query success handler if provided
      if (queryOptions.onSuccess) {
        queryOptions.onSuccess(response, ...args);
      }
    },
    onError: (error, ...args) => {
      // Run our API error handling first
      const errorMsg =
        apiOptions.errorMessage || "An unexpected error occurred";
      toast.error(errorMsg);

      if (apiOptions.onError) {
        apiOptions.onError(errorMsg);
      }

      // Then run custom query error handler if provided
      if (queryOptions.onError) {
        queryOptions.onError(error, ...args);
      }
    },
    // Merge with custom query options
    ...queryOptions,
  });
}
