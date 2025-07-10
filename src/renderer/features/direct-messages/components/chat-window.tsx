import React, { useState, useEffect, useCallback } from "react";

import { IDirectMessage } from "@/shared/ipc-types/domain-types";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import MessageList from "./message-list";
import MessageInput from "./message-input";

interface ChatWindowProps {
  conversationId: string;
}

function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<IDirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [senderId, receiverId] = conversationId.split("-");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronIPC.invoke(
        IpcChannel.DIRECT_MESSAGES_LIST,
        {
          senderId,
          receiverId,
        },
      );
      if (result.success) {
        setMessages(result.data || []);
      } else {
        setError(result.error?.message || "An unknown error occurred");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [senderId, receiverId]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim()) {
      return;
    }

    try {
      const result = await window.electronIPC.invoke(
        IpcChannel.DIRECT_MESSAGES_SEND,
        {
          senderId,
          receiverId,
          content: newMessage,
        },
      );
      if (result.success) {
        setNewMessage("");
        fetchMessages();
      } else {
        alert(
          `Error sending message: ${result.error?.message || "An unknown error occurred"}`,
        );
      }
    } catch (err: unknown) {
      alert(`Error sending message: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, fetchMessages]);

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col h-full p-4">
      <MessageList messages={messages} senderId={senderId} />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}

export { ChatWindow };
