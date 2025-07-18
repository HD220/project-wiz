import { createFileRoute } from "@tanstack/react-router";

import { useProjectChannels } from "@/domains/projects/hooks";

import { ChatContainer } from "../../../../components/chat/chat-container";

export function ChannelChatPage() {
  const { projectId, channelId } = Route.useParams();
  const { channels } = useProjectChannels(projectId);

  // Find the current channel to get its real name
  const currentChannel = channels.find((ch) => ch.id === channelId);

  return (
    <ChatContainer
      channelId={channelId}
      channelName={currentChannel?.name || "Canal"}
      className="h-full"
    />
  );
}

export const Route = createFileRoute("/project/$projectId/chat/$channelId")({
  component: ChannelChatPage,
});
