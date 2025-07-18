import { createFileRoute } from "@tanstack/react-router";

import { ConversationView } from "@/features/users/components";
import { ConversationSkeleton } from "@/features/users/components/skeletons/conversation-skeleton";

export function ConversationPage() {
  const { conversationId } = Route.useParams();
  const { conversation } = Route.useLoaderData();

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <h3 className="font-semibold text-lg mb-2">
            Conversa não encontrada
          </h3>
          <p>A conversa solicitada não foi encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <ConversationView
      conversationId={conversationId}
      conversation={conversation}
    />
  );
}

export const Route = createFileRoute("/(user)/conversation/$conversationId")({
  component: ConversationPage,
  pendingComponent: ConversationSkeleton,
  loader: async ({ params }) => {
    const { conversationService } = await import(
      "../../../users/services/conversation.service"
    );
    const conversation = await conversationService.getById(
      params.conversationId,
    );
    return {
      conversation,
    };
  },
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-destructive">
        <h3 className="font-semibold text-lg mb-2">
          Erro ao carregar conversa
        </h3>
        <p>{error.message}</p>
      </div>
    </div>
  ),
});
