import { ChatMessageProps } from "@/components/chat/chat-message"; // This import should remain for the ChatThread component's prop type
import { ChatThread } from "@/components/chat/chat-thread";
import { createFileRoute } from "@tanstack/react-router";
import { placeholderDirectMessages } from "@/lib/placeholders"; // Import from placeholders

export const Route = createFileRoute("/(logged)/user/dm/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  // The ChatThread component expects messages of type ChatMessageProps[].
  // Our placeholderDirectMessages (PlaceholderChatMessage[]) should be compatible.
  // If not, a mapping function would be needed, but their structures are aligned.
  return <ChatThread threadId={params.id} messages={placeholderDirectMessages} title={`Chat com Usuário ${params.id}`} />;
}
