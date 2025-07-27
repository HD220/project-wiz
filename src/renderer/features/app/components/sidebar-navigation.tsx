import { Hash, Bot } from "lucide-react";

import type { ConversationWithLastMessage } from "@/main/features/conversation/conversation.types";
import type { UserSummary } from "@/main/features/user/user.service";

import { Separator } from "@/renderer/components/ui/separator";
import { NavigationItem } from "@/renderer/features/app/components/navigation-item";
import { ConversationList } from "@/renderer/features/conversation/components/conversation-list";

interface SidebarNavigationProps {
  conversations: ConversationWithLastMessage[];
  availableUsers: UserSummary[];
}

export function SidebarNavigation(props: SidebarNavigationProps) {
  const { conversations, availableUsers } = props;

  return (
    <nav
      className="flex-1 p-3 space-y-1"
      role="navigation"
      aria-label="User navigation"
    >
      <NavigationItem
        to="/user"
        icon={Hash}
        label="Dashboard"
        activeOptions={{ exact: true }}
      />

      <NavigationItem to="/user/agents" icon={Bot} label="Agents" />

      <Separator className="my-3" />

      {/* Conversations List */}
      <div role="region" aria-label="Conversations">
        <ConversationList
          conversations={conversations}
          availableUsers={availableUsers}
        />
      </div>
    </nav>
  );
}
