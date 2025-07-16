import { Hash, AtSign } from "lucide-react";

import { PageTitle } from "@/components/page-title";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  displayName: string;
  isAgentChat: boolean;
}

export function ChatHeader({ displayName, isAgentChat }: ChatHeaderProps) {
  const titleIcon = isAgentChat ? (
    <Avatar className="w-5 h-5">
      <AvatarFallback className="text-xs">
        {displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  ) : (
    <Hash className="w-5 h-5 text-muted-foreground" />
  );

  return (
    <>
      <PageTitle title={displayName} icon={titleIcon} />
      {isAgentChat && (
        <div className="px-4 py-2 border-b">
          <Badge variant="secondary" className="text-xs">
            Agente IA
          </Badge>
        </div>
      )}
    </>
  );
}