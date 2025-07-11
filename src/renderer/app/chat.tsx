import { createFileRoute } from "@tanstack/react-router";
import { ChatContainer } from "@/components/chat/chat-container";

export const Route = createFileRoute("/chat")({
  component: ChatComponent,
});

function ChatComponent() {
  return <ChatContainer channelId="channel-1" channelName="geral" />;
}
