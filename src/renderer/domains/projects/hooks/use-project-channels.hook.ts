import { useProjectChannelsQueries } from "./use-project-channels-queries.hook";
import { useChannelStore } from "../stores/channel.store";
import { channelService } from "../services/channel.service";

export function useProjectChannels(projectId: string) {
  const queriesResult = useProjectChannelsQueries(projectId);
  const { selectedChannel, setSelectedChannel } = useChannelStore();

  const updateChannel = async (data: any) => {
    await channelService.update(data);
    queriesResult.refetch();
  };

  const archiveChannel = async (id: string) => {
    await channelService.archive(id);
    queriesResult.refetch();
  };

  const deleteChannel = async (id: string) => {
    await channelService.delete(id);
    queriesResult.refetch();
  };

  const getChannelById = async (id: string) => {
    return await channelService.getById(id);
  };

  const clearError = () => {
    // Error clearing is handled by TanStack Query automatically
  };

  return {
    ...queriesResult,
    selectedChannel,
    setSelectedChannel,
    updateChannel,
    archiveChannel,
    deleteChannel,
    getChannelById,
    clearError,
  };
}
