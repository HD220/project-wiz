import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  isActive: boolean;
}

export function useConversationMessageHandler(
  sendMessage: (message: string) => Promise<void>,
  fullAgent: Agent | null,
) {
  const [messageInput, setMessageInput] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !fullAgent) return;

    const messageToSend = messageInput.trim();
    setMessageInput("");

    try {
      await sendMessage(messageToSend);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageInput(messageToSend);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(event as unknown as React.FormEvent);
    }
  };

  return {
    messageInput,
    setMessageInput,
    handleSend,
    handleKeyDown,
  };
}
