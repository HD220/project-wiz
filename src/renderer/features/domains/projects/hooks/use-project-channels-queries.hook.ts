import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { channelService } from "../services/channel.service";

import type { CreateChannelDto } from "../../../../shared/types/projects/channel.types";

export function useProjectChannelsQueries(projectId: string) {
  const queryClient = useQueryClient();

  const channelsQuery = useQuery({
    queryKey: ["channels", "project", projectId],
    queryFn: () => channelService.listByProject(projectId),
    enabled: !!projectId,
  });

  const createDefaultMutation = useMutation({
    mutationFn: (createdBy: string) =>
      channelService.createDefault(projectId, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channels", "project", projectId],
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<CreateChannelDto, "projectId">) =>
      channelService.create({ ...data, projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channels", "project", projectId],
      });
    },
  });

  const channels = channelsQuery.data || [];
  const generalChannel =
    channels.find((ch) => ch.name.toLowerCase() === "general") ||
    channels[0] ||
    null;

  return {
    channels,
    generalChannel,
    isLoading: channelsQuery.isLoading,
    error: channelsQuery.error?.message || null,
    createChannel: createMutation.mutateAsync,
    createDefaultChannel: createDefaultMutation.mutateAsync,
    refetch: channelsQuery.refetch,
  };
}
