import { PageTitle } from "@/components/page-title";
import * as AvatarComponents from "@/components/ui/avatar";

interface ConversationHeaderProps {
  agentName: string;
}

export function ConversationHeader({ agentName }: ConversationHeaderProps) {
  const titleIcon = (
    <AvatarComponents.Avatar className="w-5 h-5">
      <AvatarComponents.AvatarFallback className="text-xs">
        {agentName.slice(0, 2).toUpperCase()}
      </AvatarComponents.AvatarFallback>
    </AvatarComponents.Avatar>
  );

  return <PageTitle title={agentName} icon={titleIcon} />;
}
