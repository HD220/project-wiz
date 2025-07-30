import { Hash, Bot } from "lucide-react";

import type { UserSummary } from "@/main/features/user/user.service";

import { NavigationItem } from "@/renderer/components/layout/navigation/navigation-item";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { ConversationList } from "@/renderer/features/conversation/components/conversation-list";
import type { ConversationWithLastMessage } from "@/renderer/types/chat.types";

interface SidebarNavigationProps {
  conversations: ConversationWithLastMessage[];
  availableUsers: UserSummary[];
}

export function SidebarNavigation(props: SidebarNavigationProps) {
  const { conversations, availableUsers } = props;

  return (
    <ScrollArea className="flex-1">
      <nav
        className="px-2 py-3 space-y-1"
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
        <div role="region" aria-label="Conversations" className="min-h-0">
          <ConversationList
            conversations={conversations}
            availableUsers={availableUsers}
          />
        </div>
      </nav>
    </ScrollArea>
  );
}
