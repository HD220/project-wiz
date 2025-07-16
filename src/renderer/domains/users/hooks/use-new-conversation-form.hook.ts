import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useConversations } from "./use-conversations.hook";
import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

export function useNewConversationForm(
  onClose: () => void,
  agents: AgentDto[] | undefined,
) {
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { findOrCreateDirectMessage } = useConversations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedAgent = agents?.find((a) => a.id === selectedAgentId);
      if (!selectedAgent) {
        console.error("Selected agent not found");
        return;
      }

      const conversation = await findOrCreateDirectMessage([
        "user",
        selectedAgent.name,
      ]);

      if (conversation) {
        setSelectedAgentId("");
        onClose();
        navigate({
          to: "/conversation/$conversationId",
          params: { conversationId: conversation.id },
        });
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedAgentId("");
      onClose();
    }
  };

  return {
    selectedAgentId,
    setSelectedAgentId,
    isSubmitting,
    handleSubmit,
    handleClose,
  };
}
