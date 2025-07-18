import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { NewConversationModal } from "@/features/users/components/new-conversation-modal";

export function NewConversationPage() {
  const navigate = useNavigate();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Volta para a página anterior quando o modal é fechado
      navigate({ to: ".." });
    }
  };

  return <NewConversationModal open={true} onOpenChange={handleOpenChange} />;
}

export const Route = createFileRoute("/(user)/new-conversation")({
  component: NewConversationPage,
});
