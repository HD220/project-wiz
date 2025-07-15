import { useState, useCallback, useRef, useEffect } from "react";

import { useMessages } from "./use-messages.hook";

import type {
  MessageDto,
  CreateMessageDto,
} from "../../../../shared/types/message.types";

interface UseDirectMessageChatProps {
  conversationId: string;
}

interface UseDirectMessageChatReturn {
  // Estado
  messages: MessageDto[];
  isLoading: boolean;
  isSending: boolean;
  isTyping: boolean;
  error: string | null;

  // Ações principais
  sendMessage: (content: string) => Promise<void>;
  regenerateLastMessage: () => Promise<void>;

  // Controles de estado
  clearError: () => void;
  setTyping: (typing: boolean) => void;
}

export function useDirectMessageChat({
  conversationId,
}: UseDirectMessageChatProps): UseDirectMessageChatReturn {
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<MessageDto[]>(
    [],
  );

  // Hook de mensagens do banco
  const {
    messages: dbMessages,
    isLoading,
    createMessage,
    loadMessages,
  } = useMessages(conversationId);

  // Combinar mensagens do banco com otimistas, mas apenas para a conversa atual
  const messages = [
    ...dbMessages,
    ...optimisticMessages.filter(
      (msg) => msg.conversationId === conversationId,
    ),
  ];

  // Limpar mensagens otimistas quando trocar de conversa
  useEffect(() => {
    setOptimisticMessages([]);
    setError(null);
    setIsTyping(false);
  }, [conversationId]);

  // Enviar mensagem com agente
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) {
        throw new Error("Mensagem não pode estar vazia");
      }

      setError(null);
      setIsSending(true);

      // Criar mensagem otimista do usuário
      const optimisticUserMessage: MessageDto = {
        id: `temp-user-${Date.now()}`,
        content: content.trim(),
        senderId: "user",
        senderName: "João Silva",
        senderType: "user",
        conversationId,
        createdAt: new Date(),
        timestamp: new Date(),
      };

      // Adicionar mensagem do usuário imediatamente à UI (apenas para esta conversa)
      setOptimisticMessages((prev) => [...prev, optimisticUserMessage]);

      try {
        setIsTyping(true);

        // Enviar mensagem para o agente via IPC
        const response = await window.electronIPC.directMessages.sendAgent(
          conversationId,
          content.trim(),
          "user"
        );

        // Remover mensagens otimistas e recarregar do banco
        setOptimisticMessages([]);
        setIsTyping(false);

        // Recarregar mensagens para obter as mensagens reais do banco
        await loadMessages(conversationId);

        console.log("Agent response generated successfully:", response);
      } catch (err) {
        // Remover mensagem otimista em caso de erro
        setOptimisticMessages([]);
        setIsTyping(false);

        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        console.error("Failed to send message to agent:", err);
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, loadMessages],
  );

  // Regenerar última mensagem do agente
  const regenerateLastMessage = useCallback(async (): Promise<void> => {
    setError(null);
    setIsTyping(true);

    try {
      const regeneratedMessage = await window.electronIPC.directMessages.regenerateResponse(
        conversationId,
        "user"
      );

      // Recarregar mensagens
      await loadMessages(conversationId);

      console.log("Message regenerated successfully:", regeneratedMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Failed to regenerate message:", err);
      throw err;
    } finally {
      setIsTyping(false);
    }
  }, [conversationId, loadMessages]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    messages,
    isLoading,
    isSending,
    isTyping,
    error,

    // Ações principais
    sendMessage,
    regenerateLastMessage,

    // Controles de estado
    clearError,
    setTyping: setIsTyping,
  };
}
