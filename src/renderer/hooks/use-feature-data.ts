import { useCallback } from "react";
import { useIpcQuery } from "./use-ipc-query.hook";
import { useIpcMutation } from "./use-ipc-mutation.hook";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";

interface UseFeatureDataOptions<TData, TPayload, TMutationData, TMutationPayload> {
  queryChannel: IpcChannel;
  queryPayload?: TPayload;
  mutationChannel?: IpcChannel;
  onMutationSuccess?: (data: TMutationData) => void;
  onMutationError?: (error: Error) => void;
  enabled?: boolean;
}

export function useFeatureData<TData, TPayload, TMutationData = unknown, TMutationPayload = unknown>({
  queryChannel,
  queryPayload,
  mutationChannel,
  onMutationSuccess,
  onMutationError,
  enabled = true,
}: UseFeatureDataOptions<TData, TPayload, TMutationData, TMutationPayload>) {
  const query = useIpcQuery<TData, TPayload>({
    channel: queryChannel,
    payload: queryPayload,
    enabled,
  });

  const mutation = mutationChannel ? useIpcMutation<TMutationData, Error, TMutationPayload>({
    channel: mutationChannel,
    onSuccess: (data) => {
      onMutationSuccess?.(data);
      query.refetch();
    },
    onError: onMutationError,
  }) : null;

  const refresh = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: refresh,
    mutate: mutation?.mutate,
    isMutating: mutation?.isPending || false,
  };
}