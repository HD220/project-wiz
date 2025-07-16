import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { channelService } from "../services/channel.service";
import type {
  ChannelDto,
  CreateChannelDto,
  UpdateChannelDto,
  ChannelFilterDto,
} from "../../../../shared/types/domains/projects/channel.types";

export function useChannelsQueries(filter?: ChannelFilterDto) {
  const queryClient = useQueryClient();

  const channelsQuery = useQuery({
    queryKey: ["channels", filter],
    queryFn: () => channelService.list(filter),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateChannelDto) => channelService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateChannelDto) => channelService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => channelService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => channelService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  return {
    channels: channelsQuery.data || [],
    isLoading: channelsQuery.isLoading,
    error: channelsQuery.error?.message || null,
    createChannel: createMutation.mutate,
    updateChannel: updateMutation.mutate,
    archiveChannel: archiveMutation.mutate,
    deleteChannel: deleteMutation.mutate,
    refetch: channelsQuery.refetch,
  };
}
