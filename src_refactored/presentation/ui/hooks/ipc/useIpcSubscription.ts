import { useCallback, useEffect, useState, useSyncExternalStore, useMemo } from 'react';
import { toast } from 'sonner';

import { IPCResponse } from "@/shared/ipc-types";

interface IpcSubscriptionOptions<InitialData, EventPayload> {
  getSnapshot: (prevData: IPCResponse<InitialData> | null, eventPayload: EventPayload) => IPCResponse<InitialData> | null;
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
  providedInitialData: IPCResponse<InitialData> | null = null,
  enabled: boolean = true
) {
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<IPCResponse<InitialData> | null>(providedInitialData);

  const memoizedFetchArgs = useMemo(() => fetchArgs, [fetchArgs]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
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

    window.electronIPC.invoke(fetchChannel, memoizedFetchArgs)
      .then((response: IPCResponse<InitialData>) => {
        if (!isMounted) return;
        setData(response);
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

  return { isLoading, error, data, setData };
}


export function useIpcSubscription<Args, InitialData, EventPayload>(
  initialFetchChannel: string,
  initialFetchArgs: Args,
  eventChannel: string,
  options: IpcSubscriptionOptions<IPCResponse<InitialData>, EventPayload>
) {
  const { getSnapshot, onError: optionsOnError, initialData: providedInitialData = null, enabled = true } = options;

  const {
    isLoading: initialLoading,
    error: initialError,
    data,
    setData
  } = useInitialIpcData<Args, InitialData>(
    initialFetchChannel,
    initialFetchArgs,
    optionsOnError,
    providedInitialData,
    enabled
  );

  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!enabled || !window.electronIPC) {
        if (!window.electronIPC && enabled) {
          console.warn('IPC bridge not available for subscription.');
        }
        return () => {};
    }
    if (!window.electronIPC) {
        console.warn('IPC bridge not available for subscription in useIpcSubscription.');
        return () => {};
    }

    const handler = (eventPayload: EventPayload) => {
      console.log(`useIpcSubscription: Event received on ${eventChannel}:`, eventPayload);
      setData(prevData => getSnapshot(prevData, eventPayload));
      onStoreChange();
    };

    console.log(`useIpcSubscription: Subscribing to ${eventChannel}`);
    const unsubscribeFn = window.electronIPC.on(eventChannel, (_event, eventPayload: EventPayload) => handler(eventPayload));

    return () => {
      console.log(`useIpcSubscription: Unsubscribing from ${eventChannel}`);
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }, [eventChannel, getSnapshot, enabled, setData]);

  const getStoreSnapshot = useCallback(() => data, [data]);

  const subscribedData = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);

  return { data: subscribedData, isLoading: initialLoading, error: initialError };
}
