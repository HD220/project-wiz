import { createFileRoute } from "@tanstack/react-router";
import { ChatContainer } from "@/components/chat/chat-container";

export const Route = createFileRoute("/project/$projectId/chat/")({
  component: ProjectChatPage,
});

export function ProjectChatPage() { // Renamed component
  return (
    <div className="h-full">
      <ChatContainer channelId="channel-1" channelName="geral" />
    </div>
  );
}
