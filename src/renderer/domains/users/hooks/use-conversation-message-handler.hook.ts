import { useState } from "react";

export function useConversationMessageHandler(
  sendMessage: (message: string) => Promise<void>,
  fullAgent: any,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  return {
    messageInput,
    setMessageInput,
    handleSend,
    handleKeyDown,
  };
}
