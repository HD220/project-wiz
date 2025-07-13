import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useChannelMessagesById } from "./use-channel-messages.hook";
import { useTyping } from "./use-typing.hook";
import type { 
  ChannelMessageDto,
  AISendMessageRequestDto,
  AISendMessageResponseDto,
  AIRegenerateMessageRequestDto,
  AIChatConfigDto
} from "../../../../shared/types/channel-message.types";

interface UseChannelChatProps {
  channelId: string;
  llmProviderId?: string;
  authorId: string;
  authorName: string;
  aiName?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeHistory?: boolean;
  historyLimit?: number;
}

interface UseChannelChatReturn {
  // Estado
  messages: ChannelMessageDto[];
  isLoading: boolean;
  isSending: boolean;
  isRegenerating: boolean;
  error: string | null;
  isTyping: boolean;
  
  // Ações principais
  sendMessage: (content: string, customConfig?: Partial<AIChatConfigDto>) => Promise<void>;
  regenerateLastMessage: (customConfig?: Partial<AIChatConfigDto>) => Promise<void>;
  
  // Controles de estado
  clearError: () => void;
  setTyping: (typing: boolean) => void;
  
  // Utilitários
  validateProvider: (providerId?: string) => Promise<boolean>;
  getConversationSummary: (messageLimit?: number) => Promise<string>;
  clearAIMessages: () => Promise<number>;
  
  // Configuração
  updateConfig: (newConfig: Partial<UseChannelChatProps>) => void;
  currentConfig: AIChatConfigDto | null;
}

export function useChannelChat(props: UseChannelChatProps): UseChannelChatReturn {
  const {
    channelId,
    llmProviderId,
    authorId,
    authorName,
    aiName,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 1000,
    includeHistory = true,
    historyLimit = 10,
  } = props;

  // Estados locais
  const [isSending, setIsSending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<ChannelMessageDto[]>([]);
  
  // Estado de digitando global persistente
  const { isTyping, setTyping } = useTyping(channelId);

  // Refs para evitar stale closures (usando props diretamente)
  const propsRef = useRef(props);
  propsRef.current = props;

  // Hook de mensagens do canal
  const {
    messages,
    isLoading,
    sendTextMessage,
    refetch,
    clearError: clearChannelError,
  } = useChannelMessagesById(channelId);

  // Não limpar typing no desmonte do componente para manter persistência
  // O typing será limpo apenas quando a operação terminar


  // Configuração atual para AI (memoizada)
  const currentConfig: AIChatConfigDto | null = useMemo(() => 
    llmProviderId ? {
      channelId,
      llmProviderId,
      systemPrompt,
      temperature,
      maxTokens,
      includeHistory,
      historyLimit,
    } : null,
    [channelId, llmProviderId, systemPrompt, temperature, maxTokens, includeHistory, historyLimit]
  );

  // Enviar mensagem com IA
  const sendMessage = useCallback(async (
    content: string,
    customConfig?: Partial<AIChatConfigDto>
  ): Promise<void> => {
    if (!llmProviderId) {
      throw new Error("LLM Provider não configurado");
    }

    if (!content.trim()) {
      throw new Error("Mensagem não pode estar vazia");
    }

    setError(null);

    // Criar mensagem otimista do usuário
    const optimisticUserMessage: ChannelMessageDto = {
      id: `temp-user-${Date.now()}`,
      content: content.trim(),
      channelId,
      authorId,
      authorName,
      type: "text",
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      metadata: {},
    };

    // Adicionar mensagem do usuário imediatamente à UI
    setOptimisticMessages(prev => [...prev, optimisticUserMessage]);

    try {
      const currentConfigValue = propsRef.current;
      
      const requestData: AISendMessageRequestDto = {
        content: content.trim(),
        channelId,
        llmProviderId: customConfig?.llmProviderId || llmProviderId,
        authorId,
        authorName,
        aiName,
        systemPrompt: customConfig?.systemPrompt || currentConfigValue.systemPrompt,
        temperature: customConfig?.temperature || currentConfigValue.temperature,
        maxTokens: customConfig?.maxTokens || currentConfigValue.maxTokens,
        includeHistory: customConfig?.includeHistory ?? currentConfigValue.includeHistory,
        historyLimit: customConfig?.historyLimit || currentConfigValue.historyLimit,
      };

      // Mostrar indicador de "digitando..."
      setTyping(true);

      // Enviar em background
      const response: AISendMessageResponseDto = await window.electronIPC.invoke(
        "channelMessage:ai:sendMessage",
        requestData
      );

      // Remover mensagens otimistas e atualizar com dados reais
      setOptimisticMessages([]);
      setTyping(false);
      
      // Atualizar mensagens reais
      await refetch();

      console.log("AI message sent successfully:", response);
    } catch (err) {
      // Remover mensagem otimista em caso de erro
      setOptimisticMessages([]);
      setTyping(false);
      
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Failed to send AI message:", err);
      throw err;
    }
  }, [channelId, llmProviderId, authorId, authorName, aiName, refetch]);

  // Regenerar última mensagem da IA
  const regenerateLastMessage = useCallback(async (
    customConfig?: Partial<AIChatConfigDto>
  ): Promise<void> => {
    if (!llmProviderId) {
      throw new Error("LLM Provider não configurado");
    }

    setIsRegenerating(true);
    setError(null);

    try {
      const currentConfigValue = propsRef.current;

      const requestData: AIRegenerateMessageRequestDto = {
        channelId,
        llmProviderId: customConfig?.llmProviderId || llmProviderId,
        authorId,
        authorName,
        systemPrompt: customConfig?.systemPrompt || currentConfigValue.systemPrompt,
        temperature: customConfig?.temperature || currentConfigValue.temperature,
        maxTokens: customConfig?.maxTokens || currentConfigValue.maxTokens,
      };

      const regeneratedMessage: ChannelMessageDto = await window.electronIPC.invoke(
        "channelMessage:ai:regenerateMessage",
        requestData
      );

      // Atualizar mensagens
      await refetch();

      console.log("AI message regenerated successfully:", regeneratedMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Failed to regenerate AI message:", err);
      throw err;
    } finally {
      setIsRegenerating(false);
    }
  }, [channelId, llmProviderId, authorId, authorName, refetch]);

  // Validar provider
  const validateProvider = useCallback(async (providerId?: string): Promise<boolean> => {
    try {
      const providerToValidate = providerId || llmProviderId;
      if (!providerToValidate) {
        return false;
      }

      return await window.electronIPC.invoke(
        "channelMessage:ai:validateProvider",
        providerToValidate
      );
    } catch (err) {
      console.error("Failed to validate provider:", err);
      return false;
    }
  }, [llmProviderId]);

  // Obter resumo da conversa
  const getConversationSummary = useCallback(async (messageLimit?: number): Promise<string> => {
    try {
      return await window.electronIPC.invoke(
        "channelMessage:ai:getConversationSummary",
        channelId,
        messageLimit?.toString()
      );
    } catch (err) {
      console.error("Failed to get conversation summary:", err);
      throw err;
    }
  }, [channelId]);

  // Limpar mensagens da IA
  const clearAIMessages = useCallback(async (): Promise<number> => {
    try {
      const deletedCount: number = await window.electronIPC.invoke(
        "channelMessage:ai:clearMessages",
        channelId
      );

      // Atualizar mensagens após limpeza
      await refetch();

      return deletedCount;
    } catch (err) {
      console.error("Failed to clear AI messages:", err);
      throw err;
    }
  }, [channelId, refetch]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
    clearChannelError();
  }, [clearChannelError]);

  // Atualizar configuração (simplificado)
  const updateConfig = useCallback((newConfig: Partial<UseChannelChatProps>) => {
    // Atualizar ref diretamente para evitar re-renders
    propsRef.current = { ...propsRef.current, ...newConfig };
  }, []);

  // Combinar mensagens reais com otimistas
  const allMessages = [...messages, ...optimisticMessages];

  return {
    // Estado
    messages: allMessages,
    isLoading,
    isSending,
    isRegenerating,
    error,
    isTyping,
    
    // Ações principais
    sendMessage,
    regenerateLastMessage,
    
    // Controles de estado
    clearError,
    setTyping,
    
    // Utilitários
    validateProvider,
    getConversationSummary,
    clearAIMessages,
    
    // Configuração
    updateConfig,
    currentConfig,
  };
}

// Hook simplificado para uso básico
export function useSimpleChannelChat(
  channelId: string,
  llmProviderId: string,
  authorId: string,
  authorName: string,
  systemPrompt?: string
) {
  return useChannelChat({
    channelId,
    llmProviderId,
    authorId,
    authorName,
    systemPrompt,
    temperature: 0.7,
    maxTokens: 1000,
    includeHistory: true,
    historyLimit: 10,
  });
}