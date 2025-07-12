import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { IpcChannels } from "@shared/ipc-types/ipc-channels";
import type { IpcResponse } from "@shared/ipc-types/ipc-contracts";

interface IUseIpcQueryOptions<TResult, TPayload>
  extends Omit<UseQueryOptions<TResult, Error>, 'queryKey' | 'queryFn'> {
  channel: IpcChannels;
  payload?: TPayload;
  enabled?: boolean;
}

export function useIpcQuery<TResult, TPayload = undefined>(
  options: IUseIpcQueryOptions<TResult, TPayload>,
) {
  const { channel, payload, enabled = true, ...queryOptions } = options;

  return useQuery<TResult, Error>({
    queryKey: [channel, payload],
    queryFn: async () => {
      try {
        const response: IpcResponse<TResult> = await window.electronIPC.invoke(
          channel,
          payload,
        );
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error?.message || "Unknown IPC error");
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to communicate with main process");
      }
    },
    enabled,
    retry: (failureCount, error) => {
      // Don't retry validation errors or permission errors
      if (error.message.includes('validation') || error.message.includes('permission')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
}
