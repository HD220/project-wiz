import { createFileRoute } from "@tanstack/react-router";
import { ChatContainer } from "@/components/chat/chat-container";

export const Route = createFileRoute("/chat")({
  component: ChatComponent,
});

function ChatComponent() {
  return (
    <div className="h-full">
      <ChatContainer channelId="channel-1" channelName="geral" />
    </div>
  );
}
