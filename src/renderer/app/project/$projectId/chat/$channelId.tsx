import { createFileRoute } from "@tanstack/react-router";
import { ChatContainer } from "../../../../components/chat/chat-container";
import { useProjectChannels } from "@/features/communication/hooks/use-channels.hook";

export function ChannelChatPage() {
  const { projectId, channelId } = Route.useParams();
  const { channels } = useProjectChannels(projectId);
  
  // Find the current channel to get its real name
  const currentChannel = channels.find(ch => ch.id === channelId);

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