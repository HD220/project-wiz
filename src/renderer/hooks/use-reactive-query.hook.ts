import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";

import { getRendererLogger } from "@/shared/services/logger/renderer";
import type {
  EventDomain,
  EventAction,
  EventPayload,
  EventPattern,
} from "@/shared/types/reactive-events.types";

const logger = getRendererLogger("use-reactive-query");

/**
 * Configuration options for useReactiveQuery hook
 */
interface UseReactiveQueryOptions<
  TDomain extends EventDomain,
  TAction extends EventAction<TDomain> = EventAction<TDomain>,
  TReturn = unknown,
  TError = Error,
> {
  /** The event domain to listen for reactive updates */
  domain: TDomain;

  /** Optional specific action to filter events (if not provided, listens to all actions in domain) */
  action?: TAction;

  /** Optional key to filter events to specific resource instances */
  key?: string;

  /** Query function that fetches the data */
  queryFn: () => Promise<TReturn>;

  /** Additional TanStack Query options (queryKey is auto-generated) */
  queryOptions?: Omit<UseQueryOptions<TReturn, TError>, "queryKey" | "queryFn">;
}

/**
 * Reactive Query Hook with Type-Safe Event Listening
 *
 * Combines TanStack Query with reactive event system to automatically
 * invalidate and refetch data when relevant events occur.
 *
 * Features:
 * - Type-safe domain and action selection with auto-complete
 * - Automatic queryKey generation based on domain and key
 * - Smart event filtering by action and key
 * - Seamless integration with existing TanStack Query ecosystem
 * - Zero configuration reactive updates
 *
 * @example
 * ```typescript
 * // Listen to all message events for a specific DM
 * const messages = useReactiveQuery({
 *   domain: "messages",     // ← Auto-complete suggests valid domains
 *   key: dmId,             // ← Filter events for this specific DM
 *   queryFn: () => window.api.dm.listMessages({ dmId })
 * });
 *
 * // Listen only to typing events
 * const typingUsers = useReactiveQuery({
 *   domain: "messages",
 *   action: "typing-start", // ← Auto-complete suggests valid actions for "messages"
 *   key: dmId,
 *   queryFn: () => getCurrentTypingUsers(dmId)
 * });
 *
 * // Listen to all conversation events (no key = global)
 * const conversations = useReactiveQuery({
 *   domain: "conversations",
 *   queryFn: () => window.api.dm.list()
 * });
 * ```
 */
export function useReactiveQuery<
  TDomain extends EventDomain,
  TAction extends EventAction<TDomain> = EventAction<TDomain>,
  TReturn = unknown,
  TError = Error,
>({
  domain,
  action,
  key,
  queryFn,
  queryOptions,
}: UseReactiveQueryOptions<TDomain, TAction, TReturn, TError>): UseQueryResult<
  TReturn,
  TError
> {
  // Auto-generate queryKey based on domain and key
  const queryKey = [domain, key].filter(Boolean) as string[];

  const queryClient = useQueryClient();

  // Set up the base query
  const query = useQuery<TReturn, TError>({
    queryKey,
    queryFn,
    ...queryOptions,
  });

  // Set up reactive event listening
  useEffect(() => {
    const eventPattern: EventPattern<TDomain> = `event:${domain}`;

    /**
     * Handle incoming reactive events
     *
     * Filters events based on action and key, then invalidates the query
     * to trigger a fresh data fetch.
     */
    const handleReactiveEvent = (eventData: EventPayload<TDomain, TAction>) => {
      // Type-safe event filtering
      const shouldInvalidate =
        // Action filter: if action is specified, only process matching events
        (!action || eventData.action === action) &&
        // Key filter: if key is specified, only process events for that resource
        (!key || eventData.key === key);

      if (shouldInvalidate) {
        logger.debug("🔄 Reactive event triggered query invalidation", {
          domain,
          eventAction: eventData.action,
          eventKey: eventData.key,
          filterAction: action,
          filterKey: key,
          queryKey,
        });

        // Invalidate the query to trigger a refetch
        queryClient.invalidateQueries({ queryKey });
      }
    };

    // Register event listener
    logger.debug("👂 Registering reactive query listener", {
      eventPattern,
      domain,
      action,
      key,
      queryKey,
    });

    window.events.on(eventPattern, handleReactiveEvent);

    // Cleanup listener on unmount or dependency change
    return () => {
      logger.debug("🧹 Cleaning up reactive query listener", {
        eventPattern,
        queryKey,
      });

      window.events.off(eventPattern, handleReactiveEvent);
    };
  }, [domain, action, key, queryKey, queryClient]);

  // Log query setup for debugging
  useEffect(() => {
    logger.info("🎯 Reactive query initialized", {
      domain,
      action: action || "all",
      key: key || "global",
      queryKey,
      isLoading: query.isLoading,
      hasData: !!query.data,
    });
  }, [domain, action, key, queryKey, query.isLoading, query.data]);

  return query;
}
