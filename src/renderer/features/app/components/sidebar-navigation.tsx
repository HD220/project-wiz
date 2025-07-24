import { Hash, Bot } from "lucide-react";

import type { ConversationWithLastMessage } from "@/main/features/conversation/conversation.types";

import { Separator } from "@/renderer/components/ui/separator";
import { NavigationItem } from "@/renderer/features/app/components/navigation-item";
import { ConversationSidebarList } from "@/renderer/features/conversation/components/conversation-sidebar-list";

interface SidebarNavigationProps {
  conversations: ConversationWithLastMessage[];
  availableUsers: unknown[];
}

function SidebarNavigation(props: SidebarNavigationProps) {
  const { conversations, availableUsers } = props;

  return (
    <div className="flex-1 p-2 space-y-1">
      <NavigationItem
        to="/user"
        icon={Hash}
        label="Dashboard"
        activeOptions={{ exact: true }}
      />

      <NavigationItem to="/user/agents" icon={Bot} label="Agents" />

      <Separator className="my-2" />

      {/* Conversations List */}
      <ConversationSidebarList
        conversations={conversations}
        availableUsers={availableUsers}
      />
    </div>
  );
}

export { SidebarNavigation };
