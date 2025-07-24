import type { IpcResponse } from "../../main/types";

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
  apiCall: () => Promise<IpcResponse<T>>,
  errorMessage?: string,
): Promise<T> {
  const response = await apiCall();

  if (!response.success) {
    throw new Error(response.error || errorMessage || "Failed to load data");
  }

  if (response.data === undefined) {
    throw new Error("API returned success but no data");
  }

  return response.data;
}

/**
 * Load multiple API calls in parallel with proper error handling
 *
 * @param calls - Object mapping keys to API call functions
 * @returns Promise<T> - Object with same keys containing unwrapped data
 * @throws Error if any API call fails
 *
 * @example
 * ```typescript
 * export const Route = createFileRoute("/agents/new")({
 *   loader: async ({ context }) => {
 *     return await loadApiDataParallel({
 *       providers: () => window.api.llmProviders.list(),
 *       models: () => window.api.models.list(),
 *     });
 *     // Returns: { providers: Provider[], models: Model[] }
 *   },
 * });
 * ```
 */
export async function loadApiDataParallel<
  T extends Record<string, unknown>,
>(calls: { [K in keyof T]: () => Promise<IpcResponse<T[K]>> }): Promise<T> {
  const entries = Object.entries(calls) as [
    keyof T,
    () => Promise<IpcResponse<T[keyof T]>>,
  ][];

  const results = await Promise.all(
    entries.map(async ([key, apiCall]) => {
      const data = await loadApiData(apiCall, `Failed to load ${String(key)}`);
      return [key, data] as const;
    }),
  );

  return Object.fromEntries(results) as T;
}

/**
 * Load API data with optional fallback value (doesn't throw on failure)
 * Use this for non-critical data that shouldn't block route loading
 *
 * @param apiCall - Function that returns a Promise<IpcResponse<T>>
 * @param fallbackValue - Value to return if API call fails
 * @param errorMessage - Custom error message for logging
 * @returns Promise<T> - The data or fallback value
 *
 * @example
 * ```typescript
 * export const Route = createFileRoute("/dashboard")({
 *   loader: async () => {
 *     const [criticalData, optionalStats] = await Promise.all([
 *       loadApiData(() => window.api.users.getCurrent()), // Throws on failure
 *       loadApiDataWithFallback(
 *         () => window.api.stats.getUserStats(),
 *         { totalAgents: 0, totalConversations: 0 }, // Fallback
 *         "Failed to load user statistics"
 *       ),
 *     ]);
 *
 *     return { user: criticalData, stats: optionalStats };
 *   },
 * });
 * ```
 */
export async function loadApiDataWithFallback<T>(
  apiCall: () => Promise<IpcResponse<T>>,
  fallbackValue: T,
  errorMessage?: string,
): Promise<T> {
  try {
    return await loadApiData(apiCall, errorMessage);
  } catch (error) {
    // Log the error but don't throw - return fallback instead
    console.warn(
      `API call failed, using fallback: ${errorMessage || "Unknown error"}`,
      error,
    );
    return fallbackValue;
  }
}

/**
 * Load API data with conditional execution
 * Use this for data that should only be loaded under certain conditions
 *
 * @param condition - Whether to execute the API call
 * @param apiCall - Function that returns a Promise<IpcResponse<T>>
 * @param errorMessage - Custom error message for failures
 * @returns Promise<T | null> - The data if condition is true, null otherwise
 *
 * @example
 * ```typescript
 * export const Route = createFileRoute("/agents/$agentId/edit")({
 *   loader: async ({ params, context }) => {
 *     const agent = await loadApiData(
 *       () => window.api.agents.findById(params.agentId)
 *     );
 *
 *     // Only load provider details if agent has a provider
 *     const provider = await loadApiDataConditional(
 *       !!agent.providerId,
 *       () => window.api.llmProviders.getById(agent.providerId!),
 *       "Failed to load provider details"
 *     );
 *
 *     return { agent, provider };
 *   },
 * });
 * ```
 */
export async function loadApiDataConditional<T>(
  condition: boolean,
  apiCall: () => Promise<IpcResponse<T>>,
  errorMessage?: string,
): Promise<T | null> {
  if (!condition) {
    return null;
  }

  return await loadApiData(apiCall, errorMessage);
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
    IpcResponse<{
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
