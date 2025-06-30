import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

interface IpcSubscriptionOptions<InitialData, EventPayload> {
  getSnapshot: (prevData: InitialData | null, eventPayload: EventPayload) => InitialData | null;
  onError?: (error: Error) => void;
  initialData?: InitialData | null;
  enabled?: boolean; // To enable/disable the subscription
}

// Helper hook for initial data fetching
function useInitialIpcData<Args, InitialData>(
  fetchChannel: string,
  fetchArgs: Args,
  optionsOnError?: (error: Error) => void,
  providedInitialData: InitialData | null = null,
  enabled: boolean = true
) {
  const [isLoading, setIsLoading] = useState(enabled); // Only load if enabled
  const [error, setError] = useState<Error | null>(null);
  const [dataStore, setDataStore] = useState<{ data: InitialData | null }>({ data: providedInitialData });

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false); // If not enabled, set loading to false and don't fetch
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
      if (optionsOnError) optionsOnError(new Error(errMsg)); else toast.error(errMsg);
      return;
    }

    window.electronIPC.invoke(fetchChannel, fetchArgs)
      .then(response => {
        if (!isMounted) return;
        if (response.success) {
          setDataStore({ data: response.data as InitialData });
        } else {
          const err = new Error(response.error?.message || `Failed to fetch initial data from ${fetchChannel}`);
          setError(err);
          if (optionsOnError) optionsOnError(err); else toast.error(err.message);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err);
        if (optionsOnError) optionsOnError(err); else toast.error(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [fetchChannel, JSON.stringify(fetchArgs), optionsOnError, enabled, providedInitialData]);

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
    dataStore: store, // store from initial fetch will be the base for subscription
    setDataStore: setStore // setStore will be used by the subscription handler
  } = useInitialIpcData(initialFetchChannel, initialFetchArgs, optionsOnError, providedInitialData, enabled);

  // Subscription logic for useSyncExternalStore
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!enabled || !window.electronIPC) {
        if (!window.electronIPC && enabled) console.warn('IPC bridge not available for subscription.');
        return () => {};
    }
    if (!window.electronIPC) {
        console.warn('IPC bridge not available for subscription in useIpcSubscription.');
        return () => {}; // No-op unsubscribe
    }

    const handler = (eventPayload: EventPayload) => {
      console.log(`useIpcSubscription: Event received on ${eventChannel}:`, eventPayload);
      setStore(prevStore => ({ data: getSnapshot(prevStore.data, eventPayload) }));
      onStoreChange(); // Notify useSyncExternalStore of the change
    };

    console.log(`useIpcSubscription: Subscribing to ${eventChannel}`);
    const unsubscribeFn = window.electronIPC.on(eventChannel, handler);

    return () => {
      console.log(`useIpcSubscription: Unsubscribing from ${eventChannel}`);
      if (unsubscribeFn) { // It might be null if window.electronIPC.on is not fully implemented or returns void
        unsubscribeFn();
      } else if (window.electronIPC.off) { // Fallback if `on` doesn't return unsubscribe but `off` exists
        window.electronIPC.off(eventChannel, handler);
      }
    };
  }, [eventChannel, getSnapshot]);

  // Getter for useSyncExternalStore
  const getStoreSnapshot = useCallback(() => store.data, [store]);

  // useSyncExternalStore to manage the data from the event channel
  const data = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);

  // The main hook's isLoading and error now correctly come from the initial data fetch.
  return { data, isLoading: initialLoading, error: initialError };
}
