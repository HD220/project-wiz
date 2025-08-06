import type { IPCResponse } from "@/shared/utils/create-ipc-handler";

/**
 * Unwraps IpcResponse in route loaders with proper error handling
 *
 * Automatically handles:
 * - IpcResponse success/error checking
 * - Proper error throwing for route error boundaries
 * - Type-safe data extraction
 *
 * @param apiCall - Function that returns a Promise<IpcResponse<T>>
 * @param errorMessage - Custom error message for failures
 * @returns Promise<T> - The unwrapped data
 * @throws Error if the API call fails
 *
 * @example
 * ```typescript
 * export const Route = createFileRoute("/agents/$agentId")({
 *   loader: async ({ params }) => {
 *     const agent = await loadApiData(
 *       () => window.api.agents.findById(params.agentId),
 *       "Agent not found"
 *     );
 *     return { agent };
 *   },
 * });
 * ```
 */
export async function loadApiData<T>(
  apiCall: () => Promise<IPCResponse<T>>,
  errorMessage?: string,
): Promise<T> {
  const response = await apiCall();

  if (!response.success) {
    throw new Error(response.error || errorMessage || "Failed to load data");
  }

  return response.data;
}



/**
 * Load paginated API data with automatic parameter handling
 * Use this for routes that handle list data with pagination
 *
 * @param apiCall - Function that accepts page/limit and returns paginated response
 * @param options - Pagination options
 * @returns Promise with paginated data and metadata
 *
 * @example
 * ```typescript
 * export const Route = createFileRoute("/agents")({
 *   validateSearch: (search) => ({
 *     page: Number(search.page) || 1,
 *     limit: Number(search.limit) || 20,
 *     status: search.status
 *   }),
 *   loader: async ({ search }) => {
 *     return await loadPaginatedApiData(
 *       (page, limit) => window.api.agents.list({
 *         page,
 *         limit,
 *         status: search.status
 *       }),
 *       { page: search.page, limit: search.limit }
 *     );
 *   },
 * });
 * ```
 */
export async function loadPaginatedApiData<T>(
  apiCall: (
    page: number,
    limit: number,
  ) => Promise<
    IPCResponse<{
      data: T[];
      total: number;
      page: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    }>
  >,
  options: { page: number; limit: number },
): Promise<{
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const response = await loadApiData(
    () => apiCall(options.page, options.limit),
    `Failed to load page ${options.page}`,
  );

  return {
    data: response.data,
    pagination: {
      total: response.total,
      page: response.page,
      limit: response.limit,
      hasNext: response.hasNext,
      hasPrev: response.hasPrev,
    },
  };
}
