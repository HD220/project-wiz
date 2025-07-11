import { useMutation } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { IpcChannels } from "@shared/ipc-types/ipc-channels";
import type { IpcResponse } from "@shared/ipc-types/ipc-contracts";

interface IUseIpcMutationOptions<TResult, TError, TPayload>
  extends UseMutationOptions<TResult, TError, TPayload> {
  channel: IpcChannels;
}

export function useIpcMutation<TResult = void, TError = Error, TPayload = void>(
  options: IUseIpcMutationOptions<TResult, TError, TPayload>,
) {
  const { channel, ...mutationOptions } = options;

  return useMutation<TResult, TError, TPayload>({
    mutationFn: async (payload) => {
      const response: IpcResponse<TResult> = await window.electronIPC.invoke(
        channel,
        payload,
      );
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || "Unknown IPC error") as TError;
    },
    ...mutationOptions,
  });
}
