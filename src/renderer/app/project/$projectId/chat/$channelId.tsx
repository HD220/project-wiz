import { createFileRoute } from "@tanstack/react-router";
import { ChatContainer } from "../../../../components/chat/chat-container";

export function ChannelChatPage() {
  const { projectId, channelId } = Route.useParams();

  return (
    <ChatContainer
      channelId={channelId}
      channelName={`Canal ${channelId}`} // TODO: Get real channel name
      className="h-full"
    />
  );
}

export const Route = createFileRoute("/project/$projectId/chat/$channelId")({
  component: ChannelChatPage,
});