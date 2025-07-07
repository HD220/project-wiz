import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";

import type { IPCResponse } from "@/shared/ipc-types";

async function ipcQueryFn<TResponse, TRequest>(
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

// This creates a cleaner options type for the hook, omitting the parts we manage internally.
type IpcQueryOptions<TResponse, TError, TData, TQueryKey extends QueryKey> = Omit<
  UseQueryOptions<TResponse, TError, TData, TQueryKey>,
  "queryKey" | "queryFn"
> & {
  onError?: (error: TError) => void;
};

export function useIpcQuery<TResponse, TRequest extends object | undefined = undefined>(
  channel: string,
  params?: TRequest,
  options?: IpcQueryOptions<TResponse, Error, TResponse, [string, TRequest]>
) {
  const queryKey: [string, TRequest] = [channel, params as TRequest];

  return useQuery({
    queryKey,
    queryFn: () => ipcQueryFn<TResponse, TRequest>(channel, params),
    ...options,
  });
}

