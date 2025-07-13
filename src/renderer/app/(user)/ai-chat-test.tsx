import { createFileRoute } from "@tanstack/react-router";
import { AIChatExample } from "@/components/chat/ai-chat-example";

function AIChatTestPage() {
  // Canal de teste fixo para demonstração
  const testChannelId = "test-channel-001";
  const testAuthorId = "test-user";
  const testAuthorName = "Test User";

  return (
    <div className="p-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          AI Chat Integration Test
        </h1>
        <p className="text-muted-foreground">
          Esta página permite testar a integração completa do sistema AI Chat 
          com canais. Configure um LLM Provider nas configurações e teste 
          todas as funcionalidades.
        </p>
      </div>

      <AIChatExample 
        channelId={testChannelId}
        authorId={testAuthorId}
        authorName={testAuthorName}
      />
    </div>
  );
}

export const Route = createFileRoute("/(user)/ai-chat-test")({
  component: AIChatTestPage,
});