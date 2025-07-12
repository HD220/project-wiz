import { useState } from "react";
import { useFeatureData } from "@/renderer/hooks/use-feature-data";
import { IDirectMessage } from "@/shared/ipc-types/domain-types";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type {
  IpcDirectMessagesListPayload,
  IpcDirectMessagesSendPayload,
} from "@/shared/ipc-types/ipc-payloads";

interface UseChatDataOptions {
  conversationId: string;
}

export function useChatData({ conversationId }: UseChatDataOptions) {
  const [senderId, receiverId] = conversationId.split("-");
  const [newMessage, setNewMessage] = useState("");

  const { data: messages, isLoading, error, mutate } = useFeatureData<
    IDirectMessage[],
    IpcDirectMessagesListPayload,
    IDirectMessage,
    IpcDirectMessagesSendPayload
  >({
    queryChannel: IpcChannel.DIRECT_MESSAGES_LIST,
    queryPayload: { senderId, receiverId },
    mutationChannel: IpcChannel.DIRECT_MESSAGES_SEND,
    onMutationSuccess: () => {
      setNewMessage("");
    },
    onMutationError: (err) => {
      alert(`Error sending message: ${err.message}`);
    },
  });

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim() || !mutate) {
      return;
    }
    mutate({ senderId, receiverId, content: newMessage });
  };

  return {
    messages: messages || [],
    isLoading,
    error,
    newMessage,
    setNewMessage,
    handleSendMessage,
    senderId,
  };
}