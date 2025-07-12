import { createFileRoute } from "@tanstack/react-router";
import { ChatContainer } from "../../../../components/chat/chat-container";

export function AgentChatPage() {
  const { projectId, agentId } = Route.useParams();

  return (
    <ChatContainer
      agentId={agentId}
      agentName={`Agent ${agentId}`} // TODO: Get real agent name
      className="h-full"
    />
  );
}

export const Route = createFileRoute("/project/$projectId/agent/$agentId")({
  component: AgentChatPage,
});