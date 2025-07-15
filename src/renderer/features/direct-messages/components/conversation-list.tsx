import { Link } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useConversations } from "../hooks/use-conversations.hook";

import type { ConversationDto } from "@/shared/types";

interface ConversationListProps {
  // No more callback props needed!
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationList({}: ConversationListProps) {
  const { conversations, isLoading } = useConversations({
    participantId: "user",
  });

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  const getOtherParticipant = (conversation: ConversationDto) => {
    return (
      conversation.participants.find((p: string) => p !== "user") || "Unknown"
    );
  };

  const formatLastMessageTime = (date?: Date) => {
    if (!date) return "";

    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return new Date(date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Ontem";
    } else if (days < 7) {
      return `${days}d atrás`;
    }
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation);

          return (
            <Link
              key={conversation.id}
              to="/conversation/$conversationId"
              params={{ conversationId: conversation.id }}
              className="block w-full px-2 py-3 text-left rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{
                className:
                  "block w-full px-2 py-3 text-left rounded-md transition-colors bg-secondary text-secondary-foreground",
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3 flex-shrink-0">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`/avatars/${otherParticipant}.png`} />
                    <AvatarFallback className="text-xs">
                      {otherParticipant.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium text-sm">
                      {otherParticipant}
                    </span>
                    {conversation.lastMessageAt && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatLastMessageTime(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    Mensagem direta
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {conversations.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Nenhuma conversa encontrada.
            <br />
            Clique no botão + para iniciar uma nova conversa.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
