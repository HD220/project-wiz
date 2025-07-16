import { Hash, AtSign } from "lucide-react";

interface ChatEmptyStateProps {
  displayName: string;
  isAgentChat: boolean;
}

export function ChatEmptyState({ displayName, isAgentChat }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        {isAgentChat ? (
          <AtSign className="w-8 h-8 text-muted-foreground" />
        ) : (
          <Hash className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2">
        {isAgentChat
          ? `Este é o início da sua conversa com ${displayName}`
          : `Bem-vindo ao #${displayName}!`}
      </h3>
      <p className="text-muted-foreground">
        {isAgentChat
          ? "Comece uma conversa enviando uma mensagem abaixo."
          : "Este é o início do canal. Envie uma mensagem para começar a discussão."}
      </p>
    </div>
  );
}