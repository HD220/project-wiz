import { Hash, Bot } from "lucide-react";

import { Separator } from "@/renderer/components/ui/separator";
import { ConversationSidebarList } from "@/renderer/features/conversation/components/conversation-sidebar-list";

import { NavigationItem } from "./navigation-item";

function SidebarNavigation() {
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
      <ConversationSidebarList />
    </div>
  );
}

export { SidebarNavigation };
