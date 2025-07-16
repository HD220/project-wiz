import { Link } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import type { ConversationDto } from "../../../../shared/types/domains/users/message.types";

interface ConversationListItemProps {
  conversation: ConversationDto;
  otherParticipant: string;
  formattedTime: string;
}

export function ConversationListItem({
  conversation,
  otherParticipant,
  formattedTime,
}: ConversationListItemProps) {
  return (
    <Link
      to="/project/$projectId/conversation/$conversationId"
      params={{
        projectId: "1", // TODO: Get actual project ID
        conversationId: conversation.id,
      }}
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
        // isActive && "bg-muted",
      )}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://github.com/${otherParticipant}.png`} />
              <AvatarFallback>
                {otherParticipant[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">{otherParticipant}</p>
          </div>
          <div className={cn("ml-auto text-xs", "text-foreground")}>
            {formattedTime}
          </div>
        </div>
      </div>
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {conversation.lastMessageAt
          ? "Last message content..."
          : "No messages yet."}
      </div>
    </Link>
  );
}
