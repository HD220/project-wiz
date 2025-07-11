import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { IpcChannels } from "@shared/ipc-types/ipc-channels";
import type { IpcResponse } from "@shared/ipc-types/ipc-contracts";

interface IUseIpcQueryOptions<TResult, TPayload>
  extends UseQueryOptions<TResult, Error> {
  channel: IpcChannels;
  payload?: TPayload;
}

export function useIpcQuery<TResult, TPayload = undefined>(
  options: IUseIpcQueryOptions<TResult, TPayload>,
) {
  const { channel, payload, ...queryOptions } = options;

  return useQuery<TResult, Error>({
    queryKey: [channel, payload],
    queryFn: async () => {
      const response: IpcResponse<TResult> = await window.electronIPC.invoke(
        channel,
        payload,
      );
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || "Unknown IPC error");
    },
    ...queryOptions,
  });
}
