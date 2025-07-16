import { AtSign } from "lucide-react";

interface ConversationEmptyStateProps {
  agentName: string;
}

export function ConversationEmptyState({
  agentName,
}: ConversationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <AtSign className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">
        Este é o início da sua conversa com {agentName}
      </h3>
      <p className="text-muted-foreground">
        Comece uma conversa enviando uma mensagem abaixo.
      </p>
    </div>
  );
}
