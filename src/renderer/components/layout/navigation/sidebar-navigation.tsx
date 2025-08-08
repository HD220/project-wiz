import { Hash, Bot } from "lucide-react";

import { NavigationItem } from "@/renderer/components/layout/navigation/navigation-item";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { ConversationSection } from "@/renderer/features/conversation";

export function SidebarNavigation() {

  return (
    <ScrollArea className="flex-1">
      <nav
        className="px-[var(--spacing-component-sm)] py-[var(--spacing-component-md)] space-y-[var(--spacing-component-xs)]"
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

        <Separator className="my-[var(--spacing-component-md)] bg-sidebar-border/40" />

        {/* Conversations Section - self-contained */}
        <ConversationSection 
          className="min-h-0 w-full overflow-hidden"
        />
      </nav>
    </ScrollArea>
  );
}
