import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useChannelChat } from "@/domains/projects/hooks/use-channel-chat.hook";
import { AiChatProviderSelector } from "@/domains/projects/components/chat/ai-chat-provider-selector";
import { AiChatInput } from "@/domains/projects/components/chat/ai-chat-input";
import { AiChatStatus } from "@/domains/projects/components/chat/ai-chat-status";

interface AIChatExampleProps {
  channelId: string;
  authorId?: string;
  authorName?: string;
}

export function AIChatExample({
  channelId,
  authorId = "test-user",
  authorName = "Test User",
}: AIChatExampleProps) {
  const [selectedLlmProvider, setSelectedLlmProvider] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");

  const { sendMessage, isLoading, error } = useChannelChat(channelId);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedLlmProvider) return;

    try {
      await sendMessage({
        content: messageInput,
        authorId,
        authorName,
        llmProviderId: selectedLlmProvider,
      });
      setMessageInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Chat com IA - Exemplo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AiChatProviderSelector
          selectedProvider={selectedLlmProvider}
          onProviderChange={setSelectedLlmProvider}
        />

        <AiChatStatus isLoading={isLoading} error={error} />

        <AiChatInput
          value={messageInput}
          onChange={setMessageInput}
          onSend={handleSendMessage}
          disabled={isLoading || !selectedLlmProvider}
          placeholder="Digite sua pergunta para a IA..."
        />
      </CardContent>
    </Card>
  );
}
