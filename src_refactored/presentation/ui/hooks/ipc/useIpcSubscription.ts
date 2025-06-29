import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {toast} from 'sonner'; // Assuming sonner is used project-wide for toasts

interface IpcSubscriptionOptions<InitialData, EventPayload> {
  getSnapshot: (prevData: InitialData | null, eventPayload: EventPayload) => InitialData | null;
  onError?: (error: Error) => void;
  initialData?: InitialData | null; // Optional initial data before first fetch
}

export function useIpcSubscription<Args, InitialData, EventPayload>(
  initialFetchChannel: string,
  initialFetchArgs: Args,
  eventChannel: string,
  options: IpcSubscriptionOptions<InitialData, EventPayload>
) {
  const { getSnapshot, onError: optionsOnError, initialData: providedInitialData = null } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Store for useSyncExternalStore
  // Holds the actual data being subscribed to
  const [store, setStore] = useState<{ data: InitialData | null }>({ data: providedInitialData });

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    if (!window.electronIPC) {
      const errMsg = 'Electron IPC bridge not found on window object. Ensure preload script is configured correctly.';
      console.error(errMsg);
      setError(new Error(errMsg));
      setIsLoading(false);
      if(optionsOnError) optionsOnError(new Error(errMsg)); else toast.error(errMsg);
      return;
    }

    console.log(`useIpcSubscription: Invoking ${initialFetchChannel} with args:`, initialFetchArgs);
    window.electronIPC.invoke(initialFetchChannel, initialFetchArgs)
      .then(response => {
        if (!isMounted) return;
        console.log(`useIpcSubscription: Response from ${initialFetchChannel}:`, response);
        if (response.success) {
          setStore({ data: response.data as InitialData });
        } else {
          const err = new Error(response.error?.message || `Failed to fetch initial data from ${initialFetchChannel}`);
          console.error(`Error fetching initial data from ${initialFetchChannel}:`, response.error);
          setError(err);
          if(optionsOnError) optionsOnError(err); else toast.error(err.message);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error(`Catch: Error fetching initial data from ${initialFetchChannel}:`, err);
        setError(err);
        if(optionsOnError) optionsOnError(err); else toast.error(err.message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialFetchChannel, JSON.stringify(initialFetchArgs), optionsOnError]); // Stringify args for dependency array

  // Subscription logic for useSyncExternalStore
  const subscribe = useCallback((onStoreChange: () => void) => {
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

  return { data, isLoading, error };
}
