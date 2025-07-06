import { useCallback, useEffect, useState, useSyncExternalStore, useMemo } from 'react';
import { toast } from 'sonner';

import { IPCResponse } from "@/shared/ipc-types";

// Helper function to fetch initial data, similar to ipcQueryFn
async function ipcSubscriptionInitialFetchFn<TResponse, TRequest>(
  channel: string,
  params?: TRequest
): Promise<TResponse> {
  if (!window.electronIPC) {
    throw new Error("Electron IPC bridge not available.");
  }

  const result = await window.electronIPC.invoke<IPCResponse<TResponse>>(
    channel,
    params
  );

  if (result.success) {
    return result.data;
  } 
    throw new Error(result.error.message);
  
}

interface IpcSubscriptionOptions<InitialData, EventPayload> {
  getSnapshot: (prevData: InitialData | null, eventPayload: EventPayload) => InitialData | null;
  onError?: (error: Error) => void;
  initialData?: InitialData | null;
  enabled?: boolean;
}

function useInitialIpcData<Args, InitialData>(
  fetchChannel: string,
  fetchArgs: Args,
  optionsOnError?: (error: Error) => void,
  providedInitialData: InitialData | null = null,
  enabled: boolean = true
) {
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<InitialData | null>(providedInitialData);

  const memoizedFetchArgs = useMemo(() => fetchArgs, [fetchArgs]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    ipcSubscriptionInitialFetchFn<InitialData, Args>(fetchChannel, memoizedFetchArgs)
      .then((response) => {
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
  options: IpcSubscriptionOptions<InitialData, EventPayload>
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

    const handler = (eventPayload: EventPayload) => {
      console.log(`useIpcSubscription: Event received on ${eventChannel}:`, eventPayload);
      setData(prevData => getSnapshot(prevData, eventPayload));
      onStoreChange();
    };

    console.log(`useIpcSubscription: Subscribing to ${eventChannel}`);
    const unsubscribeFn = window.electronIPC.on(eventChannel, (_event, ...args) => handler(args[0] as EventPayload));

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
