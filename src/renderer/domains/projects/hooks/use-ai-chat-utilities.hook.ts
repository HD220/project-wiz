import { useQuery } from "@tanstack/react-query";
import { aiChatService } from "../services/ai-chat.service";

export function useAiChatUtilities(channelId: string, llmProviderId?: string) {
  const validateProviderQuery = useQuery({
    queryKey: ["ai-provider", "validate", llmProviderId],
    queryFn: () => aiChatService.validateProvider(llmProviderId!),
    enabled: !!llmProviderId,
  });

  const getConversationSummary = async (messageLimit?: number) => {
    return await aiChatService.getConversationSummary(channelId, messageLimit);
  };

  const validateProvider = async (providerId?: string) => {
    const providerToValidate = providerId || llmProviderId;
    return providerToValidate
      ? await aiChatService.validateProvider(providerToValidate)
      : false;
  };

  return {
    isProviderValid: validateProviderQuery.data || false,
    validateProvider,
    getConversationSummary,
  };
}
