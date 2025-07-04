import { useCallback, useEffect, useState, useSyncExternalStore, useMemo } from 'react';
import { toast } from 'sonner';

interface IpcSubscriptionOptions<InitialData, EventPayload> {
  getSnapshot: (prevData: InitialData | null, eventPayload: EventPayload) => InitialData | null;
  onError?: (error: Error) => void;
  initialData?: InitialData | null;
  // To enable/disable the subscription
  enabled?: boolean;
}

// Helper hook for initial data fetching
function useInitialIpcData<Args, InitialData>(
  fetchChannel: string,
  fetchArgs: Args,
  optionsOnError?: (error: Error) => void,
  providedInitialData: InitialData | null = null,
  enabled: boolean = true
) {
  // Only load if enabled
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [dataStore, setDataStore] = useState<{ data: InitialData | null }>({ data: providedInitialData });

  // Memoize fetchArgs to prevent unnecessary re-renders if it's an object/array
  // const fetchArgsString = JSON.stringify(fetchArgs); // Original attempt
  const memoizedFetchArgs = useMemo(() => fetchArgs, [fetchArgs]);

  useEffect(() => {
    if (!enabled) {
      // If not enabled, set loading to false and don't fetch
      setIsLoading(false);
      // Reset data if it was previously fetched and now disabled? Optional.
      // setDataStore({ data: providedInitialData });
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    if (!window.electronIPC) {
      const errMsg = 'Electron IPC bridge not found.';
      setError(new Error(errMsg));
      setIsLoading(false);
      // else toast.error(errMsg);
      if (optionsOnError) optionsOnError(new Error(errMsg)); else toast.error(errMsg);
      return;
    }

    window.electronIPC.invoke(fetchChannel, memoizedFetchArgs)
      .then((response: IPCResponse<InitialData>) => {
        if (!isMounted) return;
        if (response.success) {
          setDataStore({ data: response.data });
        } else {
          const err = new Error(response.error?.message || `Failed to fetch initial data from ${fetchChannel}`);
          setError(err);
          if (optionsOnError) optionsOnError(err); else toast.error(err.message);
        }
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err);
        if (optionsOnError) optionsOnError(err); else toast.error(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [fetchChannel, memoizedFetchArgs, optionsOnError, enabled, providedInitialData]);

  return { isLoading, error, dataStore, setDataStore };
}


export function useIpcSubscription<Args, InitialData, EventPayload>(
  initialFetchChannel: string,
  initialFetchArgs: Args,
  eventChannel: string,
  options: IpcSubscriptionOptions<InitialData, EventPayload>
) {
  const { getSnapshot, onError: optionsOnError, initialData: providedInitialData = null, enabled = true } = options;

  const {
    isLoading: initialLoading,
    error: initialError,
    // store from initial fetch will be the base for subscription
    dataStore: store,
    // setStore will be used by the subscription handler
    setDataStore: setStore
  } = useInitialIpcData(initialFetchChannel, initialFetchArgs, optionsOnError, providedInitialData, enabled);

  // Subscription logic for useSyncExternalStore
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!enabled || !window.electronIPC) {
        // Warn if IPC is not available but was expected (enabled)
        if (!window.electronIPC && enabled) console.warn('IPC bridge not available for subscription.');
        return () => {};
    }
    // This check is somewhat redundant due to the one above, but kept for clarity.
    if (!window.electronIPC) {
        console.warn('IPC bridge not available for subscription in useIpcSubscription.');
        // No-op unsubscribe
        return () => {};
    }

    const handler = (eventPayload: EventPayload) => {
      console.log(`useIpcSubscription: Event received on ${eventChannel}:`, eventPayload);
      setStore(prevStore => ({ data: getSnapshot(prevStore.data, eventPayload) }));
      // Notify useSyncExternalStore of the change
      onStoreChange();
    };

    console.log(`useIpcSubscription: Subscribing to ${eventChannel}`);
    const unsubscribeFn = window.electronIPC.on(eventChannel, (_event, eventPayload: EventPayload) => handler(eventPayload));

    return () => {
      console.log(`useIpcSubscription: Unsubscribing from ${eventChannel}`);
      // It might be null if window.electronIPC.on is not fully implemented or returns void
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }, [eventChannel, getSnapshot, enabled, setStore]);

  // Getter for useSyncExternalStore
  const getStoreSnapshot = useCallback(() => store.data, [store]);

  // useSyncExternalStore to manage the data from the event channel
  const data = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);

  // The main hook's isLoading and error now correctly come from the initial data fetch.
  return { data, isLoading: initialLoading, error: initialError };
}
