import React from "react";
import { useIpcQuery } from "@/renderer/hooks/use-ipc-query.hook";
import { IDirectMessage } from "@/shared/ipc-types/domain-types";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type { IpcDirectMessagesListPayload } from "@/shared/ipc-types/ipc-payloads";
import MessageList from "./message-list";
import MessageInput from "./message-input";

interface ChatWindowProps {
  conversationId: string;
}

function ChatWindow({ conversationId }: ChatWindowProps) {
  const [senderId, receiverId] = conversationId.split("-");

  const { data: messages, isLoading, error, refetch: fetchMessages } = useIpcQuery<IDirectMessage[], IpcDirectMessagesListPayload>({
    channel: IpcChannel.DIRECT_MESSAGES_LIST,
    payload: { senderId, receiverId },
  });

  const [newMessage, setNewMessage] = React.useState("");

  const { mutate: sendMessage } = useIpcMutation<IDirectMessage, Error, IpcDirectMessagesSendPayload>({
    channel: IpcChannel.DIRECT_MESSAGES_SEND,
    onSuccess: () => {
      setNewMessage("");
      fetchMessages();
    },
    onError: (err) => {
      alert(`Error sending message: ${err.message}`);
    },
  });

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim()) {
      return;
    }
    sendMessage({ senderId, receiverId, content: newMessage });
  };

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col h-full p-4">
      <MessageList messages={messages || []} senderId={senderId} />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}

export { ChatWindow };
