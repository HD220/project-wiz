import { PageTitle } from "@/components/page-title";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ConversationHeaderProps {
  agentName: string;
}

export function ConversationHeader({ agentName }: ConversationHeaderProps) {
  const titleIcon = (
    <Avatar className="w-5 h-5">
      <AvatarFallback className="text-xs">
        {agentName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  return <PageTitle title={agentName} icon={titleIcon} />;
}
