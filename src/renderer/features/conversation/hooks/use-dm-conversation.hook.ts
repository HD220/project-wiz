import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type {
  DMConversationWithParticipants,
  SelectMessage,
  AuthenticatedUser,
} from "@/renderer/features/conversation/types";

interface UseDmConversationProps {
  conversationId: string;
  initialConversation: DMConversationWithParticipants;
  initialMessages: SelectMessage[];
  currentUser: AuthenticatedUser;
}

export function useDmConversation({
  conversationId,
  initialConversation,
  initialMessages,
  currentUser,
}: UseDmConversationProps) {
  const router = useRouter();
  const [optimisticMessages, setOptimisticMessages] = useState(initialMessages);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Update optimistic messages when initial messages change (e.g., from loader)
  useEffect(() => {
    setOptimisticMessages(initialMessages);
  }, [initialMessages]);

  const sendMessage = async (input: string) => {
    if (!input.trim() || sendingMessage) return;

    setSendingMessage(true);

    const optimisticMessage: SelectMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      sourceType: "dm",
      sourceId: conversationId,
      authorId: currentUser.id,
      content: input.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setOptimisticMessages((prev) => [...prev, optimisticMessage]);

    try {
      await window.api.dm.sendMessage({
        dmId: conversationId,
        content: input.trim(),
      });
      router.invalidate(); // Invalidate to refetch messages from backend
    } catch (error) {
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id),
      );
      console.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  return {
    conversation: initialConversation,
    messages: optimisticMessages,
    currentUser,
    sendMessage,
    sendingMessage,
  };
}
