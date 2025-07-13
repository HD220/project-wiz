import React from 'react';
import { useChannelChat } from '../../channel-messaging/hooks/use-channel-chat.hook';
import { useLlmProviders } from '../../llm-provider-management/hooks/use-llm-provider.hook';
import { usePersonas } from '../../persona-management/hooks/use-personas.hook';
import type { ConversationDto } from '../../../../shared/types/message.types';

interface UsePersonaChatProps {
  conversationId: string;
  conversation?: ConversationDto;
}

export const usePersonaChat = ({ conversationId, conversation }: UsePersonaChatProps) => {
  const { llmProviders } = useLlmProviders();
  const { activePersonas } = usePersonas();
  
  // Get persona info from conversation participants
  const getPersonaForConversation = () => {
    if (!conversation) return null;
    
    const participantId = conversation.participants.find((p: string) => p !== "user");
    if (!participantId) return null;
    
    // First try to find by name (for conversations created with name)
    const personaByName = activePersonas?.find(p => p.nome === participantId);
    if (personaByName) return personaByName;
    
    // Then try to find by ID (for conversations created with UUID)
    const personaById = activePersonas?.find(p => p.id === participantId);
    if (personaById) return personaById;
    
    return null;
  };
  
  const persona = getPersonaForConversation();
  
  // Use the LLM provider assigned to this persona, or fallback to default provider, or first available
  const getSelectedLlmProvider = async () => {
    // 1. Use persona's specific provider if available
    if (persona?.llmProviderId) {
      return persona.llmProviderId;
    }
    
    // 2. Try to get default provider
    try {
      const defaultProvider = await window.electronIPC?.invoke('llm-provider:getDefault');
      if (defaultProvider?.id) {
        return defaultProvider.id;
      }
    } catch (error) {
      console.warn('Failed to get default provider:', error);
    }
    
    // 3. Fallback to first available provider
    return llmProviders[0]?.id || "";
  };
  
  const [selectedLlmProvider, setSelectedLlmProvider] = React.useState<string>("");
  
  // Initialize provider selection
  React.useEffect(() => {
    getSelectedLlmProvider().then(setSelectedLlmProvider);
  }, [persona?.llmProviderId, llmProviders]);
  
  // Use the new channel chat hook with persona-specific configuration
  const channelChatHook = useChannelChat({
    channelId: conversationId, // Use conversation ID as channel ID
    llmProviderId: selectedLlmProvider,
    authorId: "user",
    authorName: "João Silva",
    aiName: persona?.nome || "AI Assistant",
    systemPrompt: persona ? `Você é ${persona.nome}. ${persona.papel}.

Seu objetivo: ${persona.goal}

Sua história: ${persona.backstory}

Responda sempre de acordo com sua personalidade, papel e objetivos. Mantenha consistência com sua história e seja natural na conversa.` : "Você é um assistente útil e amigável.",
    temperature: 0.7,
    maxTokens: 1000,
    includeHistory: true,
    historyLimit: 20,
  });
  
  return {
    ...channelChatHook,
    // Alias some methods for backward compatibility
    regenerateLastResponse: channelChatHook.regenerateLastMessage,
    validatePersona: channelChatHook.validateProvider,
    // Additional persona info
    persona: persona ? { id: persona.id, name: persona.nome } : { id: 'unknown', name: 'AI Assistant' },
    fullPersona: persona,
  };
};