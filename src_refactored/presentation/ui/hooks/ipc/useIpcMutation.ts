import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

import type { IPCResponse } from "@/shared/ipc-types";

/**
 * The mutation function that handles the IPC call.
 * It invokes the specified channel and processes the IPCResponse.
 * If the response is successful, it returns the data.
 * If the response is not successful, it throws an error.
 * @param channel The IPC channel to invoke.
 * @param params The parameters for the IPC call.
 * @returns The data from the successful IPC response.
 * @throws An error with the message from the failed IPC response.
 */
async function ipcMutationFn<TResponse, TRequest>(
  channel: string,
  params: TRequest
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

// Define a type for the hook's options, excluding mutationFn.
// This allows consumers to pass any other standard useMutation options like onSuccess, onError, etc.
type IpcMutationOptions<TResponse, TRequest> = Omit<
  UseMutationOptions<TResponse, Error, TRequest, unknown>,
  "mutationFn"
>;

/**
 * Custom hook to perform an IPC mutation using @tanstack/react-query.
 * It abstracts away the IPC communication details and the response unwrapping.
 *
 * @param channel The IPC channel to invoke.
 * @param options Optional react-query mutation options (onSuccess, onError, etc.).
 * @returns The result of the useMutation hook.
 */
export function useIpcMutation<TResponse, TRequest = void>(
  channel: string,
  options?: IpcMutationOptions<TResponse, TRequest>
) {
  const mutation = useMutation<TResponse, Error, TRequest, unknown>({
    mutationFn: (params: TRequest) => ipcMutationFn(channel, params),
    ...options,
  });

  return mutation;
}

