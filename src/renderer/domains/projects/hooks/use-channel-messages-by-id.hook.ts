import { useChannelMessagesByIdQueries } from "./use-channel-messages-by-id-queries.hook";
import { useChannelMessageStore } from "../stores/channel-message.store";
import { channelMessageService } from "../services/channel-message.service";

export function useChannelMessagesById(channelId: string) {
  const queriesResult = useChannelMessagesByIdQueries(channelId);
  const { selectedMessage, setSelectedMessage } = useChannelMessageStore();

  const updateMessage = async (data: any) => {
    await channelMessageService.update(data);
    queriesResult.refetch();
  };

  const deleteMessage = async (messageId: string) => {
    await channelMessageService.delete(messageId);
    queriesResult.refetch();
  };

  const getMessageById = async (id: string) => {
    return await channelMessageService.getById(id);
  };

  const getLastMessage = async () => {
    return await channelMessageService.getLastMessage(channelId);
  };

  const clearError = () => {
    // Error clearing is handled by TanStack Query automatically
  };

  return {
    ...queriesResult,
    selectedMessage,
    setSelectedMessage,
    updateMessage,
    deleteMessage,
    getMessageById,
    getLastMessage,
    clearError,
  };
}
