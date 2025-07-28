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
      className="flex-1 px-2 py-3 space-y-1 overflow-y-auto"
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

      <Separator className="my-3 bg-sidebar-border/40" />

      {/* Conversations List with enhanced container */}
      <div role="region" aria-label="Conversations" className="space-y-0">
        <ConversationList
          conversations={conversations}
          availableUsers={availableUsers}
        />
      </div>
    </nav>
  );
}
