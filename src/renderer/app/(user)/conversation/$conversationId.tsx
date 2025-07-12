import { createFileRoute } from "@tanstack/react-router";
import { ConversationView } from "../../../features/direct-messages/components/conversation-view";

export function ConversationPage() {
  const { conversationId } = Route.useParams();

  return <ConversationView conversationId={conversationId} />;
}

export const Route = createFileRoute("/(user)/conversation/$conversationId")({
  component: ConversationPage,
});