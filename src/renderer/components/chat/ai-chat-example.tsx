import { useState } from "react";

import {
  AiChatInput,
  AiChatProviderSelector,
  AiChatStatus,
} from "@/domains/projects/components";
import { useChannelChat } from "@/domains/projects/hooks";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card/card-core";

interface AIChatExampleProps {
  channelId: string;
  authorId?: string;
  authorName?: string;
}

export function AIChatExample(props: AIChatExampleProps) {
  const { channelId, authorId = "test-user", authorName = "Test User" } = props;
  const [selectedLlmProvider, setSelectedLlmProvider] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");

  const { sendMessage, isLoading, error } = useChannelChat({
    channelId,
    authorId,
    authorName,
  });

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

        <AiChatStatus isLoading={isLoading} error={error?.message} />

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
